"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/lib/stores";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  FolderKanban,
  FileText,
  Users,
  Settings,
  CreditCard,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentWorkspace, setCurrentWorkspace, sidebarOpen, toggleSidebar } = useWorkspaceStore();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        logoUrl: workspace.logoUrl,
        plan: workspace.plan,
        role: workspace.currentUserRole,
      });
    }
  }, [workspace, setCurrentWorkspace]);

  const navItems = [
    { href: `/workspace/${slug}`, icon: Home, label: "Home" },
    { href: `/workspace/${slug}/projects`, icon: FolderKanban, label: "Projects" },
    { href: `/workspace/${slug}/docs`, icon: FileText, label: "Documents" },
    { href: `/workspace/${slug}/members`, icon: Users, label: "Members" },
    { href: `/workspace/${slug}/settings`, icon: Settings, label: "Settings" },
  ];

  const isAdmin = currentWorkspace?.role === "owner" || currentWorkspace?.role === "admin";

  if (isAdmin) {
    navItems.push({
      href: `/workspace/${slug}/billing`,
      icon: CreditCard,
      label: "Billing",
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-gray-200 bg-white transition-all ${
          sidebarOpen ? "w-60" : "w-0 overflow-hidden"
        }`}
      >
        {/* Workspace Header */}
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-3">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <Link
              href={`/workspace/${slug}/settings`}
              className="flex items-center gap-2 truncate"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">
                {workspace?.name?.[0]?.toUpperCase() || "W"}
              </div>
              <span className="truncate text-sm font-semibold text-gray-900">
                {workspace?.name}
              </span>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded p-1 hover:bg-gray-100">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.location.href = "/account/workspaces"}>
                Switch workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/onboarding"}>
                Create workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Projects sub-list */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs font-medium uppercase text-gray-400">Projects</span>
              <Link href={`/workspace/${slug}/projects`}>
                <Plus className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </Link>
            </div>
            {projects?.projects?.map((project: { id: string; name: string; icon?: string }) => (
              <Link
                key={project.id}
                href={`/workspace/${slug}/project/${project.id}`}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                  pathname.includes(project.id)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{project.icon || "📋"}</span>
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100">
              <Avatar
                src={session?.user?.image}
                fallback={session?.user?.name || "U"}
                size="sm"
              />
              <span className="truncate text-sm text-gray-700">{session?.user?.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => window.location.href = "/account/settings"}>
                Account settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="rounded p-1 hover:bg-gray-100">
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5 text-gray-500" />
              ) : (
                <PanelLeft className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{workspace?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Link href={`/workspace/${slug}`}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => window.location.href = `/workspace/${slug}/projects`}>
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem>New Task</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = `/workspace/${slug}/docs`}>
                  New Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
