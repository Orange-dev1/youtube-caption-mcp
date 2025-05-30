#!/usr/bin/env node

// ローカルテスト用のシンプルなMCPサーバー
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class TestYouTubeCaptionMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'youtube-caption-mcp-test',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // ツール一覧の提供
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_video_info',
            description: 'YouTube動画の基本情報を取得します（テスト版）',
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
            name: 'test_echo',
            description: 'テスト用のエコー機能',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'エコーするメッセージ',
                },
              },
              required: ['message'],
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
          case 'test_echo':
            return await this.handleTestEcho(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  async handleGetVideoInfo(args) {
    const { video_id } = args;
    
    // テスト用のモックデータを返す
    const mockVideoInfo = {
      id: video_id,
      title: 'テスト動画タイトル',
      description: 'これはテスト用の動画説明です。',
      channel: 'テストチャンネル',
      duration: '3:45',
      publishedAt: '2024年1月1日',
      viewCount: '1.2M',
      thumbnail: 'https://example.com/thumbnail.jpg',
      language: 'ja',
      note: 'これはテスト用のモックデータです。実際のYouTube APIは現在調整中です。'
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockVideoInfo, null, 2),
        },
      ],
    };
  }

  async handleTestEcho(args) {
    const { message } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${message}`,
        },
      ],
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      console.log('Shutting down test MCP server...');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Test YouTube Caption MCP Server running on stdio');
  }
}

async function main() {
  try {
    const server = new TestYouTubeCaptionMCPServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start test server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});
