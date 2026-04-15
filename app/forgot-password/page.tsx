"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else toast.error("Something went wrong");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
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
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 animate-scale-in place-items-center rounded-full bg-[linear-gradient(135deg,var(--success),color-mix(in_oklab,var(--success)_60%,#0b0b14))] text-white shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--success)_50%,transparent)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]">Check your email</h1>
              <p className="mt-3 text-sm text-[var(--fg-muted)]">
                We sent a password reset link to
                <br />
                <strong className="text-[var(--fg)]">{email}</strong>
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--amber-400),var(--rose-400))] text-white shadow-[var(--shadow-glow)]">
                  <Mail className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-[-0.02em]">Reset your password</h1>
                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  variant="aurora"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      </div>
    </AuroraBackground>
  );
}
