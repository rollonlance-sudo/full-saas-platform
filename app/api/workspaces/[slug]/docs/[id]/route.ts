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

// GET /api/workspaces/[slug]/docs/[id]
export async function GET(
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

  const document = await db.document.findUnique({
    where: { id, workspaceId: result.workspace.id },
    include: {
      children: { orderBy: { updatedAt: "desc" } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
      editor: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

// PUT /api/workspaces/[slug]/docs/[id]
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

  const document = await db.document.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await db.document.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
      ...(body.icon !== undefined && { icon: body.icon }),
      lastEditedBy: session.user.id,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/workspaces/[slug]/docs/[id]
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

  const document = await db.document.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await db.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
