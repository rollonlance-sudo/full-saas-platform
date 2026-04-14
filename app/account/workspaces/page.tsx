"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-2xl space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const workspaces = data?.workspaces || [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Workspaces</h1>
            <p className="text-sm text-gray-500">Select a workspace or create a new one</p>
          </div>
          <Link href="/onboarding">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Workspace
            </Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {workspaces.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">You haven&apos;t joined any workspaces yet.</p>
                <Link href="/onboarding" className="mt-4 inline-block">
                  <Button>Create your first workspace</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            workspaces.map((ws: { id: string; name: string; slug: string; logoUrl?: string; plan: string; currentUserRole: string; _count?: { members: number } }) => (
              <Link key={ws.id} href={`/workspace/${ws.slug}`}>
                <Card className="transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                        {ws.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{ws.name}</h3>
                        <p className="text-xs text-gray-500">
                          {ws.currentUserRole} &middot; {ws.plan} plan
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">&rarr;</span>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
