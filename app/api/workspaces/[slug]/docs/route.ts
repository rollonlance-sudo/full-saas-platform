import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentSchema } from "@/lib/validations";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// GET /api/workspaces/[slug]/docs
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

  const documents = await db.document.findMany({
    where: { workspaceId: result.workspace.id, parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/workspaces/[slug]/docs
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

  const body = await req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const document = await db.document.create({
    data: {
      workspaceId: result.workspace.id,
      title: parsed.data.title,
      content: parsed.data.content,
      parentId: parsed.data.parentId,
      icon: parsed.data.icon,
      coverImageUrl: parsed.data.coverImageUrl,
      createdBy: session.user.id,
      lastEditedBy: session.user.id,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
