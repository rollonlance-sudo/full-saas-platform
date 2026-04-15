"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getGreeting, formatRelativeTime } from "@/lib/utils";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";

export default function WorkspaceDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: activity } = useQuery({
    queryKey: ["activity", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/activity`);
      if (!res.ok) return { activities: [] };
      return res.json();
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects`);
      if (!res.ok) return { projects: [] };
      return res.json();
    },
  });

  const { data: myTasks } = useQuery({
    queryKey: ["my-tasks", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/tasks?assignee=me`);
      if (!res.ok) return { tasks: [] };
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Projects",
      value: projects?.projects?.length || 0,
      icon: FolderKanban,
      tint: "text-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)]",
    },
    {
      label: "Open Tasks",
      value: myTasks?.tasks?.length || 0,
      icon: CheckSquare,
      tint: "text-[var(--success)] bg-[color-mix(in_oklab,var(--success)_12%,transparent)]",
    },
    {
      label: "Completed This Week",
      value: 0,
      icon: TrendingUp,
      tint: "text-[var(--warning)] bg-[color-mix(in_oklab,var(--warning)_12%,transparent)]",
    },
    {
      label: "Team Members",
      value: dashboard?.memberCount || 0,
      icon: Users,
      tint: "text-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)]",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome */}
      <FadeIn>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard
              </span>
            </p>
            <h1 className="text-display mt-1 text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[var(--fg)]">
              {getGreeting()}, {session?.user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--fg-subtle)]">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="h-full">
              <Card className="card-aurora h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                <CardContent className="flex h-full items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="gradient-text-sweep text-3xl font-bold tracking-[-0.02em]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                      {stat.label}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* My Tasks */}
          <Card className="card-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                  Your Queue
                </p>
                <CardTitle className="mt-1 text-lg font-semibold tracking-[-0.01em]">
                  My Tasks
                </CardTitle>
              </div>
              <CheckSquare className="h-4 w-4 text-[var(--fg-subtle)]" />
            </CardHeader>
            <CardContent>
              {myTasks?.tasks?.length ? (
                <div className="space-y-1.5">
                  {myTasks.tasks.slice(0, 8).map((task: { id: string; title: string; priority: string; dueDate?: string; project?: { name: string } }) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-[var(--surface)] ${
                            task.priority === "urgent"
                              ? "bg-[var(--danger)] ring-[color-mix(in_oklab,var(--danger)_40%,transparent)]"
                              : task.priority === "high"
                              ? "bg-[var(--warning)] ring-[color-mix(in_oklab,var(--warning)_40%,transparent)]"
                              : task.priority === "medium"
                              ? "bg-[var(--warning)] ring-[color-mix(in_oklab,var(--warning)_30%,transparent)]"
                              : "bg-[var(--fg-subtle)] ring-[color-mix(in_oklab,var(--fg-subtle)_30%,transparent)]"
                          }`}
                        />
                        <span className="text-sm text-[var(--fg-muted)] truncate">
                          {task.title}
                        </span>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-[var(--fg-subtle)] shrink-0 ml-2">
                          {formatRelativeTime(task.dueDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)]">
                    <CheckSquare className="h-6 w-6 text-[var(--fg-subtle)]" />
                  </div>
                  <p className="mt-3 text-sm text-[var(--fg-subtle)]">
                    No tasks assigned to you
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                  Stream
                </p>
                <CardTitle className="mt-1 text-lg font-semibold tracking-[-0.01em]">
                  Recent Activity
                </CardTitle>
              </div>
              <Activity className="h-4 w-4 text-[var(--fg-subtle)]" />
            </CardHeader>
            <CardContent>
              {activity?.activities?.length ? (
                <div className="space-y-4">
                  {activity.activities.slice(0, 8).map((item: { id: string; user?: { name: string; avatarUrl?: string }; action: string; metadata?: Record<string, string>; createdAt: string }) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Avatar
                        src={item.user?.avatarUrl}
                        fallback={item.user?.name || "U"}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--fg-muted)]">
                          <span className="font-medium text-[var(--fg)]">
                            {item.user?.name}
                          </span>{" "}
                          {item.action.replace(/\./g, " ")}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)]">
                    <Activity className="h-6 w-6 text-[var(--fg-subtle)]" />
                  </div>
                  <p className="mt-3 text-sm text-[var(--fg-subtle)]">
                    No recent activity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Project Cards */}
      {projects?.projects?.length > 0 && (
        <FadeIn delay={0.2}>
          <div>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                  Workspace
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">
                  Projects
                </h2>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  Jump back into your team&apos;s active work.
                </p>
              </div>
            </div>
            <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.projects.map((project: { id: string; name: string; icon?: string; description?: string; _count?: { tasks: number }; updatedAt: string }) => (
                <StaggerItem key={project.id}>
                  <Link href={`/workspace/${slug}/project/${project.id}`}>
                    <Card className="card-aurora group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-lg">
                              {project.icon || "📋"}
                            </span>
                            <h3 className="font-semibold tracking-[-0.01em] text-[var(--fg)] truncate">
                              {project.name}
                            </h3>
                          </div>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                        </div>
                        {project.description && (
                          <p className="mt-2 truncate text-sm text-[var(--fg-muted)]">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-4">
                          <Progress value={0} />
                        </div>
                        <p className="mt-3 text-xs text-[var(--fg-subtle)]">
                          Updated {formatRelativeTime(project.updatedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
