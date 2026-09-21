# Architecture — Marketing Lab EC

学習用デモショップのシステム構成とファネル計測の考え方。

## なぜ SQLite（v1）か

| 理由 | 説明 |
|------|------|
| ゼロ設定 | Postgres コンテナやクラウド DB なしで `file:./dev.db` だけで動く |
| 学習コスト | Prisma migrate / seed / Studio を最短で体験できる |
| 可搬性 | リポジトリを clone して即ローカル実験（マーケ計測の実験台） |
| 十分性 | デモ規模（商品数個・イベント数千件）では十分。本番規模は Postgres へ差し替え想定 |

v1 は「ファネル・CVR・Webhook・Checkout」の理解が目的。接続文字列を変えれば Prisma 経由で Postgres に移行可能。

## コンポーネント概要

```mermaid
flowchart LR
  Browser["Browser<br/>Shop UI + Cart"]
  Next["Next.js App Router<br/>API Routes + Middleware"]
  DB[(SQLite<br/>Prisma)]
  Stripe["Stripe Checkout<br/>TEST mode"]

  Browser -->|"page views / cart"| Next
  Next -->|"CRUD + analytics"| DB
  Browser -->|"redirect"| Stripe
  Stripe -->|"webhook checkout.session.completed"| Next
  Next -->|"mark paid + purchase event"| DB
```

## 閲覧 → 購入フロー

```mermaid
sequenceDiagram
  participant U as User
  participant MW as Middleware
  participant App as Next.js
  participant DB as SQLite
  participant S as Stripe

  U->>MW: GET /?utm_source=...
  MW->>MW: Set ml_session + ml_utm cookies
  U->>App: browse products
  App->>DB: track page_view / view_item
  U->>App: add_to_cart (client)
  App->>DB: track add_to_cart
  U->>App: POST /api/checkout
  App->>DB: create Order(pending) + begin_checkout
  App->>S: Checkout Session
  S-->>U: hosted Checkout
  U->>S: pay (TEST card)
  S->>App: webhook checkout.session.completed
  App->>DB: Order=paid + purchase event
  S-->>U: redirect /checkout/success
```

## ファーストパーティ計測

イベント種別: `page_view` | `view_item` | `add_to_cart` | `begin_checkout` | `purchase`

各イベントに付与:

- `sessionId`（cookie `ml_session`）
- `productId?` / `value?` / `currency?` / `path?` / `userAgent?`
- `utm_*`（cookie `ml_utm`、クエリから Middleware が保存）
- `createdAt`

注文（`Order`）にも同じ UTM をスナップショットし、Webhook 由来の `purchase` に引き継ぐ。

## CVR 計算式（管理画面・直近7日）

```mermaid
flowchart TD
  VI[view_item count] --> CVR1["CVR1 = purchase / view_item"]
  BC[begin_checkout count] --> CVR2["CVR2 = purchase / begin_checkout"]
  SES[unique sessions] --> CVR3["CVR3 = sessions_with_purchase / sessions"]
  PUR[purchase count]
  PUR --> CVR1
  PUR --> CVR2
```

数式:

- **view_item → purchase** = `count(purchase) / count(view_item)`
- **begin_checkout → purchase** = `count(purchase) / count(begin_checkout)`
- **sessions → purchase** = `unique(sessionId where type=purchase) / unique(sessionId)`

分母が 0 のときは `—` 表示。

## 主要ルート

| Path | 役割 |
|------|------|
| `/` | 商品一覧 |
| `/products/[slug]` | 詳細 + view_item |
| `/cart` | カート → Checkout Session |
| `/checkout/success` | 完了（カートクリア） |
| `/checkout/cancel` | キャンセル |
| `/admin` | パスワード保護ダッシュボード |
| `/api/analytics` | イベント POST |
| `/api/checkout` | Stripe Session 作成 |
| `/api/webhook/stripe` | 支払完了 → paid + purchase |

## 環境変数

`.env.example` を参照。シークレットはコミット禁止。
