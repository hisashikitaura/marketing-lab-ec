import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-10 text-center shadow-sm">
      <div className="mb-4 text-5xl">↩️</div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">チェックアウトをキャンセルしました</h1>
      <p className="mb-6 text-slate-600">
        カートの内容は残っています。いつでも再開できます。
      </p>
      <Link
        href="/cart"
        className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
      >
        カートに戻る
      </Link>
    </div>
  );
}
