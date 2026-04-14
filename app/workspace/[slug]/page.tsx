"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getGreeting, formatRelativeTime } from "@/lib/utils";
import { FolderKanban, CheckSquare, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
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
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Open Tasks",
      value: myTasks?.tasks?.length || 0,
      icon: CheckSquare,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Completed This Week",
      value: 0,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Team Members",
      value: dashboard?.memberCount || 0,
      icon: Users,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks?.tasks?.length ? (
              <div className="space-y-2">
                {myTasks.tasks.slice(0, 8).map((task: { id: string; title: string; priority: string; dueDate?: string; project?: { name: string } }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.priority === "urgent"
                            ? "bg-red-500"
                            : task.priority === "high"
                            ? "bg-orange-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm text-gray-700">{task.title}</span>
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(task.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckSquare className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No tasks assigned to you</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity?.activities?.length ? (
              <div className="space-y-3">
                {activity.activities.slice(0, 8).map((item: { id: string; user?: { name: string; avatarUrl?: string }; action: string; metadata?: Record<string, string>; createdAt: string }) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Avatar
                      src={item.user?.avatarUrl}
                      fallback={item.user?.name || "U"}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{item.user?.name}</span>{" "}
                        {item.action.replace(/\./g, " ")}
                      </p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      {projects?.projects?.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Projects</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.projects.map((project: { id: string; name: string; icon?: string; description?: string; _count?: { tasks: number }; updatedAt: string }) => (
              <Link key={project.id} href={`/workspace/${slug}/project/${project.id}`}>
                <Card className="transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{project.icon || "📋"}</span>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                    </div>
                    {project.description && (
                      <p className="mt-1 truncate text-sm text-gray-500">{project.description}</p>
                    )}
                    <div className="mt-3">
                      <Progress value={0} />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Updated {formatRelativeTime(project.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
