"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const token = params.token as string;

  const [state, setState] = useState<
    "loading" | "preview" | "accepting" | "success" | "error"
  >("loading");
  const [invite, setInvite] = useState<{
    workspaceName: string;
    inviterName: string;
    role: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState("");

  const fetchInvite = useCallback(async () => {
    try {
      const res = await fetch(`/api/invites/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid or expired invite.");
      }
      const data = await res.json();
      setInvite(data);
      setState("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid invite link.");
      setState("error");
    }
  }, [token]);

  useEffect(() => {
    fetchInvite();
  }, [fetchInvite]);

  const handleAccept = async () => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/invite/${token}`);
      return;
    }
    setState("accepting");
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept invite.");
      }
      const data = await res.json();
      setState("success");
      setTimeout(() => router.push(`/workspace/${data.workspaceSlug}`), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept invite.");
      setState("error");
    }
  };

  return (
    <AuroraBackground className="flex min-h-screen items-center justify-center px-4 py-10 text-[var(--fg)]">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-xl font-bold tracking-[-0.02em]">FlowBoard</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 p-8 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {state === "loading" && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--primary)]" />
              <p className="text-sm text-[var(--fg-muted)]">Loading invite...</p>
            </div>
          )}

          {state === "preview" && invite && (
            <div className="text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2))] text-white shadow-[var(--shadow-glow)]">
                <Users className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]">You&apos;re invited</h1>
              <p className="mt-3 text-[var(--fg-muted)]">
                <span className="font-semibold text-[var(--fg)]">{invite.inviterName}</span> has
                invited you to join{" "}
                <span className="font-semibold text-[var(--fg)]">{invite.workspaceName}</span> as
                a <span className="font-medium capitalize text-[var(--primary)]">{invite.role}</span>.
              </p>

              {status === "unauthenticated" && (
                <p className="mt-4 text-sm text-[var(--fg-subtle)]">
                  You&apos;ll need to log in or create an account to accept.
                </p>
              )}

              <div className="mt-6 space-y-3">
                <Button onClick={handleAccept} variant="aurora" size="lg" className="w-full">
                  {status === "unauthenticated" ? "Log in to accept" : "Accept invite"}
                </Button>
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    Decline
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {state === "accepting" && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--primary)]" />
              <p className="text-sm text-[var(--fg-muted)]">Joining workspace...</p>
            </div>
          )}

          {state === "success" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 animate-scale-in place-items-center rounded-full bg-[linear-gradient(135deg,var(--success),color-mix(in_oklab,var(--success)_60%,#0b0b14))] text-white shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--success)_50%,transparent)]">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.02em]">Welcome aboard</h2>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                You&apos;ve joined the workspace. Redirecting you now...
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] text-[var(--danger)]">
                <XCircle className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-[-0.02em]">Invite error</h2>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{error}</p>
              <Link href="/" className="mt-6 inline-block">
                <Button variant="outline">Go to homepage</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuroraBackground>
  );
}
