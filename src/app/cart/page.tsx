"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { cartTotal } from "@/lib/cart";
import { formatJpy } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, ready } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cartTotal(items);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "チェックアウトに失敗しました");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("ネットワークエラーです");
      setLoading(false);
    }
  }

  if (!ready) {
    return <p className="text-slate-500">読み込み中…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="mb-4 text-lg text-slate-600">カートは空です</p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          商品を見る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">カート</h1>
      <ul className="mb-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="text-3xl">{item.imageEmoji}</span>
            <div className="flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="font-medium text-slate-900 hover:text-indigo-600"
              >
                {item.name}
              </Link>
              <p className="text-sm text-slate-500">
                {formatJpy(item.priceJpy)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-slate-400 hover:text-red-500"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex justify-between text-lg font-bold">
          <span>合計</span>
          <span>{formatJpy(total)}</span>
        </div>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-slate-600">
            メール（任意・ゲストチェックアウト）
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={checkout}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Stripe へ移動中…" : "Stripe Checkout で購入する"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Stripe TEST mode（カード番号 4242…）
        </p>
      </div>
    </div>
  );
}
