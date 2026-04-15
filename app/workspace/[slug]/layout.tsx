"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/lib/stores";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  Menu,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentWorkspace, setCurrentWorkspace, sidebarOpen, toggleSidebar } =
    useWorkspaceStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-3">
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          <Link
            href={`/workspace/${slug}/settings`}
            className="flex min-w-0 items-center gap-2"
          >
            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2))] text-xs font-bold text-white">
              {workspace?.name?.[0]?.toUpperCase() || "W"}
            </div>
            <span className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--fg)]">
              {workspace?.name}
            </span>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1.5 hover:bg-[var(--surface-muted)]">
            <ChevronDown className="h-4 w-4 text-[var(--fg-subtle)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => (window.location.href = "/account/workspaces")}>
              Switch workspace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (window.location.href = "/onboarding")}>
              <Plus className="h-4 w-4" /> Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/workspace/${slug}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] text-[var(--primary)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[linear-gradient(180deg,var(--aurora-1),var(--aurora-2))]" />
                )}
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
              Projects
            </span>
            <Link
              href={`/workspace/${slug}/projects`}
              className="grid h-5 w-5 place-items-center rounded text-[var(--fg-subtle)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
            >
              <Plus className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {projects?.projects?.map(
              (project: { id: string; name: string; icon?: string }) => {
                const active = pathname.includes(project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/workspace/${slug}/project/${project.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-[var(--primary)]"
                        : "text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]",
                    )}
                  >
                    <span>{project.icon || "📋"}</span>
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              },
            )}
            {projects?.projects?.length === 0 && (
              <Link
                href={`/workspace/${slug}/projects`}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--fg-subtle)] hover:text-[var(--fg)]"
              >
                <Sparkles className="h-3 w-3" /> Create your first project
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="border-t border-[var(--border)] p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-[var(--surface-muted)]">
            <Avatar
              src={session?.user?.image}
              fallback={session?.user?.name || "U"}
              size="sm"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-medium text-[var(--fg)]">
                {session?.user?.name}
              </div>
              <div className="truncate text-[11px] text-[var(--fg-subtle)]">
                {session?.user?.email}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[14rem]">
            <DropdownMenuItem onClick={() => (window.location.href = "/account/settings")}>
              <Settings className="h-4 w-4" /> Account settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (window.location.href = "/account/workspaces")}>
              <FolderKanban className="h-4 w-4" /> All workspaces
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-300 md:flex",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 md:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/85 px-3 backdrop-blur-md sm:px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden h-9 w-9 place-items-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] md:grid"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>
            <div className="hidden items-center gap-1 text-sm sm:flex">
              <span className="font-medium text-[var(--fg)]">{workspace?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-subtle)]" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] pl-8 pr-2 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)] transition-all focus:border-[var(--primary)] focus:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--border)] bg-[var(--surface)] px-1 text-[10px] text-[var(--fg-subtle)] sm:inline">
                ⌘K
              </kbd>
            </div>
            <ThemeToggle />
            <NotificationBell workspaceSlug={slug} />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="aurora" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => (window.location.href = `/workspace/${slug}/projects`)}
                >
                  <FolderKanban className="h-4 w-4" /> New project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="h-4 w-4" /> New task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = `/workspace/${slug}/docs`)}
                >
                  <FileText className="h-4 w-4" /> New document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
