"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("パスワードが違います");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h1 className="mb-2 text-xl font-bold">管理画面ログイン</h1>
      <p className="mb-6 text-sm text-slate-500">
        <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code>{" "}
        を入力してください
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        placeholder="パスワード"
        autoFocus
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "確認中…" : "ログイン"}
      </button>
    </form>
  );
}
