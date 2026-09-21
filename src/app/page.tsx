import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { priceJpy: "asc" },
  });

  return (
    <div>
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-10 text-white shadow-lg">
        <p className="mb-2 text-sm font-medium text-indigo-100">
          マーケティング学習デモショップ
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          ファネルとCVRを、買う体験で学ぶ
        </h1>
        <p className="max-w-2xl text-indigo-100">
          書籍・コースをカートに入れて Stripe Checkout（TEST）まで進み、
          管理画面で page_view → purchase の転換率を確認できます。
          UTM付きURLで流入も計測しましょう。
        </p>
      </section>

      {products.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          商品がありません。
          <code className="mx-1 rounded bg-amber-100 px-1">npm run db:seed</code>
          を実行してください。
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              description={p.description}
              priceJpy={p.priceJpy}
              imageEmoji={p.imageEmoji}
              category={p.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}
