"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Users,
  FileText,
  Shield,
  Clock,
  Zap,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  Globe,
  ChevronRight,
  Play,
} from "lucide-react";

// ===== Scroll reveal hook =====
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((child) =>
      observer.observe(child)
    );
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ===== Animated counter component =====
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <span className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

// ===== Typing animation component =====
const typingWords = ["works", "scales", "ships faster", "delights teams"];

function TypingText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentWord = typingWords[wordIndex];

  const tick = useCallback(() => {
    if (isPaused) return;

    if (!isDeleting) {
      if (charIndex < currentWord.length) {
        setCharIndex((c) => c + 1);
      } else {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (charIndex > 0) {
        setCharIndex((c) => c - 1);
      } else {
        setIsDeleting(false);
        setWordIndex((w) => (w + 1) % typingWords.length);
      }
    }
  }, [charIndex, isDeleting, isPaused, currentWord.length, wordIndex]);

  useEffect(() => {
    const speed = isDeleting ? 50 : 100;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className="gradient-text">
      {currentWord.slice(0, charIndex)}
      <span className="animate-blink text-indigo-500">|</span>
    </span>
  );
}

const features = [
  {
    icon: LayoutGrid,
    title: "Boards & Lists",
    description: "Organize work with flexible Kanban boards and list views. Drag and drop tasks effortlessly.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "See changes instantly. Work with your team simultaneously on any project.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Documents & Wiki",
    description: "Create rich documents with a Notion-style editor. Build your team knowledge base.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Role-based Access",
    description: "Granular permissions with Owner, Admin, and Member roles to keep data secure.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Clock,
    title: "Activity Tracking",
    description: "Detailed activity logs and smart notifications so nothing slips through.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "Built with the latest stack for instant page loads and buttery-smooth interactions.",
    gradient: "from-cyan-500 to-blue-600",
  },
];

const steps = [
  { step: "01", title: "Create Workspace", description: "Set up your team workspace in under 30 seconds", icon: Sparkles },
  { step: "02", title: "Invite Team", description: "Add members with role-based access controls", icon: Users },
  { step: "03", title: "Ship Faster", description: "Manage projects, track tasks, and deliver on time", icon: Zap },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 5 members", "3 projects", "100 MB storage", "Basic collaboration"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/member/mo",
    features: ["Up to 50 members", "Unlimited projects", "10 GB storage", "Real-time collaboration", "Timeline view", "Custom fields"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$25",
    period: "/member/mo",
    features: ["Unlimited members", "Unlimited projects", "100 GB storage", "SSO/SAML", "Audit log", "Priority support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Manager",
    company: "TechCorp",
    quote: "FlowBoard transformed how our team collaborates. We shipped 40% faster in the first month.",
    avatar: "SC",
    color: "bg-gradient-to-br from-blue-400 to-indigo-600",
  },
  {
    name: "Marcus Johnson",
    role: "Product Lead",
    company: "StartupXYZ",
    quote: "The best project management tool we've used. Simple, fast, and the real-time features are incredible.",
    avatar: "MJ",
    color: "bg-gradient-to-br from-violet-400 to-purple-600",
  },
  {
    name: "Elena Rodriguez",
    role: "CTO",
    company: "DesignCo",
    quote: "We replaced 3 tools with FlowBoard. The document wiki alone is worth it for our team.",
    avatar: "ER",
    color: "bg-gradient-to-br from-pink-400 to-rose-600",
  },
];

const stats = [
  { value: "10K", suffix: "+", label: "Teams" },
  { value: "2M", suffix: "+", label: "Tasks managed" },
  { value: "99.9", suffix: "%", label: "Uptime" },
  { value: "4.9", suffix: "/5", label: "User rating" },
];

export default function LandingPage() {
  const scrollRef = useScrollReveal();

  return (
    <div className="flex min-h-screen flex-col" ref={scrollRef}>
      {/* ===== Navbar ===== */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FlowBoard
              </span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <a href="#features" className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all">Features</a>
              <a href="#pricing" className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all">Pricing</a>
              <a href="#testimonials" className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all">Reviews</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-20 -left-40 h-80 w-80 rounded-full bg-indigo-200 opacity-30 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-purple-200 opacity-25 blur-3xl animate-blob delay-700" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-pink-200 opacity-20 blur-3xl animate-blob delay-400" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-sm text-indigo-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-medium">Now with real-time collaboration</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>

            <h1 className="animate-fade-in delay-100 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl leading-[1.1]">
              Project management{" "}
              <br className="hidden sm:block" />
              that actually <TypingText />
            </h1>

            <p className="animate-fade-in delay-200 mt-8 text-lg leading-relaxed text-gray-600 sm:text-xl max-w-2xl mx-auto">
              Organize projects, collaborate in real time, and ship faster.
              Your team&rsquo;s work, finally in one beautiful workspace.
            </p>

            <div className="animate-fade-in delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all text-base px-8 h-12">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="gap-2 border-gray-300 h-12 px-8 text-base hover-lift">
                  <Play className="h-4 w-4" /> See how it works
                </Button>
              </a>
            </div>

            {/* Social proof */}
            <div className="animate-fade-in delay-500 mt-12 flex flex-col items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-gradient-to-br from-blue-400 to-blue-600", "bg-gradient-to-br from-violet-400 to-violet-600", "bg-gradient-to-br from-pink-400 to-pink-600", "bg-gradient-to-br from-amber-400 to-amber-600", "bg-gradient-to-br from-emerald-400 to-emerald-600"].map((bg, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full ${bg} ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white`}>
                    {["JD", "AK", "MR", "SC", "LP"][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  Loved by <span className="font-semibold text-gray-900">10,000+</span> teams
                </span>
              </div>
            </div>
          </div>

          {/* Hero Board Mockup */}
          <div className="animate-fade-in-up delay-600 mx-auto mt-20 max-w-5xl">
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />

              <div className="relative rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-xl p-1 shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 rounded-t-xl bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="mx-auto max-w-md rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400 text-center">
                      flowboard.app/workspace/acme/project/sprint-23
                    </div>
                  </div>
                </div>

                {/* Board content */}
                <div className="p-6">
                  <div className="flex gap-4">
                    {[
                      { name: "Backlog", color: "bg-gray-400", count: 4 },
                      { name: "In Progress", color: "bg-blue-500", count: 3 },
                      { name: "In Review", color: "bg-amber-500", count: 2 },
                      { name: "Done", color: "bg-emerald-500", count: 5 },
                    ].map((col, ci) => (
                      <div key={col.name} className="flex-1 min-w-0">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${col.color}`} />
                            <span className="text-sm font-semibold text-gray-800">{col.name}</span>
                          </div>
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">{col.count}</span>
                        </div>
                        <div className="space-y-2">
                          {Array.from({ length: Math.min(col.count, 3) }, (_, i) => (
                            <div
                              key={i}
                              className={`rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${ci === 1 && i === 0 ? "ring-2 ring-indigo-500/30" : ""}`}
                              style={{ animationDelay: `${(ci * 3 + i) * 100}ms` }}
                            >
                              <div className="flex items-center gap-2">
                                {i === 0 && ci < 2 && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                                {i === 1 && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                                {i === 2 && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
                                <div className={`h-2 rounded bg-gray-200 ${i === 0 ? "w-3/4" : i === 1 ? "w-2/3" : "w-1/2"}`} />
                              </div>
                              <div className="mt-2 h-2 w-1/2 rounded bg-gray-100" />
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex -space-x-1">
                                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 ring-1 ring-white" />
                                  {i === 0 && <div className="h-5 w-5 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 ring-1 ring-white" />}
                                </div>
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                  {ci === 3 ? "Done" : `${i + 1}d`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="relative border-y border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Logos Bar ===== */}
      <section className="bg-gray-50/50 py-14 overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Trusted by innovative teams worldwide</p>
        <div className="relative">
          <div className="animate-marquee flex gap-16 whitespace-nowrap">
            {["Acme Corp", "Globex", "Initech", "Hooli", "Pied Piper", "Stark Industries", "Wayne Enterprises", "Umbrella", "Acme Corp", "Globex", "Initech", "Hooli", "Pied Piper", "Stark Industries", "Wayne Enterprises", "Umbrella"].map((name, i) => (
              <span key={i} className="text-xl font-bold text-gray-300 select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="relative bg-white py-28">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5" /> Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to help your team plan, track, and deliver their best work.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="reveal group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:border-gray-300 hover-lift card-shine"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="relative bg-gray-50 py-28 overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-100 opacity-40 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Get started in <span className="gradient-text">minutes</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">Three simple steps to transform your workflow</p>
          </div>

          <div className="reveal mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.step} className="relative text-center" style={{ transitionDelay: `${i * 150}ms` }}>
                {i < 2 && (
                  <div className="absolute top-8 left-[60%] right-[-40%] hidden h-px bg-gradient-to-r from-indigo-300 to-transparent md:block" />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-200">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">Step {step.step}</div>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="relative bg-white py-28">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="reveal mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover-lift ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-200 scale-105"
                    : "border border-gray-200 bg-white"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    <Star className="h-3 w-3 fill-current" /> Most popular
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${plan.highlighted ? "text-indigo-100" : "text-gray-900"}`}>{plan.name}</h3>
                <div className="mt-4">
                  <span className={`text-5xl font-extrabold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-3 text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-indigo-300" : "text-indigo-600"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block">
                  <Button
                    className={`w-full h-11 font-semibold ${
                      plan.highlighted
                        ? "bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="relative bg-gray-50 py-28">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Loved by teams <span className="gradient-text">everywhere</span>
            </h2>
          </div>
          <div className="reveal mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover-lift"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 py-24">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        <div className="reveal relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight">
            Ready to transform how<br />your team works?
          </h2>
          <p className="mt-6 text-lg text-indigo-200 max-w-xl mx-auto">
            Join thousands of teams already shipping faster with FlowBoard.
            Get started in under a minute.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl h-12 px-8 text-base font-semibold">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base backdrop-blur-sm">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-sm font-bold text-white">F</span>
                </div>
                <span className="text-lg font-bold text-gray-900">FlowBoard</span>
              </Link>
              <p className="mt-4 text-sm text-gray-500 max-w-xs">
                The modern project management platform for teams that ship.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Changelog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FlowBoard. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Crafted with care for teams that ship.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
