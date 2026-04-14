import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { columnSchema } from "@/lib/validations";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// POST /api/workspaces/[slug]/projects/[id]/columns - Add column
export async function POST(
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

  const project = await db.project.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = columnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxPosition = await db.column.aggregate({
    where: { projectId: id },
    _max: { position: true },
  });

  const column = await db.column.create({
    data: {
      projectId: id,
      name: parsed.data.name,
      color: parsed.data.color,
      wipLimit: parsed.data.wipLimit,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  return NextResponse.json(column, { status: 201 });
}

// PUT /api/workspaces/[slug]/projects/[id]/columns - Reorder columns
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

  const project = await db.project.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json();
  const { columns } = body as { columns: { id: string; position: number }[] };

  if (!Array.isArray(columns)) {
    return NextResponse.json({ error: "columns array required" }, { status: 400 });
  }

  await db.$transaction(
    columns.map((col) =>
      db.column.update({
        where: { id: col.id },
        data: { position: col.position },
      })
    )
  );

  const updated = await db.column.findMany({
    where: { projectId: id },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(updated);
}
