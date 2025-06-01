import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { workingYouTubeClient } from './services/youtube-client-working.js';
import { defaultCacheManager, CacheManager } from './services/cache-manager.js';
import { CaptionParser } from './services/caption-parser.js';
import {
  validateRequest,
  GetVideoInfoRequestSchema,
  GetCaptionsListRequestSchema,
  DownloadCaptionsRequestSchema,
  SearchVideosRequestSchema,
} from './utils/validators.js';
import { MCPError } from './types/errors.js';

export class YouTubeCaptionMCPServer {
  private server: Server;
  private youtubeClient: typeof workingYouTubeClient;
  private cacheManager: CacheManager;

  constructor() {
    this.server = new Server(
      {
        name: 'youtube-caption-mcp',
        version: '0.1.7',
      },
      {
        capabilities: {
          tools: {
            get_video_info: {
              description: 'YouTube動画の基本情報を取得します',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube動画IDまたはURL',
                  },
                },
                required: ['video_id'],
              },
            },
            get_captions_list: {
              description: '動画で利用可能な字幕一覧を取得します',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube動画IDまたはURL',
                  },
                },
                required: ['video_id'],
              },
            },
            download_captions: {
              description: '指定された動画の字幕をダウンロードします',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube動画IDまたはURL',
                  },
                  lang: {
                    type: 'string',
                    description: '字幕の言語コード（例: ja, en）',
                    default: 'ja',
                  },
                  format: {
                    type: 'string',
                    enum: ['raw', 'srt', 'vtt'],
                    description: '字幕の出力形式',
                    default: 'raw',
                  },
                },
                required: ['video_id'],
              },
            },
            search_videos_with_captions: {
              description: '字幕付きの動画を検索します',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: '検索クエリ',
                  },
                  lang: {
                    type: 'string',
                    description: '字幕の言語フィルタ（例: ja, en）',
                  },
                  limit: {
                    type: 'number',
                    description: '検索結果の最大数',
                    minimum: 1,
                    maximum: 50,
                    default: 10,
                  },
                },
                required: ['query'],
              },
            },
          },
        },
      }
    );

    this.youtubeClient = workingYouTubeClient;
    this.cacheManager = defaultCacheManager;

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // ツール一覧の提供
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_video_info',
            description: 'YouTube動画の基本情報を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube動画IDまたはURL',
                },
              },
              required: ['video_id'],
            },
          },
          {
            name: 'get_captions_list',
            description: '動画で利用可能な字幕一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube動画IDまたはURL',
                },
              },
              required: ['video_id'],
            },
          },
          {
            name: 'download_captions',
            description: '指定された動画の字幕をダウンロードします',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube動画IDまたはURL',
                },
                lang: {
                  type: 'string',
                  description: '字幕の言語コード（例: ja, en）',
                  default: 'ja',
                },
                format: {
                  type: 'string',
                  enum: ['raw', 'srt', 'vtt'],
                  description: '字幕の出力形式',
                  default: 'raw',
                },
              },
              required: ['video_id'],
            },
          },
          {
            name: 'search_videos_with_captions',
            description: '字幕付きの動画を検索します',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '検索クエリ',
                },
                lang: {
                  type: 'string',
                  description: '字幕の言語フィルタ（例: ja, en）',
                },
                limit: {
                  type: 'number',
                  description: '検索結果の最大数',
                  minimum: 1,
                  maximum: 50,
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // ツール実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_video_info':
            return await this.handleGetVideoInfo(args);
          case 'get_captions_list':
            return await this.handleGetCaptionsList(args);
          case 'download_captions':
            return await this.handleDownloadCaptions(args);
          case 'search_videos_with_captions':
            return await this.handleSearchVideos(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof MCPError) {
          throw new McpError(ErrorCode.InternalError, error.message, error.toJSON());
        }
        
        console.error(`Error in tool ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  private async handleGetVideoInfo(args: unknown) {
    const { video_id } = validateRequest(GetVideoInfoRequestSchema, args);
    
    // キャッシュチェック
    const cacheKey = CacheManager.videoInfoKey(video_id);
    const cached = this.cacheManager.get(cacheKey);
    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cached, null, 2),
          },
        ],
      };
    }

    // YouTube APIから取得
    const videoInfo = await this.youtubeClient.getVideoInfo(video_id);
    
    // キャッシュに保存
    this.cacheManager.set(cacheKey, videoInfo, CacheManager.TTL.VIDEO_INFO);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(videoInfo, null, 2),
        },
      ],
    };
  }

  private async handleGetCaptionsList(args: unknown) {
    const { video_id } = validateRequest(GetCaptionsListRequestSchema, args);
    
    // キャッシュチェック
    const cacheKey = CacheManager.captionsListKey(video_id);
    const cached = this.cacheManager.get(cacheKey);
    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cached, null, 2),
          },
        ],
      };
    }

    // YouTube APIから取得
    const captionsList = await this.youtubeClient.getCaptionsList(video_id);
    
    // キャッシュに保存
    this.cacheManager.set(cacheKey, captionsList, CacheManager.TTL.CAPTIONS_LIST);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(captionsList, null, 2),
        },
      ],
    };
  }

  private async handleDownloadCaptions(args: unknown) {
    const { video_id, lang = 'ja', format = 'raw' } = validateRequest(DownloadCaptionsRequestSchema, args);
    
    // キャッシュチェック
    const cacheKey = CacheManager.captionsDataKey(video_id, lang, format);
    const cached = this.cacheManager.get(cacheKey);
    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cached, null, 2),
          },
        ],
      };
    }

    // YouTube APIから取得
    const captionsData = await this.youtubeClient.downloadCaptions(video_id, lang, format);
    
    // フォーマット変換を適用
    const formattedCaptions = CaptionParser.formatCaptions(captionsData);
    
    // キャッシュに保存
    this.cacheManager.set(cacheKey, formattedCaptions, CacheManager.TTL.CAPTIONS_DATA);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedCaptions, null, 2),
        },
      ],
    };
  }

  private async handleSearchVideos(args: unknown) {
    const { query, lang, limit } = validateRequest(SearchVideosRequestSchema, args);
    
    // キャッシュチェック
    const cacheKey = CacheManager.searchKey(query, lang);
    const cached = this.cacheManager.get(cacheKey);
    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cached, null, 2),
          },
        ],
      };
    }

    // YouTube APIから取得
    const searchResults = await this.youtubeClient.searchVideosWithCaptions(query, lang, limit);
    
    // キャッシュに保存
    this.cacheManager.set(cacheKey, searchResults, CacheManager.TTL.SEARCH_RESULTS);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(searchResults, null, 2),
        },
      ],
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      console.log('Shutting down MCP server...');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('YouTube Caption MCP Server running on stdio');
  }
}
