import { prisma } from "./prisma";
import type { UtmParams } from "./utm";

export type AnalyticsEventType =
  | "page_view"
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

export type TrackInput = {
  type: AnalyticsEventType;
  sessionId: string;
  productId?: string | null;
  orderId?: string | null;
  value?: number | null;
  currency?: string | null;
  path?: string | null;
  userAgent?: string | null;
  utm?: UtmParams;
};

export async function trackEvent(input: TrackInput) {
  const utm = input.utm ?? {};
  return prisma.analyticsEvent.create({
    data: {
      type: input.type,
      sessionId: input.sessionId,
      productId: input.productId ?? null,
      orderId: input.orderId ?? null,
      value: input.value ?? null,
      currency: input.currency ?? null,
      path: input.path ?? null,
      userAgent: input.userAgent ?? null,
      utmSource: utm.utmSource ?? null,
      utmMedium: utm.utmMedium ?? null,
      utmCampaign: utm.utmCampaign ?? null,
      utmTerm: utm.utmTerm ?? null,
      utmContent: utm.utmContent ?? null,
    },
  });
}
