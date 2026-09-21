import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatJpy } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ViewItemTracker } from "./ViewItemTracker";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  return (
    <div>
      <ViewItemTracker
        productId={product.id}
        path={`/products/${product.slug}`}
        value={product.priceJpy}
      />
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-indigo-600 hover:underline"
      >
        ← 商品一覧に戻る
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-8xl shadow-inner">
          {product.imageEmoji}
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {product.category === "course" ? "コース" : "書籍"}
          </span>
          <h1 className="mt-1 mb-3 text-3xl font-bold text-slate-900">
            {product.name}
          </h1>
          <p className="mb-6 text-slate-600 leading-relaxed">
            {product.description}
          </p>
          <p className="mb-6 text-3xl font-bold text-slate-900">
            {formatJpy(product.priceJpy)}
          </p>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceJpy={product.priceJpy}
            imageEmoji={product.imageEmoji}
          />
          <p className="mt-3 text-xs text-slate-500">
            ゲストチェックアウト対応・Stripe TEST mode
          </p>
        </div>
      </div>
    </div>
  );
}
