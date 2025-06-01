# YouTube Caption MCP Server

Claude Desktop向けのYouTube動画字幕取得MCPサーバーです。APIキー不要でYouTube動画の字幕情報を取得できます。

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

## Claude Desktop設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加してください：

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["@iamyosuke/youtube-caption-mcp"],
      "env": {
        "CACHE_ENABLED": "true",
        "LOG_LEVEL": "info"
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
