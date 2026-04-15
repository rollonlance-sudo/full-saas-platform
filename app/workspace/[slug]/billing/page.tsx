"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Users,
  FolderKanban,
  HardDrive,
  Zap,
  ExternalLink,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/motion";

interface BillingData {
  plan: {
    name: string;
    tier: "free" | "pro" | "enterprise";
    price: number;
    interval: "month" | "year";
  };
  usage: {
    members: { current: number; limit: number };
    projects: { current: number; limit: number };
    storage: { current: number; limit: number; unit: string };
  };
  features: string[];
  canUpgrade: boolean;
  hasSubscription: boolean;
}

const PLAN_STYLES: Record<string, string> = {
  free:
    "bg-[var(--surface-muted)] text-[var(--fg-muted)] border-[var(--border)]",
  pro:
    "bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-[var(--primary)] border-[color-mix(in_oklab,var(--primary)_30%,transparent)]",
  enterprise:
    "bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[var(--primary)] border-[color-mix(in_oklab,var(--primary)_40%,transparent)]",
};

function UsageStat({
  icon: Icon,
  label,
  current,
  limit,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  limit: number;
  unit?: string;
}) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-[var(--fg)]">
          <Icon className="h-4 w-4 text-[var(--fg-subtle)]" />
          {label}
        </span>
        <span className="text-[var(--fg-muted)] tabular-nums">
          {current}
          {unit ? ` ${unit}` : ""} / {limit}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={isNearLimit ? "[&>div]:bg-[var(--warning)]" : ""}
      />
    </div>
  );
}

export default function BillingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: billing,
    isLoading,
    error,
  } = useQuery<BillingData>({
    queryKey: ["billing", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/billing`);
      if (!res.ok) throw new Error("Failed to fetch billing info");
      return res.json();
    },
  });

  const checkout = useMutation({
    mutationFn: async (plan: "pro" | "enterprise" = "pro") => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: slug, plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create checkout session");
      }
      return data.url as string;
    },
    onSuccess: (url) => {
      if (url) window.location.href = url;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    },
  });

  const portal = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: slug }),
      });
      if (!res.ok) throw new Error("Failed to access billing portal");
      const data = await res.json();
      return data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("Failed to open billing portal. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-32" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 bg-[var(--bg)]">
        <p className="text-[var(--danger)]">Failed to load billing information.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
        <FadeIn>
          <div>
            <h1 className="text-display text-3xl font-bold tracking-[-0.02em] text-[var(--fg)]">Billing</h1>
            <p className="text-[var(--fg-muted)] mt-1">
              Manage your subscription and view usage
            </p>
          </div>
        </FadeIn>

        {/* Hero plan card */}
        <div className="relative">
          <Card className="border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] ring-1 ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 tracking-[-0.01em]">
                  <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                  Current Plan
                </CardTitle>
                <Badge variant="outline" className={PLAN_STYLES[billing.plan.tier]}>
                  {billing.plan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-[-0.02em] text-[var(--fg)]">
                    ${billing.plan.price}
                  </span>
                  <span className="text-[var(--fg-muted)]">
                    /{billing.plan.interval}
                  </span>
                </div>
                {billing.features.length > 0 && (
                  <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">
                    {billing.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-[var(--fg-muted)]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--success)_14%,transparent)] shrink-0">
                          <Check className="h-3 w-3 text-[var(--success)]" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              {billing.canUpgrade && (
                <Button
                  variant="aurora"
                  onClick={() => checkout.mutate("pro")}
                  disabled={checkout.isPending}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {checkout.isPending ? "Loading..." : "Upgrade Plan"}
                </Button>
              )}
              {billing.hasSubscription && (
                <Button
                  variant="outline"
                  onClick={() => portal.mutate()}
                  disabled={portal.isPending}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {portal.isPending ? "Loading..." : "Manage Subscription"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="tracking-[-0.01em]">Usage</CardTitle>
            <CardDescription>
              Your current resource usage for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsageStat
              icon={Users}
              label="Members"
              current={billing.usage.members.current}
              limit={billing.usage.members.limit}
            />
            <UsageStat
              icon={FolderKanban}
              label="Projects"
              current={billing.usage.projects.current}
              limit={billing.usage.projects.limit}
            />
            <UsageStat
              icon={HardDrive}
              label="Storage"
              current={billing.usage.storage.current}
              limit={billing.usage.storage.limit}
              unit={billing.usage.storage.unit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
