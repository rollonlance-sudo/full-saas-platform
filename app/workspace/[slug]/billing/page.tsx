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

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  pro: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  enterprise: "bg-purple-500/10 text-purple-700 border-purple-500/20",
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
        <span className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="text-muted-foreground">
          {current}
          {unit ? ` ${unit}` : ""} / {limit}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={isNearLimit ? "[&>div]:bg-amber-500" : ""}
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
    mutationFn: async () => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: slug }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();
      return data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("Failed to start checkout. Please try again.");
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
      <div className="p-6 space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-destructive">Failed to load billing information.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <Badge
                variant="outline"
                className={PLAN_COLORS[billing.plan.tier]}
              >
                {billing.plan.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-3xl font-bold">
                  ${billing.plan.price}
                </span>
                <span className="text-muted-foreground">
                  /{billing.plan.interval}
                </span>
              </div>
              {billing.features.length > 0 && (
                <ul className="space-y-1.5 text-sm">
                  {billing.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {billing.canUpgrade && (
              <Button
                onClick={() => checkout.mutate()}
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

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
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
