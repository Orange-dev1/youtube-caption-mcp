#!/usr/bin/env node

import { YouTubeCaptionMCPServer } from './server.js';

async function main() {
  try {
    const server = new YouTubeCaptionMCPServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start YouTube Caption MCP Server:', error);
    process.exit(1);
  }
}

// プロセス終了時のクリーンアップ
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});
