import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/permissions";
import { inviteSchema } from "@/lib/validations";
import { notifyMany, workspaceMemberIds } from "@/lib/notifications";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// GET /api/workspaces/[slug]/invites - List pending invites
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

  const invites = await db.invite.findMany({
    where: { workspaceId: result.workspace.id, accepted: false },
    include: {
      inviter: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}

// POST /api/workspaces/[slug]/invites - Create invite
export async function POST(
  req: NextRequest,
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

  if (!hasPermission(result.member.role as Role, "invite:members")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Check if user is already a member
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: result.workspace.id,
          userId: existingUser.id,
        },
      },
    });
    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }
  }

  // Check for existing pending invite
  const existingInvite = await db.invite.findFirst({
    where: {
      workspaceId: result.workspace.id,
      email,
      accepted: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvite) {
    return NextResponse.json({ error: "Invite already pending" }, { status: 409 });
  }

  const invite = await db.invite.create({
    data: {
      workspaceId: result.workspace.id,
      email,
      role,
      token: randomUUID(),
      invitedBy: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const actor = session.user.name ?? session.user.email ?? "Someone";
  const memberIds = await workspaceMemberIds(result.workspace.id, session.user.id);
  await notifyMany(
    memberIds,
    {
      workspaceId: result.workspace.id,
      type: "invite",
      title: `${actor} invited ${invite.email}`,
      body: `Role: ${invite.role}`,
      link: `/workspace/${result.workspace.slug}/members`,
    },
    session.user.id,
  );

  return NextResponse.json(invite, { status: 201 });
}
