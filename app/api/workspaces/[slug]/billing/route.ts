import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// GET /api/workspaces/[slug]/billing
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const result = await getWorkspaceAndMember(slug, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const ws = result.workspace;

  // Count usage
  const [memberCount, projectCount, taskCount] = await Promise.all([
    db.workspaceMember.count({ where: { workspaceId: ws.id } }),
    db.project.count({ where: { workspaceId: ws.id } }),
    db.task.count({ where: { workspaceId: ws.id } }),
  ]);

  // Plan limits (free tier defaults)
  const planLimits: Record<string, { members: number; projects: number; storage: number }> = {
    free: { members: 5, projects: 3, storage: 100 },
    pro: { members: 50, projects: 50, storage: 5000 },
    enterprise: { members: 999, projects: 999, storage: 50000 },
  };

  const limits = planLimits[ws.plan] || planLimits.free;

  const planDetails = {
    free: {
      name: "Free",
      tier: "free" as const,
      price: 0,
      interval: "month" as const,
      features: ["Up to 3 projects", "Up to 5 members", "Basic collaboration"],
    },
    pro: {
      name: "Pro",
      tier: "pro" as const,
      price: 19,
      interval: "month" as const,
      features: ["Up to 50 projects", "Up to 50 members", "Advanced analytics"],
    },
    enterprise: {
      name: "Enterprise",
      tier: "enterprise" as const,
      price: 99,
      interval: "month" as const,
      features: ["Unlimited projects", "Unlimited members", "Priority support"],
    },
  };

  const currentPlan = planDetails[ws.plan as keyof typeof planDetails] || planDetails.free;

  return NextResponse.json({
    plan: {
      name: currentPlan.name,
      tier: currentPlan.tier,
      price: currentPlan.price,
      interval: currentPlan.interval,
    },
    usage: {
      members: { current: memberCount, limit: limits.members },
      projects: { current: projectCount, limit: limits.projects },
      storage: { current: 0, limit: limits.storage, unit: "MB" },
      tasks: { current: taskCount, limit: 999 },
    },
    features: currentPlan.features,
    canUpgrade: ws.plan === "free" || ws.plan === "pro",
    hasSubscription: ws.plan !== "free",
  });
}
