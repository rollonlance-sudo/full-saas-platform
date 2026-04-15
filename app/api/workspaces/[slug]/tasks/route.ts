import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validations";
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

// GET /api/workspaces/[slug]/tasks
export async function GET(
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

  const searchParams = req.nextUrl.searchParams;
  const assignee = searchParams.get("assignee");
  const columnId = searchParams.get("columnId");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    workspaceId: result.workspace.id,
    isArchived: false,
  };

  if (assignee === "me") {
    where.assignees = { some: { userId: session.user.id } };
  } else if (assignee) {
    where.assignees = { some: { userId: assignee } };
  }

  if (columnId) where.columnId = columnId;
  if (priority) where.priority = priority;
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        labels: { include: { label: true } },
        column: { select: { id: true, name: true } },
      },
      orderBy: { position: "asc" },
      skip,
      take: limit,
    }),
    db.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/workspaces/[slug]/tasks
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
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, priority, columnId, dueDate, assigneeIds, labelIds } =
    parsed.data;
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Verify project belongs to workspace
  const project = await db.project.findUnique({
    where: { id: projectId, workspaceId: result.workspace.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Get next position in column
  const maxPosition = await db.task.aggregate({
    where: { columnId: columnId || undefined, projectId },
    _max: { position: true },
  });

  const task = await db.task.create({
    data: {
      projectId,
      workspaceId: result.workspace.id,
      columnId,
      title,
      description,
      priority,
      position: (maxPosition._max.position ?? -1) + 1,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: session.user.id,
      ...(assigneeIds?.length && {
        assignees: {
          create: assigneeIds.map((userId: string) => ({ userId })),
        },
      }),
      ...(labelIds?.length && {
        labels: {
          create: labelIds.map((labelId: string) => ({ labelId })),
        },
      }),
    },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      labels: { include: { label: true } },
    },
  });

  if (assigneeIds?.length) {
    const actor = session.user.name ?? session.user.email ?? "Someone";
    for (const assigneeId of assigneeIds) {
      if (assigneeId && assigneeId !== session.user.id) {
        await notify({
          userId: assigneeId,
          workspaceId: result.workspace.id,
          type: "task_assigned",
          title: `${actor} assigned you a task`,
          body: task.title,
          link: `/workspace/${result.workspace.slug}/project/${task.projectId}?task=${task.id}`,
        });
      }
    }
  }

  return NextResponse.json(task, { status: 201 });
}
