import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { notify, notifyMany, workspaceMemberIds } from "@/lib/notifications";

async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await db.workspace.findUnique({ where: { slug } });
  if (!workspace) return null;
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;
  return { workspace, member };
}

// GET /api/workspaces/[slug]/tasks/[id]/comments
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
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const comments = await db.comment.findMany({
    where: { taskId: id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

// POST /api/workspaces/[slug]/tasks/[id]/comments
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

  const task = await db.task.findUnique({
    where: { id, workspaceId: result.workspace.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: {
      taskId: id,
      userId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const actor = session.user.name ?? session.user.email ?? "Someone";
  const commentText = parsed.data.content ?? "";
  const truncated = commentText.length > 160 ? commentText.slice(0, 160) : commentText;
  const link = `/workspace/${result.workspace.slug}/project/${task.projectId}?task=${task.id}`;

  const assignees = await db.taskAssignee.findMany({
    where: { taskId: id },
    select: { userId: true },
  });
  const notifiedIds = new Set<string>();

  for (const a of assignees) {
    if (a.userId && a.userId !== session.user.id) {
      notifiedIds.add(a.userId);
      await notify({
        userId: a.userId,
        workspaceId: result.workspace.id,
        type: "task_comment",
        title: `${actor} commented on ${task.title}`,
        body: truncated,
        link,
      });
    }
  }

  if (
    task.createdBy &&
    task.createdBy !== session.user.id &&
    !notifiedIds.has(task.createdBy)
  ) {
    await notify({
      userId: task.createdBy,
      workspaceId: result.workspace.id,
      type: "task_comment",
      title: `${actor} commented on ${task.title}`,
      body: truncated,
      link,
    });
  }

  if (/@(\w+)/.test(commentText)) {
    const memberIds = await workspaceMemberIds(result.workspace.id, session.user.id);
    await notifyMany(
      memberIds,
      {
        workspaceId: result.workspace.id,
        type: "mention",
        title: `${actor} mentioned someone in a comment`,
        body: truncated,
        link,
      },
      session.user.id,
    );
  }

  return NextResponse.json(comment, { status: 201 });
}
