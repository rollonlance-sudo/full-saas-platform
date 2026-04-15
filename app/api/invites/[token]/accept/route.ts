import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyMany, workspaceMemberIds } from "@/lib/notifications";

// POST /api/invites/[token]/accept
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.accepted) {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
  }

  // Check if already a member
  const existingMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json({ error: "Already a member of this workspace" }, { status: 409 });
  }

  await db.$transaction([
    db.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
        role: invite.role,
      },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { accepted: true },
    }),
  ]);

  const actor = session.user.name ?? session.user.email ?? "Someone";
  const memberIds = await workspaceMemberIds(invite.workspace.id, session.user.id);
  await notifyMany(
    memberIds,
    {
      workspaceId: invite.workspace.id,
      type: "member_joined",
      title: `${actor} joined the workspace`,
      link: `/workspace/${invite.workspace.slug}/members`,
    },
    session.user.id,
  );

  return NextResponse.json({
    success: true,
    workspace: {
      id: invite.workspace.id,
      name: invite.workspace.name,
      slug: invite.workspace.slug,
    },
  });
}
