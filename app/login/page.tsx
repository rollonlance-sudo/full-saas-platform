"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/account/workspaces");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Left side - decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl animate-blob delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl animate-float-slow" />

        <div className="relative z-10 flex flex-col items-start justify-center px-16 text-white">
          <Link href="/" className="mb-12 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <span className="text-lg font-bold">F</span>
            </div>
            <span className="text-2xl font-bold">FlowBoard</span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight animate-fade-in">
            Welcome back to<br />
            <span className="text-indigo-200">your workspace</span>
          </h2>
          <p className="mt-6 text-lg text-indigo-200/80 max-w-md animate-fade-in delay-200">
            Pick up right where you left off. Your projects, documents, and team are waiting.
          </p>

          {/* Decorative cards */}
          <div className="mt-12 space-y-4 animate-fade-in-up delay-400 w-full max-w-sm">
            {[
              { label: "Active projects", value: "12", color: "from-white/20 to-white/5" },
              { label: "Team members online", value: "8", color: "from-white/15 to-white/5" },
              { label: "Tasks completed today", value: "34", color: "from-white/10 to-white/5" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${item.color} backdrop-blur-sm border border-white/10 px-5 py-3`}>
                <span className="text-sm text-indigo-100">{item.label}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2 relative">
        <div className="absolute inset-0 mesh-gradient opacity-30 lg:hidden" />
        <div className="absolute inset-0 dot-pattern opacity-20 lg:hidden" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {/* Mobile back link */}
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          {/* Mobile logo */}
          <div className="text-center lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlowBoard</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-gray-100/50">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-500">Sign in to your account to continue</p>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                onClick={() => signIn("google", { callbackUrl: "/account/workspaces" })}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                onClick={() => signIn("github", { callbackUrl: "/account/workspaces" })}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Continue with GitHub
              </Button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1.5">Demo Account</p>
              <div className="flex items-center justify-between text-xs text-indigo-600">
                <span>demo@flowboard.app</span>
                <span className="font-mono">Demo1234!</span>
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 transition-colors"
                onClick={() => setForm({ email: "demo@flowboard.app", password: "Demo1234!" })}
              >
                Fill demo credentials
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
