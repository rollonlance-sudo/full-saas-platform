import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/permissions";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// GET /api/workspaces/[slug]
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

  const workspace = await db.workspace.findUnique({
    where: { id: result.workspace.id },
    include: {
      _count: { select: { members: true, projects: true } },
    },
  });

  return NextResponse.json({
    ...workspace,
    currentUserRole: result.member.role,
  });
}

// PUT /api/workspaces/[slug]
export async function PUT(
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

  if (!hasPermission(result.member.role as Role, "manage:settings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug: newSlug, logoUrl } = body;

  if (newSlug && newSlug !== slug) {
    const existing = await db.workspace.findUnique({ where: { slug: newSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
  }

  const updated = await db.workspace.update({
    where: { id: result.workspace.id },
    data: {
      ...(name && { name }),
      ...(newSlug && { slug: newSlug }),
      ...(logoUrl !== undefined && { logoUrl }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/workspaces/[slug]
export async function DELETE(
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

  if (!hasPermission(result.member.role as Role, "delete:workspace")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.workspace.delete({ where: { id: result.workspace.id } });

  return NextResponse.json({ success: true });
}
