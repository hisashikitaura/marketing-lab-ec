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


## ファイル構成（簡単）

| パス | 役割 |
|------|------|
| `.env.example` | 環境変数の見本（本物のキーは `.env` に書く・コミットしない） |
| `.gitignore` | Git に載せないファイルの指定 |
| `package.json` | 依存関係と npm スクリプト |
| `tsconfig.json` / `next.config.ts` / `postcss.config.mjs` / `eslint.config.mjs` | TypeScript / Next / CSS / Lint の設定 |
| `docs/ARCHITECTURE.md` | システム構成の説明 |
| `prisma/schema.prisma` | DB のテーブル定義 |
| `prisma/seed.ts` | デモ商品の投入 |
| `prisma/migrations/` | DB 変更履歴 |
| `src/middleware.ts` | UTM を cookie に保存する処理 |
| `src/app/layout.tsx` | 全ページ共通レイアウト |
| `src/app/page.tsx` | 商品一覧（トップ） |
| `src/app/globals.css` | 全体スタイル |
| `src/app/products/[slug]/page.tsx` | 商品詳細 |
| `src/app/products/[slug]/ViewItemTracker.tsx` | 詳細閲覧イベント送信 |
| `src/app/cart/page.tsx` | カート・Checkout 開始 |
| `src/app/checkout/success/page.tsx` | 決済成功ページ |
| `src/app/checkout/cancel/page.tsx` | 決済キャンセルページ |
| `src/app/admin/page.tsx` | ファネル / CVR 管理画面 |
| `src/app/admin/AdminLoginForm.tsx` | 管理画面ログイン UI |
| `src/app/admin/LogoutButton.tsx` | 管理画面ログアウト |
| `src/app/api/checkout/route.ts` | Stripe Checkout Session 作成 |
| `src/app/api/webhook/stripe/route.ts` | 決済完了 Webhook → 注文 paid / purchase 計測 |
| `src/app/api/analytics/route.ts` | フロントからの計測イベント受信 |
| `src/app/api/admin/login/route.ts` | 管理ログイン API |
| `src/app/api/admin/logout/route.ts` | 管理ログアウト API |
| `src/components/Header.tsx` | ヘッダー |
| `src/components/ProductCard.tsx` | 商品カード |
| `src/components/AddToCartButton.tsx` | カート追加ボタン |
| `src/components/CartProvider.tsx` | カート状態（ブラウザ） |
| `src/components/AnalyticsBeacon.tsx` | page_view など自動計測 |
| `src/components/UtmCapture.tsx` | クライアント側 UTM 補助 |
| `src/lib/stripe.ts` | Stripe クライアント |
| `src/lib/prisma.ts` | DB クライアント |
| `src/lib/analytics.ts` | イベント保存 |
| `src/lib/funnel.ts` | ファネル / CVR 集計 |
| `src/lib/session.ts` | セッション ID |
| `src/lib/utm.ts` | UTM の読み書き |
| `src/lib/cart.ts` | カート用ヘルパ |
| `src/lib/format.ts` | 金額など表示整形 |
| `src/lib/admin-auth.ts` | 管理画面の認証 |
| `public/` | 静的画像（Next の初期 SVG など） |

## Non-goals（意図的に未実装）

会員認証、配送、在庫、GA のみの計測、Meilisearch。

## ライセンス

学習・デモ用途。

## PayPay

Checkout offers `card` and `paypay`. Enable **PayPay** in [Stripe Dashboard → Payment methods](https://dashboard.stripe.com/test/settings/payment_methods) (Test mode). Webhook events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3000/api/webhook/stripe
```
