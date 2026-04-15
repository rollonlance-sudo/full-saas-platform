import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/permissions";
import { notify } from "@/lib/notifications";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// PUT /api/workspaces/[slug]/members/[id] - Update member role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, id } = await params;
  const result = await getWorkspaceAndMember(slug, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (!hasPermission(result.member.role as Role, "change:roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMember = await db.workspaceMember.findUnique({
    where: { id },
  });

  if (!targetMember || targetMember.workspaceId !== result.workspace.id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
  }

  const body = await req.json();
  const { role } = body;

  if (!role || !["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await db.workspaceMember.update({
    where: { id },
    data: { role },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  if (targetMember.userId && targetMember.userId !== session.user.id) {
    await notify({
      userId: targetMember.userId,
      workspaceId: result.workspace.id,
      type: "role_changed",
      title: "Your role was changed",
      body: `You are now a ${role} in ${result.workspace.name}`,
      link: `/workspace/${result.workspace.slug}/members`,
    });
  }

  return NextResponse.json(updated);
}

// DELETE /api/workspaces/[slug]/members/[id] - Remove member
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, id } = await params;
  const result = await getWorkspaceAndMember(slug, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (!hasPermission(result.member.role as Role, "remove:members")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetMember = await db.workspaceMember.findUnique({
    where: { id },
  });

  if (!targetMember || targetMember.workspaceId !== result.workspace.id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
  }

  await db.workspaceMember.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
