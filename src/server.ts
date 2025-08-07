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
              description: 'Get basic information of a YouTube video',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube video ID or URL',
                  },
                },
                required: ['video_id'],
              },
            },
            get_captions_list: {
              description: 'Get list of available captions for a video',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube video ID or URL',
                  },
                },
                required: ['video_id'],
              },
            },
            download_captions: {
              description: 'Download captions for the specified video',
              inputSchema: {
                type: 'object',
                properties: {
                  video_id: {
                    type: 'string',
                    description: 'YouTube video ID or URL',
                  },
                  lang: {
                    type: 'string',
                    description: 'Caption language code (e.g., ja, en)',
                    default: 'en',
                  },
                  format: {
                    type: 'string',
                    enum: ['raw', 'srt', 'vtt'],
                    description: 'Caption output format',
                    default: 'raw',
                  },
                },
                required: ['video_id', 'lang'],
              },
            },
            search_videos_with_captions: {
              description: 'Search for videos with captions',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search query',
                  },
                  lang: {
                    type: 'string',
                    description: 'Caption language filter (e.g., ja, en)',
                  },
                  limit: {
                    type: 'number',
                    description: 'Maximum number of search results',
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
    // Provide list of tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_video_info',
            description: 'Get basic information of a YouTube video',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube video ID or URL',
                },
              },
              required: ['video_id'],
            },
          },
          {
            name: 'get_captions_list',
            description: 'Get list of available captions for a video',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube video ID or URL',
                },
              },
              required: ['video_id'],
            },
          },
          {
            name: 'download_captions',
            description: 'Download captions for the specified video',
            inputSchema: {
              type: 'object',
              properties: {
                video_id: {
                  type: 'string',
                  description: 'YouTube video ID or URL',
                },
                lang: {
                  type: 'string',
                  description: 'Caption language code (e.g., ja, en)',
                },
                format: {
                  type: 'string',
                  enum: ['raw', 'srt', 'vtt'],
                  description: 'Caption output format',
                  default: 'raw',
                },
              },
              required: ['video_id', 'lang'],
            },
          },
          {
            name: 'search_videos_with_captions',
            description: 'Search for videos with captions',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                lang: {
                  type: 'string',
                  description: 'Caption language filter (e.g., ja, en)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of search results',
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

    // Tool execution handler
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
    
    // Check cache
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

    // Get from YouTube API
    const videoInfo = await this.youtubeClient.getVideoInfo(video_id);
    
    // Save to cache
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
    
    // Check cache
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

    // Get from YouTube API
    const captionsList = await this.youtubeClient.getCaptionsList(video_id);
    
    // Save to cache
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
    const { video_id, lang, format = 'raw' } = validateRequest(DownloadCaptionsRequestSchema, args);
    
    // Check cache
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

    // Get from YouTube API
    const captionsData = await this.youtubeClient.downloadCaptions(video_id, lang, format);
    
    // Apply format conversion
    const formattedCaptions = CaptionParser.formatCaptions(captionsData);
    
    // Save to cache
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
    
    // Check cache
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

    // Get from YouTube API
    const searchResults = await this.youtubeClient.searchVideosWithCaptions(query, lang, limit);
    
    // Save to cache
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
