"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { LogoMark } from "@/components/ui/logo";
import { FadeIn, StaggerGroup, StaggerItem, SpotlightCard } from "@/components/ui/motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Menu,
  X,
} from "lucide-react";

/* ===========================================================
   Scroll reveal (preserves legacy .reveal CSS)
   =========================================================== */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((c) =>
      observer.observe(c),
    );
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ===========================================================
   Typing animation
   =========================================================== */
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
  }, [charIndex, isDeleting, isPaused, currentWord.length]);

  useEffect(() => {
    const speed = isDeleting ? 50 : 100;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className="gradient-text-sweep">
      {currentWord.slice(0, charIndex)}
      <span className="animate-blink text-[var(--violet-400)]">|</span>
    </span>
  );
}

/* ===========================================================
   Content
   =========================================================== */
type Feature = {
  icon: typeof LayoutGrid;
  title: string;
  description: string;
  tint: string;
  long: string;
  highlights: string[];
};

const features: Feature[] = [
  {
    icon: LayoutGrid,
    title: "Boards & Lists",
    description:
      "Organize work with flexible Kanban boards and list views. Drag and drop tasks effortlessly.",
    tint: "var(--violet-400)",
    long:
      "Visualize every project the way that fits your team — drag tasks across columns on a Kanban board, switch to a dense list view, or filter by assignee, label, and due date in seconds.",
    highlights: [
      "Drag-and-drop powered by @dnd-kit",
      "Custom columns per project",
      "Priority, labels, due dates and checklists",
      "Saved filters and per-user views",
    ],
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "See changes instantly. Work with your team simultaneously on any project.",
    tint: "var(--cyan-400)",
    long:
      "Cards move on every screen the moment someone updates them. Live presence indicators show who's looking at what, and Yjs keeps document edits conflict-free even when two people type in the same paragraph.",
    highlights: [
      "Socket.io live updates across boards",
      "Presence avatars on tasks and docs",
      "Yjs CRDT for conflict-free editing",
      "Optimistic UI — zero perceived latency",
    ],
  },
  {
    icon: FileText,
    title: "Documents & Wiki",
    description:
      "Create rich documents with a Notion-style editor. Build your team knowledge base.",
    tint: "var(--rose-400)",
    long:
      "A clean writing surface powered by TipTap, with autosave, embeds, code blocks, and slash commands. Link docs to projects to keep specs and decisions next to the work.",
    highlights: [
      "TipTap editor with slash menu",
      "Autosave + revision history",
      "Code blocks, callouts, embeds",
      "Link docs to projects and tasks",
    ],
  },
  {
    icon: Shield,
    title: "Role-based Access",
    description:
      "Granular permissions with Owner, Admin, and Member roles to keep data secure.",
    tint: "var(--emerald-400)",
    long:
      "Strict role enforcement at the API and UI layer. Every workspace is isolated, every member has a role, and admins can change permissions without writing a line of SQL.",
    highlights: [
      "Owner / Admin / Member / Viewer roles",
      "Server-side permission checks on every route",
      "Per-workspace data isolation",
      "Audit log for sensitive actions (Enterprise)",
    ],
  },
  {
    icon: Clock,
    title: "Activity Tracking",
    description:
      "Detailed activity logs and smart notifications so nothing slips through.",
    tint: "var(--amber-400)",
    long:
      "A unified feed of who did what and when, plus targeted notifications when you're assigned, mentioned, or replied to. Mark all read or clear with a tap.",
    highlights: [
      "Workspace-wide activity stream",
      "Notifications for assignments, comments, mentions",
      "System announcements for product updates",
      "Mark-all-read and one-tap clear",
    ],
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Built with the latest stack for instant page loads and buttery-smooth interactions.",
    tint: "var(--cyan-400)",
    long:
      "Next.js 16 App Router with React 19, Tailwind v4 CSS-first tokens, and edge-cached static pages. Spring micro-interactions via framer-motion. Cold start to interactive in under a second.",
    highlights: [
      "Next.js 16 + React 19 + Tailwind v4",
      "Edge-cached static pages",
      "Optimistic mutations with TanStack Query",
      "Framer Motion micro-interactions",
    ],
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
    features: [
      "Up to 50 members",
      "Unlimited projects",
      "10 GB storage",
      "Real-time collaboration",
      "Timeline view",
      "Custom fields",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$25",
    period: "/member/mo",
    features: [
      "Unlimited members",
      "Unlimited projects",
      "100 GB storage",
      "SSO/SAML",
      "Audit log",
      "Priority support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Manager",
    company: "TechCorp",
    quote:
      "FlowBoard transformed how our team collaborates. We shipped 40% faster in the first month.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Product Lead",
    company: "StartupXYZ",
    quote:
      "The best project management tool we've used. Simple, fast, and the real-time features are incredible.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "CTO",
    company: "DesignCo",
    quote: "We replaced 3 tools with FlowBoard. The document wiki alone is worth it for our team.",
    avatar: "ER",
  },
];

const stats = [
  { value: "10K+", label: "Teams" },
  { value: "2M+", label: "Tasks managed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User rating" },
];

/* ===========================================================
   Brand mark
   =========================================================== */
function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:scale-[1.06] group-hover:rotate-[-3deg]" />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--fg)]">
        FlowBoard
      </span>
    </Link>
  );
}

