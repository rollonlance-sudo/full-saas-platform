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

// GET /api/workspaces/[slug]/members
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

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: result.workspace.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const invites = await db.invite.findMany({
    where: { workspaceId: result.workspace.id, accepted: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt.toISOString(),
      status: i.expiresAt < new Date() ? "expired" : "pending",
    })),
    currentUserRole: result.member.role,
  });
}
