import { prisma } from "./prisma";

export type FunnelStats = {
  since: Date;
  counts: {
    page_view: number;
    view_item: number;
    add_to_cart: number;
    begin_checkout: number;
    purchase: number;
    sessions: number;
    paidOrders: number;
  };
  cvr: {
    viewItemToPurchase: number;
    beginCheckoutToPurchase: number;
    sessionsToPurchase: number;
  };
  utmBreakdown: {
    key: string;
    source: string | null;
    medium: string | null;
    campaign: string | null;
    sessions: number;
    purchases: number;
  }[];
};

function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return (n / d) * 100;
}

export async function getFunnelStats(days = 7): Promise<FunnelStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: {
      type: true,
      sessionId: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
    },
  });

  const counts = {
    page_view: 0,
    view_item: 0,
    add_to_cart: 0,
    begin_checkout: 0,
    purchase: 0,
    sessions: 0,
    paidOrders: 0,
  };

  const sessionSet = new Set<string>();
  const purchaseSessions = new Set<string>();

  type UtmAgg = {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    sessions: Set<string>;
    purchases: Set<string>;
  };
  const utmMap = new Map<string, UtmAgg>();

  for (const e of events) {
    sessionSet.add(e.sessionId);
    if (e.type in counts) {
      counts[e.type as keyof typeof counts]++;
    }
    if (e.type === "purchase") purchaseSessions.add(e.sessionId);

    const key = `${e.utmSource ?? "(none)"}|${e.utmMedium ?? "(none)"}|${e.utmCampaign ?? "(none)"}`;
    let agg = utmMap.get(key);
    if (!agg) {
      agg = {
        source: e.utmSource,
        medium: e.utmMedium,
        campaign: e.utmCampaign,
        sessions: new Set(),
        purchases: new Set(),
      };
      utmMap.set(key, agg);
    }
    agg.sessions.add(e.sessionId);
    if (e.type === "purchase") agg.purchases.add(e.sessionId);
  }

  counts.sessions = sessionSet.size;

  const paidOrders = await prisma.order.count({
    where: { status: "paid", createdAt: { gte: since } },
  });
  counts.paidOrders = paidOrders;

  const utmBreakdown = [...utmMap.entries()]
    .map(([key, agg]) => ({
      key,
      source: agg.source,
      medium: agg.medium,
      campaign: agg.campaign,
      sessions: agg.sessions.size,
      purchases: agg.purchases.size,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20);

  return {
    since,
    counts,
    cvr: {
      viewItemToPurchase: pct(counts.purchase, counts.view_item),
      beginCheckoutToPurchase: pct(counts.purchase, counts.begin_checkout),
      sessionsToPurchase: pct(purchaseSessions.size, counts.sessions),
    },
    utmBreakdown,
  };
}
