import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

// GET /api/workspaces/[slug]/tasks/[id]
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

  const task = await db.task.findUnique({
    where: { id, workspaceId: result.workspace.id },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      labels: { include: { label: true } },
      subtasks: { orderBy: { position: "asc" } },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      attachments: { orderBy: { createdAt: "desc" } },
      column: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

// PUT /api/workspaces/[slug]/tasks/[id]
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

  const task = await db.task.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await db.task.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.dueDate !== undefined && {
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      }),
      ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
    },
  });

  const actor = session.user.name ?? session.user.email ?? "Someone";

  // Notify new assignees if assigneeIds changed
  if (Array.isArray(body.assigneeIds)) {
    const existingAssignees = await db.taskAssignee.findMany({
      where: { taskId: id },
      select: { userId: true },
    });
    const existingIds = new Set(existingAssignees.map((a) => a.userId));
    for (const newId of body.assigneeIds as string[]) {
      if (newId && newId !== session.user.id && !existingIds.has(newId)) {
        await notify({
          userId: newId,
          workspaceId: result.workspace.id,
          type: "task_assigned",
          title: `${actor} assigned you a task`,
          body: updated.title,
          link: `/workspace/${result.workspace.slug}/project/${updated.projectId}?task=${updated.id}`,
        });
      }
    }
  }

  // Notify current assignees if status or column changed
  const statusChanged =
    (body.columnId !== undefined && body.columnId !== task.columnId) ||
    (body.status !== undefined && body.status !== (task as unknown as { status?: string }).status);
  if (statusChanged) {
    const assignees = await db.taskAssignee.findMany({
      where: { taskId: id },
      select: { userId: true },
    });
    let statusLabel: string | null = null;
    if (body.columnId && body.columnId !== task.columnId) {
      const col = await db.column.findUnique({
        where: { id: body.columnId },
        select: { name: true },
      });
      statusLabel = col?.name ?? null;
    } else if (body.status) {
      statusLabel = String(body.status);
    }
    for (const a of assignees) {
      if (a.userId && a.userId !== session.user.id) {
        await notify({
          userId: a.userId,
          workspaceId: result.workspace.id,
          type: "task_status",
          title: `${actor} updated ${updated.title}`,
          body: statusLabel,
          link: `/workspace/${result.workspace.slug}/project/${updated.projectId}?task=${updated.id}`,
        });
      }
    }
  }

  return NextResponse.json(updated);
}

// DELETE /api/workspaces/[slug]/tasks/[id]
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

  const task = await db.task.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await db.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
