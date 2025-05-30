# YouTube字幕MCPサーバー プロジェクト概要

## プロジェクト名
YouTube Caption MCP Server

## 目的
Claude Desktop向けにYouTube動画の字幕情報を取得するMCPサーバーを開発する。youtube-jsライブラリを使用してAPIキー不要で動作させる。

## 技術スタック
- **言語**: TypeScript
- **コアライブラリ**: youtubei-js (youtube-jsの後継)
- **MCPフレームワーク**: @modelcontextprotocol/sdk
- **ランタイム**: Node.js 18+
- **モジュール形式**: ES Modules

## 主要機能
1. **get_video_info**: YouTube動画の基本情報取得
2. **get_captions_list**: 利用可能な字幕トラック一覧取得
3. **download_captions**: 字幕データのダウンロード（SRT、VTT、Raw形式対応）
4. **search_videos_with_captions**: 字幕付き動画の検索

## アーキテクチャ
```
Claude Desktop
    ↓ (MCP Protocol)
YouTube Caption MCP Server
    ↓ (youtubei-js)
YouTube Internal API
```

## 配布方法
- NPMパッケージとしてグローバルインストール対応
- Claude Desktop設定での簡単セットアップ

## 品質要件
- エラーハンドリングの充実
- キャッシュ機能による性能向上
- 入力検証とセキュリティ対策
- 包括的なテストカバレッジ
