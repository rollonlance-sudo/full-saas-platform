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

// GET /api/workspaces/[slug]/projects/[id]
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

  const project = await db.project.findUnique({
    where: { id, workspaceId: result.workspace.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
      },
      tasks: {
        include: {
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
          labels: {
            include: { label: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const columns = project.columns.map((column) => ({
    id: column.id,
    name: column.name,
    position: column.position,
    tasks: project.tasks
      .filter((task) => task.columnId === column.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        assignee: task.assignees[0]
          ? {
              id: task.assignees[0].user.id,
              name: task.assignees[0].user.name,
              image: task.assignees[0].user.avatarUrl,
            }
          : null,
        dueDate: task.dueDate,
        labels: task.labels.map((entry) => ({
          id: entry.label.id,
          name: entry.label.name,
          color: entry.label.color,
        })),
        position: task.position,
        columnId: task.columnId,
      })),
  }));

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description,
    columns,
  });
}

// PUT /api/workspaces/[slug]/projects/[id]
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

  if (!hasPermission(result.member.role as Role, "edit:projects")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await db.project.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await db.project.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/workspaces/[slug]/projects/[id]
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

  if (!hasPermission(result.member.role as Role, "delete:projects")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await db.project.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await db.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
