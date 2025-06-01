this is vibe coded BE CAREFUL


# YouTube Caption MCP Server
Vive
An MCP server for Cursor to retrieve YouTube video captions. Access YouTube video caption information without requiring an API key.

## Features

- **No API Key Required**: Access YouTube's internal API using the youtube-js library
- **Multilingual Support**: Automatic detection and retrieval of available caption languages
- **Format Conversion**: Caption output in Raw, SRT, and VTT formats
- **Caching**: In-memory caching for improved performance
- **Claude Integration**: Seamless integration via MCP protocol

## Installation

### Install from NPM

```bash
npm install -g @iamyosuke/youtube-caption-mcp
```

### Build from Source

```bash
git clone https://github.com/iamyosuke/youtube-caption-mcp.git
cd youtube-caption-mcp
npm install
npm run build
```


### Cursor Configuration

Add the following to your Cursor configuration file (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "youtube-caption-mcp": {
      "command": "npx",
      "args": ["-y", "youtube-caption-mcp", "--stdio"],
      "env": {
        "CACHE_ENABLED": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```



## Available Tools

### 1. get_video_info

Retrieves basic information about a YouTube video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 2. get_captions_list

Retrieves a list of available captions for a video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 3. download_captions

Downloads captions for a specified video.

**Parameters:**
- `video_id` (required): YouTube video ID or URL
- `lang` (optional): Caption language code (default: "ja")
- `format` (optional): Output format - "raw", "srt", "vtt" (default: "raw")

**Example:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "lang": "ja",
  "format": "srt"
}
```

### 4. search_videos_with_captions

Searches for videos with captions.

**Parameters:**
- `query` (required): Search query
- `lang` (optional): Caption language filter
- `limit` (optional): Maximum number of search results (1-50, default: 10)

**Example:**
```json
{
  "query": "programming tutorial",
  "lang": "en",
  "limit": 5
}
```

## Supported URL Formats

The following YouTube URL formats are supported:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11-character video ID)

## Environment Variables

| Variable Name | Default Value | Description |
|---------------|---------------|-------------|
| `CACHE_ENABLED` | `true` | Enable/disable caching |
| `CACHE_DEFAULT_TTL` | `3600` | Default cache retention time (seconds) |
| `CACHE_MAX_KEYS` | `1000` | Maximum number of cache keys |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |

## Development

### Setup Development Environment

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Lint & Format

```bash
npm run lint
npm run format
```

## License

MIT License

## Contributions

Pull requests and issue reports are welcome.

## Disclaimer

**Note**: This project was vibe coded for three hours on a weekend and hasn't been thoroughly tested. Use in production environments at your own risk.

## Caution

- Please use this tool in accordance with YouTube's Terms of Service
- Handle copyrighted content appropriately
- Be mindful of rate limits when sending many requests

## Troubleshooting

### Common Issues

1. **Video Not Found**
   - Check if the video ID or URL is correct
   - Check if the video is publicly available

2. **Cannot Get Captions**
   - Check if the video has captions
   - Check if the specified language captions are available

3. **Slow Performance**
   - Check if caching is enabled
   - Check your network connection

### Checking Logs

To view detailed logs, set the environment variable `LOG_LEVEL=debug`:

```bash
LOG_LEVEL=debug npx @iamyosuke/youtube-caption-mcp
```

---

# YouTube字幕MCPサーバー

Cusor 向けのYouTube動画字幕取得MCPサーバーです。APIキー不要でYouTube動画の字幕情報を取得できます。

## 特徴

- **APIキー不要**: youtube-jsライブラリを使用してYouTubeの内部APIにアクセス
- **多言語対応**: 利用可能な字幕言語の自動検出と取得
- **フォーマット変換**: Raw、SRT、VTT形式での字幕出力
- **キャッシュ機能**: パフォーマンス向上のためのインメモリキャッシュ
- **Claude統合**: MCPプロトコルによるシームレスな連携

## インストール

### NPMからインストール

```bash
npm install -g @iamyosuke/youtube-caption-mcp
```

### ソースからビルド

```bash
git clone https://github.com/iamyosuke/youtube-caption-mcp.git
cd youtube-caption-mcp
npm install
npm run build
```


### Cursor設定

Cursorの設定ファイル（`.cursor/mcp.json`）に以下を追加してください：

```json
{
  "mcpServers": {
    "youtube-caption-mcp": {
      "command": "npx",
      "args": ["-y", "youtube-caption-mcp", "--stdio"],
      "env": {
        "CACHE_ENABLED": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```



## 利用可能なツール

### 1. get_video_info

YouTube動画の基本情報を取得します。

**パラメータ:**
- `video_id` (必須): YouTube動画IDまたはURL

**例:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 2. get_captions_list

動画で利用可能な字幕一覧を取得します。

**パラメータ:**
- `video_id` (必須): YouTube動画IDまたはURL

**例:**
```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

### 3. download_captions

指定された動画の字幕をダウンロードします。

**パラメータ:**
- `video_id` (必須): YouTube動画IDまたはURL
- `lang` (オプション): 字幕の言語コード（デフォルト: "ja"）
- `format` (オプション): 出力形式 - "raw", "srt", "vtt"（デフォルト: "raw"）

**例:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "lang": "ja",
  "format": "srt"
}
```

### 4. search_videos_with_captions

字幕付きの動画を検索します。

**パラメータ:**
- `query` (必須): 検索クエリ
- `lang` (オプション): 字幕の言語フィルタ
- `limit` (オプション): 検索結果の最大数（1-50、デフォルト: 10）

**例:**
```json
{
  "query": "プログラミング チュートリアル",
  "lang": "ja",
  "limit": 5
}
```

## 対応URL形式

以下のYouTube URL形式に対応しています：

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11文字の動画ID)

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `CACHE_ENABLED` | `true` | キャッシュ機能の有効/無効 |
| `CACHE_DEFAULT_TTL` | `3600` | デフォルトキャッシュ保持時間（秒） |
| `CACHE_MAX_KEYS` | `1000` | 最大キャッシュキー数 |
| `LOG_LEVEL` | `info` | ログレベル（debug, info, warn, error） |

## 開発

### 開発環境のセットアップ

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### テストの実行

```bash
npm test
```

### ビルド

```bash
npm run build
```

### リント・フォーマット

```bash
npm run lint
npm run format
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## 免責事項

**注意**: このプロジェクトは週末の3時間で作成されたものであり、十分なテストが行われていません。本番環境での使用は自己責任でお願いします。

## 注意事項

- このツールはYouTubeの利用規約に従って使用してください
- 著作権保護されたコンテンツの適切な取り扱いにご注意ください
- 大量のリクエストを送信する際は、レート制限にご注意ください

## トラブルシューティング

### よくある問題

1. **動画が見つからない**
   - 動画IDまたはURLが正しいか確認してください
   - 動画が公開されているか確認してください

2. **字幕が取得できない**
   - 動画に字幕が存在するか確認してください
   - 指定した言語の字幕が利用可能か確認してください

3. **パフォーマンスが遅い**
   - キャッシュが有効になっているか確認してください
   - ネットワーク接続を確認してください

### ログの確認

詳細なログを確認するには、環境変数 `LOG_LEVEL=debug` を設定してください。

```bash
LOG_LEVEL=debug npx @iamyosuke/youtube-caption-mcp
