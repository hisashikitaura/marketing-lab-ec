import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getFunnelStats } from "@/lib/funnel";
import { formatPct } from "@/lib/format";
import { AdminLoginForm } from "./AdminLoginForm";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return <AdminLoginForm />;
  }

  const stats = await getFunnelStats(7);
  const sinceLabel = stats.since.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ファネル & CVR ダッシュボード</h1>
          <p className="text-sm text-slate-500">
            直近7日（{sinceLabel} JST 以降）
          </p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">イベント件数</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="page_view" value={stats.counts.page_view} />
        <StatCard label="view_item" value={stats.counts.view_item} />
        <StatCard label="add_to_cart" value={stats.counts.add_to_cart} />
        <StatCard label="begin_checkout" value={stats.counts.begin_checkout} />
        <StatCard label="purchase" value={stats.counts.purchase} />
        <StatCard
          label="sessions"
          value={stats.counts.sessions}
          hint={`paid orders: ${stats.counts.paidOrders}`}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">転換率 (CVR)</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="view_item → purchase"
          value={formatPct(stats.counts.purchase, stats.counts.view_item)}
          hint={`${stats.counts.purchase} / ${stats.counts.view_item}`}
        />
        <StatCard
          label="begin_checkout → purchase"
          value={formatPct(
            stats.counts.purchase,
            stats.counts.begin_checkout
          )}
          hint={`${stats.counts.purchase} / ${stats.counts.begin_checkout}`}
        />
        <StatCard
          label="sessions → purchase"
          value={`${stats.cvr.sessionsToPurchase.toFixed(1)}%`}
          hint="ユニークセッションベース"
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">UTM 内訳</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">source</th>
              <th className="px-4 py-3">medium</th>
              <th className="px-4 py-3">campaign</th>
              <th className="px-4 py-3">sessions</th>
              <th className="px-4 py-3">purchases</th>
              <th className="px-4 py-3">CVR</th>
            </tr>
          </thead>
          <tbody>
            {stats.utmBreakdown.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  まだイベントがありません。UTM付きURLでアクセスしてみてください。
                </td>
              </tr>
            ) : (
              stats.utmBreakdown.map((row) => (
                <tr key={row.key} className="border-b border-slate-50">
                  <td className="px-4 py-2">{row.source ?? "(none)"}</td>
                  <td className="px-4 py-2">{row.medium ?? "(none)"}</td>
                  <td className="px-4 py-2">{row.campaign ?? "(none)"}</td>
                  <td className="px-4 py-2">{row.sessions}</td>
                  <td className="px-4 py-2">{row.purchases}</td>
                  <td className="px-4 py-2">
                    {formatPct(row.purchases, row.sessions)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
