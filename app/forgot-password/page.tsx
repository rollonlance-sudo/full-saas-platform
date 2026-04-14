"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

      if (res.ok) {
        setSent(true);
      } else {
        toast.error("Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="relative z-10 w-full max-w-md text-center animate-fade-in">
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200 animate-scale-in">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-3 text-sm text-gray-500">
              We sent a password reset link to<br />
              <strong className="text-gray-700">{email}</strong>
            </p>
            <Link href="/login" className="mt-6 inline-block">
              <Button variant="outline" className="gap-2 hover-lift">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FlowBoard</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-gray-100/50">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Mail className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Sending...
                </span>
              ) : "Send reset link"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
