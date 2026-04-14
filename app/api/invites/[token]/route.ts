import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await db.invite.findUnique({
      where: { token },
      include: {
        workspace: { select: { name: true } },
        inviter: { select: { name: true, email: true } },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found." },
        { status: 404 }
      );
    }

    if (invite.accepted) {
      return NextResponse.json(
        { error: "This invite has already been used." },
        { status: 400 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      workspaceName: invite.workspace.name,
      inviterName: invite.inviter.name || invite.inviter.email,
      role: invite.role,
      email: invite.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
