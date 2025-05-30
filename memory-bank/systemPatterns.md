# システムパターン

## アーキテクチャパターン

### レイヤードアーキテクチャ
```
┌─────────────────────────────────┐
│        MCP Protocol Layer       │  ← Claude Desktop通信
├─────────────────────────────────┤
│         Tools Layer             │  ← MCPツール実装
├─────────────────────────────────┤
│        Services Layer           │  ← ビジネスロジック
├─────────────────────────────────┤
│        Client Layer             │  ← YouTube API通信
└─────────────────────────────────┘
```

### 主要コンポーネント設計

#### MCPサーバー (server.ts)
- MCPプロトコルの実装
- ツールの登録と管理
- エラーハンドリングの統一

#### YouTubeクライアント (youtube-client.ts)
- youtubei-jsのラッパー
- 接続管理とレート制限
- エラーの標準化

#### キャッシュマネージャー (cache-manager.ts)
- メモリキャッシュの管理
- TTL設定とキー管理
- キャッシュ戦略の実装

#### 字幕パーサー (caption-parser.ts)
- Raw → SRT/VTT変換
- タイムスタンプ処理
- フォーマット検証

## データフローパターン

### 動画情報取得フロー
```
Input Validation → Cache Check → YouTube API → Data Transform → Response
```

### 字幕取得フロー
```
URL Parse → Video Info → Caption List → Caption Download → Format Convert → Cache Store → Response
```

## エラーハンドリングパターン

### エラー階層
```
MCPError (基底クラス)
├── ValidationError (入力検証エラー)
├── YouTubeError (YouTube API関連)
│   ├── VideoNotFoundError
│   ├── CaptionsNotAvailableError
│   └── AccessDeniedError
├── CacheError (キャッシュ関連)
└── SystemError (システム内部エラー)
```

### エラーレスポンス統一
```typescript
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: Record<string, any>;
    suggestion?: string;
  }
}
```

## キャッシュパターン

### キャッシュ戦略
- **動画メタデータ**: 1時間 (変更頻度低)
- **字幕データ**: 24時間 (ほぼ不変)
- **検索結果**: 30分 (動的コンテンツ)

### キャッシュキー設計
```
video_info:{videoId}
captions_list:{videoId}
captions:{videoId}:{lang}:{format}
search:{query_hash}:{lang}
```

## 入力検証パターン

### Zodスキーマ活用
```typescript
const VideoIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/);
const LanguageCodeSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);
const FormatSchema = z.enum(['raw', 'srt', 'vtt']);
```

### URL正規化
- YouTube URL → Video ID抽出
- 短縮URL (youtu.be) 対応
- プレイリスト・タイムスタンプ除去

## 非同期処理パターン

### Promise Chain回避
- async/await使用
- エラーの適切な伝播
- タイムアウト処理

### 並行処理制御
- 同時リクエスト数制限
- レート制限の実装
- リトライ機構

## 設定管理パターン

### 環境変数
```typescript
interface Config {
  cacheEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxConcurrentRequests: number;
  requestTimeout: number;
  cacheSize: number;
}
```

### デフォルト設定
- 開発環境: デバッグ有効
- 本番環境: パフォーマンス重視
- 設定の動的変更対応

## テストパターン

### 単体テスト
- 各ツールの独立テスト
- モック使用でYouTube API分離
- エラーケースの網羅

### 統合テスト
- 実際のYouTube動画使用
- キャッシュ動作確認
- エンドツーエンド検証

## ログパターン

### 構造化ログ
```typescript
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: {
    videoId?: string;
    tool?: string;
    duration?: number;
  };
}
```

### ログレベル
- **DEBUG**: 詳細な実行情報
- **INFO**: 正常な処理フロー
- **WARN**: 注意が必要な状況
- **ERROR**: エラー発生時
