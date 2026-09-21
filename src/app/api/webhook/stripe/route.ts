import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("webhook signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.warn("checkout.session.completed without orderId metadata");
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn("order not found", orderId);
      return NextResponse.json({ received: true });
    }

    if (order.status !== "paid") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          email: session.customer_details?.email ?? order.email,
        },
      });

      await trackEvent({
        type: "purchase",
        sessionId: order.sessionId,
        orderId: order.id,
        value: order.totalJpy,
        currency: order.currency,
        path: "/checkout/success",
        utm: {
          utmSource: order.utmSource,
          utmMedium: order.utmMedium,
          utmCampaign: order.utmCampaign,
          utmTerm: order.utmTerm,
          utmContent: order.utmContent,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
