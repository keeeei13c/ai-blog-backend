# hono-ai-edge-api

Cloudflareのエッジ環境で動作するAI機能を備えたAPIサーバー。HonoフレームワークとCloudflare D1を使用し、OpenAI APIと連携してAI機能を提供します。

## 技術スタック

- **フレームワーク**: [Hono](https://hono.dev/) - 軽量で高速なエッジWebフレームワーク
- **実行環境**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **API統合**: OpenAI API
- **ORM**: Drizzle ORM
- **型システム**: TypeScript

## 機能

- AIを活用したテキスト処理
- RESTful API
- データの永続化（Cloudflare D1）
- エッジでの高速なレスポンス

## 必要な環境変数

```env
.env
WORKER_NAME=my-hono-api
API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key
D1_DATABASE_BINDING=DB
D1_DATABASE_NAME=my-hono-api-db
D1_DATABASE_ID=your-database-id
```