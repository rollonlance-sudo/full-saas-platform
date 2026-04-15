"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
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
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 animate-scale-in place-items-center rounded-full bg-[linear-gradient(135deg,var(--success),color-mix(in_oklab,var(--success)_60%,#0b0b14))] text-white shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--success)_50%,transparent)]">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]">Password reset</h1>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                Your password has been successfully reset. You can now log in with your new
                password.
              </p>
              <Link href="/login" className="mt-6 inline-block w-full">
                <Button variant="aurora" size="lg" className="w-full">
                  Go to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2))] text-white shadow-[var(--shadow-glow)]">
                  <Lock className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-[-0.02em]">Set new password</h1>
                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] p-3 text-sm text-[var(--danger)]">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 pl-10"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="aurora"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </AuroraBackground>
  );
}
