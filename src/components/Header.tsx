"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { cartCount } from "@/lib/cart";

export function Header() {
  const { items } = useCart();
  const count = cartCount(items);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="text-xl">📣</span>
          <span>
            Marketing Lab <span className="text-indigo-600">EC</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">
            商品一覧
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-500"
          >
            カート
            {count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-indigo-700">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
