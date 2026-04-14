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

// GET /api/workspaces/[slug]/projects/[id]/tasks
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

  const tasks = await db.task.findMany({
    where: { projectId: id, workspaceId: result.workspace.id, isArchived: false },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      labels: { include: { label: true } },
      column: { select: { id: true, name: true } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/workspaces/[slug]/projects/[id]/tasks
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
  const { title, columnId, description, priority, dueDate } = body;

  if (!title || !columnId) {
    return NextResponse.json({ error: "title and columnId are required" }, { status: 400 });
  }

  const maxPosition = await db.task.aggregate({
    where: { columnId, projectId: id },
    _max: { position: true },
  });

  const task = await db.task.create({
    data: {
      projectId: id,
      workspaceId: result.workspace.id,
      columnId,
      title,
      description: description || null,
      priority: priority || "none",
      position: (maxPosition._max.position ?? -1) + 1,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: session.user.id,
    },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      labels: { include: { label: true } },
      column: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
