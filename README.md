# Movie Recommendation MVP

音楽の好みと今の気分から、今夜観る映画を最大3本で提案するMVPです。

## Product Principles

- 推薦件数は最大3件（主推薦1件 + バックアップ最大2件）
- 理由は短く明快に表示
- ローカル認証（メール + ユーザー名 + パスワード）
- 手動入力はログイン後オンボーディングのみ（ゲストモードなし）

## Tech Stack

- Next.js 16 (App Router, TypeScript, Tailwind)
- Auth: single local demo user via `getAppUserId()` (no login UI)
- Prisma Adapter + PostgreSQL
- Zod validation

## Main Routes

- `/` ランディング
- `/login` ログイン導線
- `/onboarding` 初回嗜好入力
- `/profile/taste` 味覚プロファイル表示
- `/recommend` 推薦条件入力
- `/recommend/result/[sessionId]` 結果表示とフィードバック

## API Endpoints

- `GET /api/me`
- `POST /api/onboarding`
- `GET /api/taste-profile`
- `POST /api/taste-profile/rebuild`
- `POST /api/recommendations`
- `GET /api/recommendations/:sessionId`
- `POST /api/feedback`

## Setup

1) 環境変数を用意:

```bash
cp .env.example .env
```

2) 依存関係インストール:

```bash
npm install
```

3) Prisma Client生成:

```bash
npx prisma generate
```

4) マイグレーションとSeed投入:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

5) 開発サーバー起動:

```bash
npm run dev
```

## Quick Start (Local)

No login required. The app uses a shared local demo user automatically.

1. Start PostgreSQL and run `npx prisma db push && npm run db:seed`
2. `npm run dev` → open http://localhost:3000

## Shared Vocabulary Rule

推薦で使う語彙（mood/watch-context/content-warning/style/feedback）は `src/lib/constants/taxonomy.ts` を単一ソースとし、
validation/seed/UIで共通利用します。

## Runtime Validation Rules

- `desiredRuntimeMin <= desiredRuntimeMax`
- `runtimeToleranceMin <= runtimeToleranceMax`
- 推薦スコアは `0..1`
- content warningが無い場合は `[]`（`none`タグは使わない）