/* ===========================================================
   Hero mock board (the product preview)
   =========================================================== */
function HeroBoardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    ref.current.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
  };

  const columns = [
    { name: "Backlog", color: "bg-[var(--fg-subtle)]", count: 4 },
    { name: "In Progress", color: "bg-[var(--violet-400)]", count: 3 },
    { name: "In Review", color: "bg-[var(--amber-400)]", count: 2 },
    { name: "Done", color: "bg-[var(--emerald-500)]", count: 5 },
  ];

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="mx-auto mt-16 max-w-6xl px-2 sm:mt-20"
      style={{ perspective: 1400 }}
    >
      <div
        ref={ref}
        className="relative transition-transform duration-300 ease-out will-change-transform"
      >
        {/* Aurora glow behind */}
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_50%_at_50%_50%,color-mix(in_oklab,var(--aurora-1)_35%,transparent),transparent_70%),radial-gradient(50%_45%_at_80%_30%,color-mix(in_oklab,var(--aurora-2)_30%,transparent),transparent_70%),radial-gradient(50%_45%_at_20%_80%,color-mix(in_oklab,var(--aurora-3)_28%,transparent),transparent_70%)] blur-3xl opacity-80"
        />
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-1 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 rounded-t-xl border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[var(--rose-400)]" />
              <div className="h-3 w-3 rounded-full bg-[var(--amber-400)]" />
              <div className="h-3 w-3 rounded-full bg-[var(--emerald-400)]" />
            </div>
            <div className="ml-4 flex-1">
              <div className="mx-auto max-w-md rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-center text-xs text-[var(--fg-subtle)]">
                flowboard.app/workspace/acme/project/sprint-23
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--violet-500)]" />
                <span className="text-sm font-semibold text-[var(--fg)]">Sprint 23 · Q2 Launch</span>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex -space-x-1.5">
                  {["SC", "MJ", "ER", "AK"].map((i, idx) => (
                    <div
                      key={i}
                      className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--surface)]"
                      style={{
                        background: [
                          "linear-gradient(135deg,#a855f7,#6366f1)",
                          "linear-gradient(135deg,#22d3ee,#06b6d4)",
                          "linear-gradient(135deg,#fb7185,#f43f5e)",
                          "linear-gradient(135deg,#fbbf24,#f59e0b)",
                        ][idx],
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="scroll-x-thin -mx-4 sm:mx-0">
              <div className="flex gap-3 px-4 sm:px-0">
                {columns.map((col, ci) => (
                  <div key={col.name} className="min-w-[220px] flex-1 sm:min-w-0">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${col.color}`} />
                        <span className="text-xs font-semibold text-[var(--fg)]">
                          {col.name}
                        </span>
                      </div>
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-[var(--surface-muted)] px-1.5 text-[10px] font-medium text-[var(--fg-muted)]">
                        {col.count}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(col.count, 3) }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + (ci * 3 + i) * 0.08, duration: 0.5 }}
                          className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm ${
                            ci === 1 && i === 0
                              ? "ring-2 ring-[color-mix(in_oklab,var(--violet-400)_45%,transparent)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {i === 0 && ci < 2 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--rose-400)]" />
                            )}
                            {i === 1 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-400)]" />
                            )}
                            {i === 2 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-400)]" />
                            )}
                            <div
                              className={`h-2 rounded bg-[var(--surface-muted)] ${
                                i === 0 ? "w-3/4" : i === 1 ? "w-2/3" : "w-1/2"
                              }`}
                            />
                          </div>
                          <div className="mt-2 h-2 w-1/2 rounded bg-[var(--surface-muted)] opacity-60" />
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex -space-x-1">
                              <div className="h-5 w-5 rounded-full bg-[linear-gradient(135deg,#a855f7,#6366f1)] ring-1 ring-[var(--surface)]" />
                              {i === 0 && (
                                <div className="h-5 w-5 rounded-full bg-[linear-gradient(135deg,#fb7185,#f43f5e)] ring-1 ring-[var(--surface)]" />
                              )}
                            </div>
                            <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--fg-muted)]">
                              {ci === 3 ? "Done" : `${i + 1}d`}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating notification */}
        <motion.div
          initial={{ opacity: 0, y: 10, x: 10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="absolute -right-2 -top-3 hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] shadow-[var(--shadow-md)] sm:flex"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--emerald-500)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--emerald-500)]" />
          </span>
          Sarah just moved "Auth redesign" → Done
        </motion.div>
      </div>
    </div>
  );
}

/* ===========================================================
   Page
   =========================================================== */
export default function LandingPage() {
  const scrollRef = useScrollReveal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={scrollRef} className="relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* scroll progress bar */}
      <motion.div
        style={{ width: progressWidth }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))]"
      />

      {/* ===== Navbar ===== */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="container-aurora flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <BrandMark />
            <div className="hidden items-center gap-1 md:flex">
              {[
                { href: "#features", label: "Features" },
                { href: "#how", label: "How it works" },
                { href: "#pricing", label: "Pricing" },
                { href: "#testimonials", label: "Reviews" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm text-[var(--fg-muted)] transition-all hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup" className="hidden sm:block">
              <Button variant="aurora" size="sm">
                Start free
              </Button>
            </Link>
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--fg)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-[var(--border)] md:hidden">
            <div className="container-aurora flex flex-col gap-1 py-3">
              {[
                { href: "#features", label: "Features" },
                { href: "#how", label: "How it works" },
                { href: "#pricing", label: "Pricing" },
                { href: "#testimonials", label: "Reviews" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <ThemeToggle />
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="aurora" className="w-full">
                    Start free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== Hero ===== */}
      <AuroraBackground className="relative pb-24 pt-16 sm:pb-32 sm:pt-24">
        <div className="container-aurora relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-display text-[clamp(2.5rem,7vw,5rem)] text-[var(--fg)]"
            >
              Project management
              <br className="hidden sm:block" /> that actually <TypingText />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[var(--fg-muted)] sm:text-xl"
            >
              Organize projects, collaborate in real time, and ship faster. Your team&rsquo;s work,
              finally in one beautiful workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="aurora" size="xl" className="w-full gap-2 sm:w-auto">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full gap-2 sm:w-auto">
                  <Play className="h-4 w-4" /> See how it works
                </Button>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 flex flex-col items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[
                  "linear-gradient(135deg,#60a5fa,#2563eb)",
                  "linear-gradient(135deg,#a78bfa,#7c3aed)",
                  "linear-gradient(135deg,#fb7185,#e11d48)",
                  "linear-gradient(135deg,#fbbf24,#f59e0b)",
                  "linear-gradient(135deg,#34d399,#059669)",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--surface)]"
                    style={{ background: bg }}
                  >
                    {["JD", "AK", "MR", "SC", "LP"][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[var(--amber-400)] text-[var(--amber-400)]"
                  />
                ))}
                <span className="ml-2 text-sm text-[var(--fg-muted)]">
                  Loved by <span className="font-semibold text-[var(--fg)]">10,000+</span> teams
                </span>
              </div>
            </motion.div>
          </div>

          <HeroBoardMockup />
        </div>
      </AuroraBackground>

      {/* ===== Stats ===== */}
      <section className="relative border-y border-[var(--border)] bg-[var(--surface)] py-16">
        <div className="container-aurora">
          <StaggerGroup className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-display text-4xl text-[var(--fg)] tabular-nums sm:text-5xl">
                  <span className="gradient-text-sweep">{stat.value}</span>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                  {stat.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ===== Logos marquee ===== */}
      <section className="overflow-hidden bg-[var(--surface-muted)]/50 py-12">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[var(--fg-subtle)]">
          Trusted by innovative teams worldwide
        </p>
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <div className="animate-marquee flex gap-16 whitespace-nowrap">
            {[
              "Acme Corp",
              "Globex",
              "Initech",
              "Hooli",
              "Pied Piper",
              "Stark Industries",
              "Wayne Enterprises",
              "Umbrella",
              "Acme Corp",
              "Globex",
              "Initech",
              "Hooli",
              "Pied Piper",
              "Stark Industries",
              "Wayne Enterprises",
              "Umbrella",
            ].map((name, i) => (
              <span
                key={i}
                className="select-none text-xl font-bold tracking-tight text-[var(--fg-subtle)]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="relative bg-[var(--bg)] py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-pattern opacity-50" />
        <div className="container-aurora relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--violet-500)]">
              <Globe className="h-3.5 w-3.5" /> Features
            </div>
            <h2 className="text-display text-3xl sm:text-5xl">Everything your team needs</h2>
            <p className="mt-4 text-lg text-[var(--fg-muted)]">
              Powerful features to help your team plan, track, and deliver their best work.
            </p>
          </FadeIn>

          <StaggerGroup className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <SpotlightCard
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveFeature(feature)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveFeature(feature);
                    }
                  }}
                  className="group h-full cursor-pointer p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--primary)_25%,transparent)]"
                >
                  <div
                    className="inline-grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${feature.tint}, color-mix(in oklab, ${feature.tint} 40%, #0b0b14))`,
                    }}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-[var(--fg)]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                    {feature.description}
                  </p>
                  <div className="mt-5 inline-flex items-center text-sm font-medium text-[var(--primary)] transition-all group-hover:gap-2 group-hover:translate-x-0.5">
                    Learn more
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Feature detail dialog */}
          <Dialog
            open={activeFeature !== null}
            onOpenChange={(o) => !o && setActiveFeature(null)}
          >
            <DialogContent className="max-w-xl">
              {activeFeature && (
                <>
                  <DialogHeader>
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="inline-grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${activeFeature.tint}, color-mix(in oklab, ${activeFeature.tint} 40%, #0b0b14))`,
                        }}
                      >
                        <activeFeature.icon className="h-6 w-6" />
                      </div>
                      <DialogTitle className="text-xl">
                        {activeFeature.title}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-[15px] leading-relaxed text-[var(--fg)]">
                      {activeFeature.long}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                      What you get
                    </p>
                    <ul className="space-y-2.5">
                      {activeFeature.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 text-sm text-[var(--fg)]"
                        >
                          <span
                            className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full"
                            style={{
                              background: `color-mix(in oklab, ${activeFeature.tint} 25%, transparent)`,
                            }}
                          >
                            <Check
                              className="h-2.5 w-2.5"
                              style={{ color: activeFeature.tint }}
                            />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setActiveFeature(null)}
                    >
                      Close
                    </Button>
                    <Link href="/signup">
                      <Button variant="aurora" className="gap-2">
                        Try it free <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section
        id="how"
        className="relative overflow-hidden bg-[var(--surface-muted)]/60 py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--violet-400)_25%,transparent)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 left-0 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--cyan-400)_20%,transparent)] blur-3xl"
        />

        <div className="container-aurora relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-display text-3xl sm:text-5xl">
              Get started in <span className="gradient-text">minutes</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--fg-muted)]">
              Three simple steps to transform your workflow
            </p>
          </FadeIn>

          <StaggerGroup className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <StaggerItem key={step.step} className="relative text-center">
                {i < 2 && (
                  <div
                    aria-hidden
                    className="absolute left-[60%] right-[-40%] top-8 hidden h-px bg-[linear-gradient(90deg,var(--violet-400),transparent)] md:block"
                  />
                )}
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2))] text-white shadow-[var(--shadow-glow)]">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--violet-400)]">
                  Step {step.step}
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[var(--fg)]">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--fg-muted)]">
                  {step.description}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="relative bg-[var(--bg)] py-28">
        <div aria-hidden className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="container-aurora relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--violet-500)]">
              Pricing
            </div>
            <h2 className="text-display text-3xl sm:text-5xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-[var(--fg-muted)]">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </FadeIn>

          <StaggerGroup className="mx-auto mt-16 grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <StaggerItem key={plan.name} className="relative">
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
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className={`text-5xl font-extrabold tracking-[-0.03em] ${
                        plan.highlighted ? "text-white" : "text-[var(--fg)]"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/75" : "text-[var(--fg-subtle)]"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-center gap-3 text-sm ${
                          plan.highlighted ? "text-white/90" : "text-[var(--fg-muted)]"
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 flex-shrink-0 ${
                            plan.highlighted ? "text-white/90" : "text-[var(--primary)]"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button
                      variant={plan.highlighted ? "glass" : "aurora"}
                      className={`w-full h-11 font-semibold ${
                        plan.highlighted
                          ? "!bg-white !text-[var(--violet-600)] hover:!bg-white/95 border-transparent"
                          : ""
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="relative bg-[var(--surface-muted)]/50 py-28">
        <div aria-hidden className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container-aurora relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-display text-3xl sm:text-5xl">
              Loved by teams <span className="gradient-text">everywhere</span>
            </h2>
          </FadeIn>
          <StaggerGroup className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <div className="card-aurora h-full p-8">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-[var(--amber-400)] text-[var(--amber-400)]"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--fg)]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))] text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--fg)]">{t.name}</p>
                      <p className="text-xs text-[var(--fg-subtle)]">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--violet-700),var(--violet-500)_45%,#3b0764)] py-24">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-[color-mix(in_oklab,var(--cyan-400)_40%,transparent)] blur-3xl" />
        </div>
        <div aria-hidden className="absolute inset-0 grid-pattern opacity-10" />

        <FadeIn className="container-aurora relative text-center">
          <h2 className="text-display text-4xl text-white sm:text-5xl">
            Ready to transform how
            <br /> your team works?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            Join thousands of teams already shipping faster with FlowBoard. Get started in under a
            minute.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button variant="glass" size="xl" className="!bg-white !text-[var(--violet-700)] hover:!bg-white/95 gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="xl"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg)] py-16">
        <div className="container-aurora">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <BrandMark />
              <p className="mt-4 max-w-xs text-sm text-[var(--fg-muted)]">
                The modern project management platform for teams that ship.
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            {[
              {
                title: "Product",
                links: [
                  { href: "#features", label: "Features" },
                  { href: "#pricing", label: "Pricing" },
                  { href: "#", label: "Changelog" },
                  { href: "#", label: "Integrations" },
                ],
              },
              {
                title: "Company",
                links: [
                  { href: "#", label: "About" },
                  { href: "#", label: "Blog" },
                  { href: "#", label: "Careers" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { href: "#", label: "Privacy" },
                  { href: "#", label: "Terms" },
                  { href: "#", label: "Security" },
                ],
              },
              {
                title: "Support",
                links: [
                  { href: "#", label: "Help Center" },
                  { href: "#", label: "Contact" },
                  { href: "#", label: "Status" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg)]">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 md:flex-row">
            <p className="text-sm text-[var(--fg-subtle)]">
              &copy; {new Date().getFullYear()} FlowBoard. All rights reserved.
            </p>
            <p className="text-xs text-[var(--fg-subtle)]">
              Crafted with care for teams that ship.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
