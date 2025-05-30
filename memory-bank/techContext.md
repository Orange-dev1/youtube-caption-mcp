# 技術コンテキスト

## 技術スタック詳細

### コア技術
- **TypeScript 5.0+**: 型安全性とコード品質の向上
- **Node.js 18+**: LTS版での安定動作
- **ES Modules**: モダンなモジュール形式

### 主要依存関係
- **@modelcontextprotocol/sdk**: MCPサーバー実装のためのSDK
- **youtubei-js**: YouTube内部APIアクセス（youtube-jsの後継）
- **zod**: 入力検証とスキーマ定義
- **node-cache**: メモリキャッシュ機能

### 開発ツール
- **tsx**: TypeScript実行環境
- **vitest**: テストフレームワーク
- **eslint**: コード品質チェック
- **prettier**: コードフォーマット
- **tsup**: バンドル・ビルドツール

## プロジェクト構造
```
youtube-caption-mcp/
├── src/
│   ├── index.ts              # MCPサーバーエントリーポイント
│   ├── server.ts             # MCPサーバー実装
│   ├── tools/                # MCPツール実装
│   │   ├── get-video-info.ts
│   │   ├── get-captions-list.ts
│   │   ├── download-captions.ts
│   │   └── search-videos.ts
│   ├── services/             # ビジネスロジック
│   │   ├── youtube-client.ts
│   │   ├── caption-parser.ts
│   │   └── cache-manager.ts
│   ├── types/                # 型定義
│   │   ├── youtube.ts
│   │   ├── captions.ts
│   │   └── mcp.ts
│   └── utils/                # ユーティリティ
│       ├── validators.ts
│       ├── formatters.ts
│       └── error-handler.ts
├── tests/                    # テストファイル
├── docs/                     # ドキュメント
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## 技術的制約
- Node.js 18以上が必要
- ESMモジュール形式での実装
- MCPプロトコル仕様への準拠
- YouTube利用規約の遵守

## パフォーマンス要件
- 初回起動時間: < 2秒
- 字幕取得時間: < 3秒
- メモリ使用量: < 100MB
- 同時リクエスト処理: 10件まで

## セキュリティ考慮事項
- 入力検証の徹底
- XSS対策（出力のサニタイズ）
- レート制限の実装
- エラー情報の適切な隠蔽

## 配布・デプロイ
- NPMパッケージとして配布
- グローバルインストール対応
- バイナリ実行ファイルの生成
- Claude Desktop設定の自動化

## 開発環境セットアップ
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build

# パッケージング
npm run package
```

## CI/CD
- GitHub Actions使用
- 自動テスト実行
- 型チェック
- リント・フォーマットチェック
- NPM自動公開
