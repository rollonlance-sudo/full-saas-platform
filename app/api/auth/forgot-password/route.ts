import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Verify user exists (but don't reveal if they do or don't)
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    // TODO: Send password reset email
    // Generate token, store in DB, send email with reset link
  }

  // Always return 200 to prevent email enumeration
  return NextResponse.json({
    message: "If an account exists with that email, a password reset link has been sent.",
  });
}
