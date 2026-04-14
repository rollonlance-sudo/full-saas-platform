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

// PUT /api/workspaces/[slug]/tasks/[id]/move
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
  const { columnId, position } = body as { columnId?: string; position: number };

  if (position === undefined || position === null) {
    return NextResponse.json({ error: "position is required" }, { status: 400 });
  }

  const targetColumnId = columnId ?? task.columnId;

  // Shift positions of tasks in the target column
  await db.task.updateMany({
    where: {
      columnId: targetColumnId,
      position: { gte: position },
      id: { not: id },
    },
    data: { position: { increment: 1 } },
  });

  const updated = await db.task.update({
    where: { id },
    data: {
      columnId: targetColumnId,
      position,
    },
    include: {
      column: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
