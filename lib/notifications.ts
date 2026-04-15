import { db } from "./db";

type NotifyInput = {
  userId: string;
  workspaceId: string;
  type:
    | "task_assigned"
    | "task_status"
    | "task_comment"
    | "mention"
    | "invite"
    | "member_joined"
    | "role_changed"
    | "project"
    | "document"
    | "system"
    | "release";
  title: string;
  body?: string | null;
  link?: string | null;
};

/**
 * Create a notification for a single user. Errors are swallowed so a
 * notification failure never breaks the originating request.
 */
export async function notify(input: NotifyInput) {
  try {
    await db.notification.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("[notify] failed:", err);
  }
}

/** Fan out the same notification to many users, skipping a sender if provided. */
export async function notifyMany(
  userIds: string[],
  base: Omit<NotifyInput, "userId">,
  skipUserId?: string,
) {
  const targets = Array.from(new Set(userIds)).filter(
    (id) => id && id !== skipUserId,
  );
  if (targets.length === 0) return;
  try {
    await db.notification.createMany({
      data: targets.map((userId) => ({
        userId,
        workspaceId: base.workspaceId,
        type: base.type,
        title: base.title,
        body: base.body ?? null,
        link: base.link ?? null,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("[notifyMany] failed:", err);
  }
}

/** Return all member user IDs for a workspace (excluding an optional sender). */
export async function workspaceMemberIds(workspaceId: string, skipUserId?: string) {
  const members = await db.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  return members
    .map((m) => m.userId)
    .filter((id) => id !== skipUserId);
}

/**
 * Broadcast a system-wide announcement to every workspace member.
 * Creates one Notification per (user, workspace) pair so it appears in
 * every workspace's notification bell. Use for product updates, outages,
 * release notes, or platform changes.
 */
export async function broadcastSystemUpdate(opts: {
  title: string;
  body?: string | null;
  link?: string | null;
  type?: "system" | "release";
}) {
  const { title, body = null, link = null, type = "system" } = opts;

  const memberships = await db.workspaceMember.findMany({
    select: { userId: true, workspaceId: true },
  });
  if (memberships.length === 0) return { created: 0 };

  try {
    const { count } = await db.notification.createMany({
      data: memberships.map((m) => ({
        userId: m.userId,
        workspaceId: m.workspaceId,
        type,
        title,
        body,
        link,
      })),
      skipDuplicates: true,
    });
    return { created: count };
  } catch (err) {
    console.error("[broadcastSystemUpdate] failed:", err);
    return { created: 0, error: err };
  }
}
