"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  UserPlus,
  ClipboardList,
  FileText,
  Sparkles,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  message?: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export function NotificationBell({ workspaceSlug: _workspaceSlug }: { workspaceSlug: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const removeOne = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const getIcon = (type: string) => {
    const base =
      "flex h-8 w-8 items-center justify-center rounded-full shrink-0";
    switch (type) {
      case "comment":
        return (
          <div className={`${base} bg-[color-mix(in_oklab,var(--primary)_14%,transparent)]`}>
            <MessageSquare className="h-4 w-4 text-[var(--primary)]" />
          </div>
        );
      case "invite":
      case "member":
        return (
          <div className={`${base} bg-[color-mix(in_oklab,var(--success)_14%,transparent)]`}>
            <UserPlus className="h-4 w-4 text-[var(--success)]" />
          </div>
        );
      case "task":
        return (
          <div className={`${base} bg-[color-mix(in_oklab,var(--primary)_14%,transparent)]`}>
            <ClipboardList className="h-4 w-4 text-[var(--primary)]" />
          </div>
        );
      case "document":
        return (
          <div className={`${base} bg-[color-mix(in_oklab,var(--warning)_14%,transparent)]`}>
            <FileText className="h-4 w-4 text-[var(--warning)]" />
          </div>
        );
      case "release":
        return (
          <div
            className={`${base} text-white`}
            style={{
              background:
                "linear-gradient(135deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))",
            }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
        );
      case "system":
        return (
          <div className={`${base} bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]`}>
            <Megaphone className="h-4 w-4 text-[var(--primary)]" />
          </div>
        );
      default:
        return (
          <div className={`${base} bg-[var(--surface-muted)]`}>
            <Bell className="h-4 w-4 text-[var(--fg-subtle)]" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ring-2 ring-[var(--surface)]"
            style={{ backgroundColor: "var(--danger)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(96vw,24rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-scale-in origin-top-right">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] p-4">
            <h3 className="font-semibold tracking-[-0.01em] text-[var(--fg)]">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-[var(--fg-subtle)]">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--primary)] transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAll.mutate()}
                  disabled={clearAll.isPending}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
                  title="Clear all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                  <Bell className="h-6 w-6 text-[var(--fg-subtle)]" />
                </div>
                <p className="text-sm font-medium text-[var(--fg)]">No notifications yet</p>
                <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-3 border-b border-[var(--border)] p-4 last:border-0 transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_6%,transparent)] ${
                    !n.isRead
                      ? "bg-[color-mix(in_oklab,var(--primary)_5%,transparent)]"
                      : ""
                  }`}
                >
                  <div
                    className="flex flex-1 items-start gap-3 cursor-pointer min-w-0"
                    onClick={() => {
                      if (!n.isRead) markRead.mutate(n.id);
                      if (n.link) window.location.href = n.link;
                      setOpen(false);
                    }}
                  >
                    {getIcon(n.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--fg)]">{n.title}</p>
                      {(n.message || n.body) && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--fg-muted)]">
                          {n.message || n.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                        {formatRelativeTime(new Date(n.createdAt))}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div
                        className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOne.mutate(n.id);
                    }}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-[var(--fg-subtle)] opacity-0 transition-all hover:bg-[var(--surface-muted)] hover:text-[var(--danger)] group-hover:opacity-100"
                    aria-label="Remove notification"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
