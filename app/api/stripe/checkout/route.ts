import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// POST /api/stripe/checkout
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceSlug, priceId } = body;

  if (!workspaceSlug || !priceId) {
    return NextResponse.json(
      { error: "workspaceSlug and priceId are required" },
      { status: 400 }
    );
  }

  const workspace = await db.workspace.findUnique({
    where: { slug: workspaceSlug },
  });
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
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let customerId = workspace.stripeCustomerId;

  if (!customerId) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspaceSlug}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspaceSlug}/billing?canceled=true`,
    metadata: { workspaceId: workspace.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
