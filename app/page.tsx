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
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Boards & Lists",
    description: "Organize work with flexible Kanban boards and list views. Drag and drop tasks between columns.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "See changes instantly. Multiple team members can work on the same project simultaneously.",
  },
  {
    icon: FileText,
    title: "Documents & Wiki",
    description: "Create rich documents with a Notion-style editor. Build your team's knowledge base.",
  },
  {
    icon: Shield,
    title: "Role-based Permissions",
    description: "Control access with Owner, Admin, and Member roles. Keep your workspace secure.",
  },
  {
    icon: Clock,
    title: "Activity Tracking",
    description: "Track every change across your workspace with detailed activity logs and notifications.",
  },
  {
    icon: Zap,
    title: "Fast & Modern",
    description: "Built with the latest tech stack for blazing-fast performance and a smooth user experience.",
  },
];

const steps = [
  { step: "01", title: "Create Workspace", description: "Set up your team workspace in seconds" },
  { step: "02", title: "Invite Team", description: "Add your team members with role-based access" },
  { step: "03", title: "Ship Faster", description: "Manage projects, track tasks, and deliver on time" },
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
  },
  {
    name: "Marcus Johnson",
    role: "Product Lead",
    company: "StartupXYZ",
    quote: "The best project management tool we've used. Simple, fast, and the real-time features are incredible.",
  },
  {
    name: "Elena Rodriguez",
    role: "CTO",
    company: "DesignCo",
    quote: "We replaced 3 tools with FlowBoard. The document wiki alone is worth it for our team.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              FlowBoard
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in">
              Project Management That{" "}
              <span className="text-indigo-600">Actually Works</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 animate-fade-in animate-fade-in-delay-1">
              Organize projects, collaborate in real time, and ship faster. FlowBoard brings your team&rsquo;s work together in one beautiful workspace.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in animate-fade-in-delay-2">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">See how it works</Button>
              </a>
            </div>
          </div>
          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-5xl animate-fade-in animate-fade-in-delay-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-2xl">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex gap-4">
                  {["Backlog", "In Progress", "In Review", "Done"].map((col) => (
                    <div key={col} className="flex-1">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{col}</span>
                        <span className="text-xs text-gray-400">3</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="h-2 w-3/4 rounded bg-gray-200" />
                            <div className="mt-2 h-2 w-1/2 rounded bg-gray-100" />
                            <div className="mt-3 flex items-center justify-between">
                              <div className="h-4 w-4 rounded-full bg-indigo-100" />
                              <div className="h-2 w-8 rounded bg-gray-100" />
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
      </section>

      {/* Logos Bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500">Trusted by teams at</p>
          <div className="mt-6 flex items-center justify-center gap-8 opacity-40 grayscale">
            {["Acme", "Globex", "Initech", "Hooli", "Pied Piper", "Stark"].map((name) => (
              <span key={name} className="text-lg font-bold text-gray-900">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to help your team plan, track, and deliver great work.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-indigo-200 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get started in minutes
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlighted
                    ? "border-indigo-600 ring-1 ring-indigo-600 shadow-lg"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    <Star className="h-3 w-3" /> Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block">
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by teams everywhere
          </h2>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform how your team works?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join thousands of teams already using FlowBoard.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            &copy; 2024 FlowBoard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
