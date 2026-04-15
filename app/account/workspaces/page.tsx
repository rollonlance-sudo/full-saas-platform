"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowRight, Users } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";

export default function WorkspacesPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="w-full max-w-3xl space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const workspaces = data?.workspaces || [];

  return (
    <div className="flex min-h-screen items-start justify-center bg-[var(--bg)] px-4 py-12 md:py-20">
      <div className="w-full max-w-3xl">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-3xl font-bold tracking-[-0.02em] text-[var(--fg)]">Your Workspaces</h1>
              <p className="text-sm text-[var(--fg-muted)] mt-1">Select a workspace or create a new one</p>
            </div>
            <Link href="/onboarding">
              <Button variant="aurora" className="gap-2">
                <Plus className="h-4 w-4" /> New Workspace
              </Button>
            </Link>
          </div>
        </FadeIn>

        <div className="mt-8">
          {workspaces.length === 0 ? (
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="py-16 text-center">
                <p className="text-[var(--fg-muted)]">You haven&apos;t joined any workspaces yet.</p>
                <Link href="/onboarding" className="mt-4 inline-block">
                  <Button variant="aurora">Create your first workspace</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {workspaces.map((ws: { id: string; name: string; slug: string; logoUrl?: string; plan: string; currentUserRole: string; _count?: { members: number } }) => (
                <StaggerItem key={ws.id}>
                  <Link href={`/workspace/${ws.slug}`}>
                    <Card className="group h-full bg-[var(--surface)] border-[var(--border)] transition-all hover:border-[color-mix(in_oklab,var(--primary)_40%,transparent)] hover:shadow-md cursor-pointer">
                      <CardContent className="flex flex-col gap-4 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[color-mix(in_oklab,var(--primary)_60%,black)] text-lg font-bold text-white shadow-sm">
                            {ws.name[0]?.toUpperCase()}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {ws.currentUserRole}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-semibold tracking-[-0.01em] text-[var(--fg)]">{ws.name}</h3>
                          <p className="text-xs text-[var(--fg-subtle)] capitalize mt-0.5">
                            {ws.plan} plan
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                          <span className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                            <Users className="h-3.5 w-3.5" />
                            {ws._count?.members ?? 0} {ws._count?.members === 1 ? "member" : "members"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] opacity-80 group-hover:opacity-100 transition-opacity">
                            Open
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    </div>
  );
}
