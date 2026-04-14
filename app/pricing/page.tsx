"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl">FlowBoard</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your team. Start free, upgrade when you need more.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border-2 p-8 flex flex-col ${
                plan.highlighted
                  ? "border-blue-600 shadow-xl shadow-blue-100 relative"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 text-sm ml-2">{plan.period}</span>
                )}
              </div>
              <Link href={plan.href} className="mb-8">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 pr-4 font-medium text-gray-900">Feature</th>
                <th className="py-4 px-4 text-center font-medium text-gray-900">Free</th>
                <th className="py-4 px-4 text-center font-medium text-blue-600">Pro</th>
                <th className="py-4 px-4 text-center font-medium text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr key={feature.name} className="border-b">
                  <td className="py-4 pr-4 text-sm text-gray-600">{feature.name}</td>
                  {(["free", "pro", "enterprise"] as const).map((plan) => (
                    <td key={plan} className="py-4 px-4 text-center text-sm">
                      {typeof feature[plan] === "boolean" ? (
                        feature[plan] ? (
                          <Check className="w-5 h-5 text-blue-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-gray-900 font-medium">{feature[plan]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Join thousands of teams already using FlowBoard to manage their projects.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8">
            Start for free
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} FlowBoard. All rights reserved.</p>
      </footer>
    </div>
  );
}
