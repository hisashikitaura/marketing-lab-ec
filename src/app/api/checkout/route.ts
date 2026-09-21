import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe, getAppUrl } from "@/lib/stripe";
import { getOrCreateSessionId, getUtmFromCookie } from "@/lib/session";
import { trackEvent } from "@/lib/analytics";

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured" },
        { status: 503 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const productIds = parsed.data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const lineItems = parsed.data.items.map((item) => {
      const p = productMap.get(item.productId)!;
      return {
        product: p,
        quantity: item.quantity,
        unitPrice: p.priceJpy,
      };
    });

    const totalJpy = lineItems.reduce(
      (sum, li) => sum + li.unitPrice * li.quantity,
      0
    );

    const sessionId = await getOrCreateSessionId();
    const utm = await getUtmFromCookie();
    const userAgent = req.headers.get("user-agent");

    const order = await prisma.order.create({
      data: {
        status: "pending",
        email: parsed.data.email || null,
        totalJpy,
        currency: "jpy",
        sessionId,
        utmSource: utm.utmSource ?? null,
        utmMedium: utm.utmMedium ?? null,
        utmCampaign: utm.utmCampaign ?? null,
        utmTerm: utm.utmTerm ?? null,
        utmContent: utm.utmContent ?? null,
        items: {
          create: lineItems.map((li) => ({
            productId: li.product.id,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            name: li.product.name,
          })),
        },
      },
    });

    await trackEvent({
      type: "begin_checkout",
      sessionId,
      value: totalJpy,
      currency: "jpy",
      path: "/cart",
      userAgent,
      utm,
      orderId: order.id,
    });

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      // card + PayPay (enable PayPay in Dashboard → Payment methods)
      payment_method_types: ["card", "paypay"],
      customer_email: parsed.data.email || undefined,
      line_items: lineItems.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: "jpy",
          unit_amount: li.unitPrice,
          product_data: {
            name: li.product.name,
            description: li.product.description.slice(0, 200),
          },
        },
      })),
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        sessionId,
      },
      locale: "ja",
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      orderId: order.id,
    });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
