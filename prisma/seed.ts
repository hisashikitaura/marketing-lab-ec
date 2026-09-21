import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "funnel-mastery-book",
    name: "ファネル設計マスターブック",
    description:
      "認知→興味→検討→購入のマーケティングファネルを体系的に学べる実践書。CVR改善のフレームワークとケーススタディ付き。",
    priceJpy: 2980,
    imageEmoji: "📖",
    category: "book",
  },
  {
    slug: "cvr-optimization-course",
    name: "CVR最適化 実践コース",
    description:
      "ランディングページ・カート・チェックアウトの各段階で離脱を減らす手法を動画で学ぶオンラインコース（全8章）。",
    priceJpy: 12800,
    imageEmoji: "🎓",
    category: "course",
  },
  {
    slug: "utm-analytics-handbook",
    name: "UTM計測ハンドブック",
    description:
      "utm_source / medium / campaign の設計からファーストパーティ計測まで。広告ROIを正しく測るための必携ガイド。",
    priceJpy: 1980,
    imageEmoji: "📊",
    category: "book",
  },
  {
    slug: "stripe-ec-architecture",
    name: "Stripe ECアーキテクチャ入門",
    description:
      "Checkout Session・Webhook・注文状態管理を通じて、決済付きECのシステム設計を学ぶ技術書。",
    priceJpy: 3480,
    imageEmoji: "🏗️",
    category: "book",
  },
  {
    slug: "growth-experiment-lab",
    name: "グロース実験ラボ",
    description:
      "仮説→計測→検証のA/Bテスト循環を身につけるワークショップ型コース。イベント設計テンプレート付き。",
    priceJpy: 9800,
    imageEmoji: "🧪",
    category: "course",
  },
  {
    slug: "jp-ec-marketing-playbook",
    name: "日本向けECマーケ プレイブック",
    description:
      "日本市場特有の購買行動・決済・広告チャネルを踏まえたECグロースプレイブック。JPY価格戦略の章あり。",
    priceJpy: 4480,
    imageEmoji: "🇯🇵",
    category: "book",
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  const count = await prisma.product.count();
  console.log(`Done. ${count} products in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
