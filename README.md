# Marketing Lab EC

日本語デモのマーケティング学習 EC（書籍・コース）。  
Stripe Checkout（TEST）・ファーストパーティ計測・ファネル / CVR 管理画面付き。

学習目的: マーケティングファネル / CVR、イベント計測、EC システムアーキテクチャ。

詳細設計: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 必要環境

- Node.js 20+
- Stripe アカウント（TEST mode）
- （任意）[Stripe CLI](https://stripe.com/docs/stripe-cli) — Webhook 転送用

## セットアップ

```bash
cp .env.example .env
# .env を編集: Stripe TEST キー, ADMIN_PASSWORD, NEXT_PUBLIC_APP_URL など

npm install
npx prisma migrate dev   # 初回はマイグレーション名を聞かれたら Enter でも可
npm run db:seed
npm run dev
```

開く: [http://localhost:3000](http://localhost:3000)

管理画面: [http://localhost:3000/admin](http://localhost:3000/admin)（`ADMIN_PASSWORD`）

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
npx prisma studio   # 任意: DB GUI
```

SQLite DB ファイルは `prisma/dev.db`（gitignore 済み）。

## Stripe Webhook（ローカル）

別ターミナルで:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

表示された `whsec_...` を `.env` の `STRIPE_WEBHOOK_SECRET` に設定し、`npm run dev` を再起動。

TEST カード例: `4242 4242 4242 4242` / 任意の将来日付 / 任意 CVC。

## 計測イベント

| type | タイミング |
|------|------------|
| `page_view` | ルート変更 |
| `view_item` | 商品詳細 |
| `add_to_cart` | カート追加 |
| `begin_checkout` | Checkout Session 作成時 |
| `purchase` | Stripe webhook（支払完了） |

UTM（`utm_source` 等）はクエリから Middleware が cookie に保存し、イベント・注文に付与。

例:

```
http://localhost:3000/?utm_source=twitter&utm_medium=social&utm_campaign=launch
```

## npm scripts

| script | 内容 |
|--------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番起動 |
| `npm run db:seed` | 商品シード |
| `npm run db:migrate` | migrate dev |

## Non-goals（意図的に未実装）

会員認証、配送、在庫、GA のみの計測、Meilisearch。

## ライセンス

学習・デモ用途。

## PayPay

Checkout offers `card` and `paypay`. Enable **PayPay** in [Stripe Dashboard → Payment methods](https://dashboard.stripe.com/test/settings/payment_methods) (Test mode). Webhook events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3000/api/webhook/stripe
```
