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
    where: { workspaceId: result.workspace.id },
    include: {
      editor: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  type DocumentNode = {
    id: string;
    title: string;
    parentId: string | null;
    updatedAt: Date;
    editor: { id: string; name: string; avatarUrl: string | null } | null;
    children: DocumentNode[];
  };

  type DocumentResponse = {
    id: string;
    title: string;
    lastEditedBy: { name: string; image: string | null } | null;
    lastEditedAt: string;
    children: DocumentResponse[];
  };

  const nodes = new Map<string, DocumentNode>();

  for (const doc of documents) {
    nodes.set(doc.id, {
      id: doc.id,
      title: doc.title,
      parentId: doc.parentId,
      updatedAt: doc.updatedAt,
      editor: doc.editor,
      children: [],
    });
  }

  const roots: DocumentNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (items: DocumentNode[]) => {
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    for (const item of items) {
      sortTree(item.children);
    }
  };

  sortTree(roots);

  const toResponse = (items: DocumentNode[]): DocumentResponse[] =>
    items.map((item) => ({
      id: item.id,
      title: item.title,
      lastEditedBy: item.editor
        ? { name: item.editor.name, image: item.editor.avatarUrl }
        : null,
      lastEditedAt: item.updatedAt.toISOString(),
      children: toResponse(item.children),
    }));

  return NextResponse.json(toResponse(roots));
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
