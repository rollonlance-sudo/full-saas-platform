import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function markRead(id: string, userId: string) {
  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) return null;
  return db.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

// PUT /api/notifications/[id]/read
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const updated = await markRead(id, session.user.id);
  if (!updated) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// PATCH alias — matches client
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  return PUT(req, ctx);
}
