import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/notifications/[id]/read
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const notification = await db.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const updated = await db.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json(updated);
}
