"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { LogoMark } from "@/components/ui/logo";
import { Check, Star, ArrowRight } from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    description: "For individuals and small teams getting started.",
    features: [
      "Up to 5 members",
      "3 projects",
      "100 MB storage",
      "30-day task history",
      "Basic collaboration",
      "Kanban boards",
      "Document editor",
      "Email notifications",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlighted: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 12,
    period: "per member / month",
    description: "For growing teams that need more power and flexibility.",
    features: [
      "Up to 50 members",
      "Unlimited projects",
      "10 GB storage",
      "Unlimited task history",
      "Real-time collaboration",
      "Timeline / Gantt view",
      "Custom fields",
      "Advanced filters",
      "Priority labels",
      "Bulk actions",
    ],
    cta: "Start Pro Trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 25,
    period: "per member / month",
    description: "For large organizations with advanced security needs.",
    features: [
      "Unlimited members",
      "Unlimited projects",
      "100 GB storage",
      "Unlimited task history",
      "Real-time + version history",
      "Timeline / Gantt view",
      "Custom fields",
      "Admin audit log",
      "Priority support",
      "SSO / SAML",
      "Advanced permissions",
      "API access",
    ],
    cta: "Contact Sales",
    href: "/signup?plan=enterprise",
    highlighted: false,
  },
];

const comparisonFeatures = [
  { name: "Team members", free: "Up to 5", pro: "Up to 50", enterprise: "Unlimited" },
  { name: "Projects", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Storage", free: "100 MB", pro: "10 GB", enterprise: "100 GB" },
  { name: "Task history", free: "30 days", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Kanban boards", free: true, pro: true, enterprise: true },
  { name: "List view", free: true, pro: true, enterprise: true },
  { name: "Document editor", free: true, pro: true, enterprise: true },
  { name: "Real-time collaboration", free: false, pro: true, enterprise: true },
  { name: "Timeline / Gantt", free: false, pro: true, enterprise: true },
  { name: "Custom fields", free: false, pro: true, enterprise: true },
  { name: "Audit log", free: false, pro: false, enterprise: true },
  { name: "SSO / SAML", free: false, pro: false, enterprise: true },
  { name: "Priority support", free: false, pro: false, enterprise: true },
  { name: "API access", free: false, pro: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="container-aurora flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">FlowBoard</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="aurora" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <AuroraBackground className="px-4 py-20 sm:py-24">
        <FadeIn className="container-aurora text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--violet-500)] backdrop-blur">
            Pricing
          </div>
          <h1 className="text-display text-4xl sm:text-6xl">
            Simple, transparent <span className="gradient-text-sweep">pricing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--fg-muted)]">
            Choose the plan that fits your team. Start free, upgrade when you need more.
          </p>
        </FadeIn>
      </AuroraBackground>

      <section className="container-aurora pb-20">
        <StaggerGroup className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <StaggerItem key={plan.key} className="relative">
              <div
                className={`relative flex h-full flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "bg-[linear-gradient(160deg,var(--violet-600),var(--violet-700))] text-white shadow-[var(--shadow-glow)] ring-1 ring-[color-mix(in_oklab,var(--violet-400)_55%,transparent)]"
                    : "border border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[linear-gradient(135deg,var(--amber-400),var(--rose-400))] px-4 py-1 text-xs font-bold text-white shadow-lg">
                    <Star className="h-3 w-3 fill-current" /> Most popular
                  </div>
                )}
                <h3
                  className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                    plan.highlighted ? "text-white/80" : "text-[var(--fg-muted)]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlighted ? "text-white/75" : "text-[var(--fg-muted)]"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-extrabold tracking-[-0.03em] ${
                      plan.highlighted ? "text-white" : "text-[var(--fg)]"
                    }`}
                  >
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/75" : "text-[var(--fg-subtle)]"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <Link href={plan.href} className="mt-6 block">
                  <Button
                    variant={plan.highlighted ? "glass" : "aurora"}
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "!bg-white !text-[var(--violet-600)] hover:!bg-white/95"
                        : ""
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 text-sm ${
                        plan.highlighted ? "text-white/90" : "text-[var(--fg-muted)]"
                      }`}
                    >
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          plan.highlighted ? "text-white/90" : "text-[var(--primary)]"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container-aurora pb-20">
        <FadeIn className="mx-auto max-w-5xl">
          <h2 className="text-display mb-10 text-center text-2xl sm:text-3xl">Compare plans</h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                    <th className="py-4 pl-6 pr-4 text-left text-sm font-semibold text-[var(--fg)]">
                      Feature
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--fg)]">
                      Free
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--primary)]">
                      Pro
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--fg)]">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature) => (
                    <tr
                      key={feature.name}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="py-4 pl-6 pr-4 text-sm text-[var(--fg)]">{feature.name}</td>
                      {(["free", "pro", "enterprise"] as const).map((plan) => (
                        <td key={plan} className="px-4 py-4 text-center text-sm">
                          {typeof feature[plan] === "boolean" ? (
                            feature[plan] ? (
                              <Check className="mx-auto h-5 w-5 text-[var(--primary)]" />
                            ) : (
                              <span className="text-[var(--fg-subtle)]">—</span>
                            )
                          ) : (
                            <span className="font-medium text-[var(--fg)]">{feature[plan]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--violet-700),var(--violet-500)_50%,#3b0764)] py-20">
        <div aria-hidden className="absolute inset-0 grid-pattern opacity-10" />
        <FadeIn className="container-aurora relative text-center">
          <h2 className="text-display text-3xl text-white sm:text-4xl">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">
            Join thousands of teams already using FlowBoard to manage their projects.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button
              variant="glass"
              size="xl"
              className="!bg-white !text-[var(--violet-700)] hover:!bg-white/95 gap-2"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </FadeIn>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--fg-subtle)]">
        <p>&copy; {new Date().getFullYear()} FlowBoard. All rights reserved.</p>
      </footer>
    </div>
  );
}
