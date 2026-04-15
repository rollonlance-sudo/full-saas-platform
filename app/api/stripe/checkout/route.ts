import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

// POST /api/stripe/checkout
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { workspaceSlug?: string; plan?: string; priceId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { workspaceSlug, plan = "pro" } = body;

  if (!workspaceSlug) {
    return NextResponse.json({ error: "workspaceSlug is required" }, { status: 400 });
  }

  // Resolve priceId: explicit override > plan lookup from env
  const priceId = body.priceId || PRICE_BY_PLAN[plan];
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Billing is not configured for the "${plan}" plan. Set STRIPE_${plan.toUpperCase()}_PRICE_ID and redeploy.`,
      },
      { status: 500 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (req.headers.get("origin") ?? `https://${req.headers.get("host") ?? ""}`);

  try {
    const workspace = await db.workspace.findUnique({ where: { slug: workspaceSlug } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.user.id,
        },
      },
    });
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json({ error: "Only admins can start checkout" }, { status: 403 });
    }

    let customerId = workspace.stripeCustomerId;
    if (!customerId) {
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      const customer = await stripe.customers.create({
        email: user!.email,
        metadata: { workspaceId: workspace.id },
      });
      customerId = customer.id;
      await db.workspace.update({
        where: { id: workspace.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/workspace/${workspaceSlug}/billing?success=true`,
      cancel_url: `${appUrl}/workspace/${workspaceSlug}/billing?canceled=true`,
      metadata: { workspaceId: workspace.id, plan },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
