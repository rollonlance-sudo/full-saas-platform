import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { broadcastSystemUpdate } from "@/lib/notifications";

/**
 * POST /api/system/announce
 *
 * Broadcasts a system-wide notification to every workspace member.
 * Gated by a shared secret (env: SYSTEM_BROADCAST_KEY) OR by an allow-listed
 * admin email (env: SYSTEM_ADMIN_EMAIL, comma-separated allowed).
 *
 * Body: { title: string; body?: string; link?: string; type?: "system" | "release" }
 * Header: `X-System-Key: <SYSTEM_BROADCAST_KEY>` (alternative to session-based auth)
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SYSTEM_BROADCAST_KEY;
  const provided = req.headers.get("x-system-key");

  let authorized = false;

  // Key-based auth (for CI / ops scripts)
  if (secret && provided && provided === secret) {
    authorized = true;
  }

  // Session-based auth (email allow list)
  if (!authorized) {
    const session = await auth();
    const admins = (process.env.SYSTEM_ADMIN_EMAIL ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const email = session?.user?.email?.toLowerCase();
    if (email && admins.includes(email)) authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    title?: string;
    body?: string;
    link?: string;
    type?: "system" | "release";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const result = await broadcastSystemUpdate({
    title: body.title,
    body: body.body ?? null,
    link: body.link ?? null,
    type: body.type ?? "system",
  });

  return NextResponse.json({ success: true, ...result });
}
