"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function SuccessInner() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
      <div className="mb-4 text-5xl">🎉</div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">ご購入ありがとうございます</h1>
      <p className="mb-6 text-slate-600">
        支払いが完了しました（または処理中です）。Webhook が
        <code className="mx-1 rounded bg-slate-100 px-1 text-sm">purchase</code>
        イベントを記録します。
      </p>
      {sessionId && (
        <p className="mb-6 break-all text-xs text-slate-400">
          Stripe session: {sessionId}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          ショップに戻る
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          管理画面でCVRを見る
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-500">読み込み中…</p>}>
      <SuccessInner />
    </Suspense>
  );
}
