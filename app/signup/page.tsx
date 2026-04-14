"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Check, Shield, Zap, Users } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created. Please sign in.");
        router.push("/login");
      } else {
        router.push("/onboarding");
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-10 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl animate-blob delay-500" />
        <div className="absolute top-1/3 left-1/3 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl animate-float" />

        <div className="relative z-10 flex flex-col items-start justify-center px-16 text-white">
          <Link href="/" className="mb-12 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <span className="text-lg font-bold">F</span>
            </div>
            <span className="text-2xl font-bold">FlowBoard</span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight animate-fade-in">
            Start building<br />
            <span className="text-indigo-200">something amazing</span>
          </h2>
          <p className="mt-6 text-lg text-indigo-200/80 max-w-md animate-fade-in delay-200">
            Join thousands of teams who trust FlowBoard to manage their most important work.
          </p>

          {/* Benefits list */}
          <div className="mt-12 space-y-5 animate-fade-in-up delay-400">
            {[
              { icon: Zap, text: "Set up in under 30 seconds" },
              { icon: Users, text: "Invite unlimited team members" },
              { icon: Shield, text: "Enterprise-grade security" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-indigo-100 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-4 py-8 lg:w-1/2 relative">
        <div className="absolute inset-0 mesh-gradient opacity-30 lg:hidden" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="text-center lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlowBoard</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-gray-100/50">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200">
                <UserPlus className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="mt-2 text-sm text-gray-500">Start managing projects in minutes</p>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
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
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {form.password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? strengthColors[strength] : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${
                      strength <= 1 ? "text-red-500" : strength === 2 ? "text-orange-500" : strength === 3 ? "text-yellow-600" : "text-emerald-600"
                    }`}>{strengthLabels[strength]}</p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" id="terms" required className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <Label htmlFor="terms" className="text-xs text-gray-500 font-normal leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">Terms of Service</a> and{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 hover:shadow-purple-300 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    Creating account...
                  </span>
                ) : "Create Account"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
