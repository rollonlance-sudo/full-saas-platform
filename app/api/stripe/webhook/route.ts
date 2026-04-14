import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/stripe";
import Stripe from "stripe";

// POST /api/stripe/webhook
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (!workspaceId) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const priceId = subscription.items.data[0]?.price.id;
      const plan =
        priceId === PLANS.pro.priceId
          ? "pro"
          : priceId === PLANS.enterprise.priceId
            ? "enterprise"
            : "free";

      const planConfig = PLANS[plan as keyof typeof PLANS];

      await db.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          stripeSubscriptionId: subscription.id,
          memberLimit: planConfig.memberLimit,
          projectLimit: planConfig.projectLimit,
          storageLimitMb: planConfig.storageLimitMb,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const workspace = await db.workspace.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!workspace) break;

      const priceId = subscription.items.data[0]?.price.id;
      const plan =
        priceId === PLANS.pro.priceId
          ? "pro"
          : priceId === PLANS.enterprise.priceId
            ? "enterprise"
            : "free";

      const planConfig = PLANS[plan as keyof typeof PLANS];

      await db.workspace.update({
        where: { id: workspace.id },
        data: {
          plan,
          memberLimit: planConfig.memberLimit,
          projectLimit: planConfig.projectLimit,
          storageLimitMb: planConfig.storageLimitMb,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const workspace = await db.workspace.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!workspace) break;

      await db.workspace.update({
        where: { id: workspace.id },
        data: {
          plan: "free",
          stripeSubscriptionId: null,
          memberLimit: PLANS.free.memberLimit,
          projectLimit: PLANS.free.projectLimit,
          storageLimitMb: PLANS.free.storageLimitMb,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
