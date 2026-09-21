import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateSessionId, getUtmFromCookie } from "@/lib/session";

const bodySchema = z.object({
  type: z.enum([
    "page_view",
    "view_item",
    "add_to_cart",
    "begin_checkout",
    "purchase",
  ]),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  path: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const sessionId = await getOrCreateSessionId();
    const utm = await getUtmFromCookie();
    const userAgent = req.headers.get("user-agent");

    await trackEvent({
      type: parsed.data.type,
      sessionId,
      productId: parsed.data.productId,
      orderId: parsed.data.orderId,
      value: parsed.data.value,
      currency: parsed.data.currency ?? "jpy",
      path: parsed.data.path,
      userAgent,
      utm,
    });

    return NextResponse.json({ ok: true, sessionId });
  } catch (e) {
    console.error("analytics error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
