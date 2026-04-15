"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { LogoMark } from "@/components/ui/logo";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { ArrowRight, Plus, X, SkipForward } from "lucide-react";

const templates = [
  { id: "blank", name: "Blank", description: "Start from scratch" },
  { id: "software", name: "Software Development", description: "Backlog · Sprint · Review · Done" },
  { id: "marketing", name: "Marketing", description: "Ideas · Planning · Progress · Published" },
  { id: "product", name: "Product Launch", description: "Research · Design · Build · Launch" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [workspace, setWorkspace] = useState({ name: "", slug: "" });
  const [invites, setInvites] = useState([{ email: "", role: "member" }]);
  const [project, setProject] = useState({ name: "", template: "blank" });

  const handleNameChange = (name: string) => {
    setWorkspace({ name, slug: generateSlug(name) });
  };

  const addInvite = () => setInvites([...invites, { email: "", role: "member" }]);
  const removeInvite = (i: number) => setInvites(invites.filter((_, idx) => idx !== i));

  const handleFinish = async () => {
    setLoading(true);
    try {
      let slug = workspace.slug;
      const wsRes = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspace),
      });

      if (!wsRes.ok) {
        const data = await wsRes.json();
        if (wsRes.status !== 409) {
          toast.error(data.error || "Failed to create workspace");
          setLoading(false);
          return;
        }
      } else {
        const wsData = await wsRes.json();
        slug = wsData.workspace.slug;
      }

      const validInvites = invites.filter((i) => i.email.trim());
      if (validInvites.length > 0) {
        await Promise.all(
          validInvites.map((invite) =>
            fetch(`/api/workspaces/${slug}/invites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(invite),
            }),
          ),
        );
      }

      if (project.name.trim()) {
        await fetch(`/api/workspaces/${slug}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: project.name, template: project.template }),
        });
      }

      router.push(`/workspace/${slug}`);
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

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-xl font-bold tracking-[-0.02em]">FlowBoard</span>
          </Link>
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-all duration-500 ${
                  s <= step
                    ? "bg-[linear-gradient(90deg,var(--aurora-1),var(--aurora-2),var(--aurora-3))]"
                    : "bg-[var(--surface-muted)]"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            Step {step} of 3
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 p-8 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Create your workspace</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                A workspace is where your team collaborates on projects.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  placeholder="Acme Corp"
                  value={workspace.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-slug">URL</Label>
                <div className="flex h-10 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-3 transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]">
                  <span className="text-sm text-[var(--fg-subtle)]">flowboard.app/</span>
                  <input
                    id="ws-slug"
                    value={workspace.slug}
                    onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })}
                    className="flex-1 bg-transparent py-2 pr-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
                  />
                </div>
              </div>
              <Button
                variant="aurora"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!workspace.name || !workspace.slug}
                className="w-full gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Invite your team</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Add teammates to collaborate with. You can skip this for now.
              </p>
              <div className="space-y-2">
                {invites.map((invite, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={invite.email}
                      onChange={(e) => {
                        const arr = [...invites];
                        arr[index].email = e.target.value;
                        setInvites(arr);
                      }}
                      className="flex-1"
                    />
                    <select
                      value={invite.role}
                      onChange={(e) => {
                        const arr = [...invites];
                        arr[index].role = e.target.value;
                        setInvites(arr);
                      }}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)]"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    {invites.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInvite(index)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addInvite} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add another
              </Button>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(3)} className="flex-1 gap-1.5">
                  <SkipForward className="h-4 w-4" /> Skip
                </Button>
                <Button variant="aurora" size="lg" onClick={() => setStep(3)} className="flex-1 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Create your first project</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Choose a template to get started quickly.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="proj-name">Project name</Label>
                <Input
                  id="proj-name"
                  placeholder="My first project"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {templates.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setProject({ ...project, template: t.id })}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      project.template === t.id
                        ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] ring-2 ring-[color-mix(in_oklab,var(--primary)_30%,transparent)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <p className="text-sm font-medium text-[var(--fg)]">{t.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{t.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="lg" onClick={handleFinish} className="flex-1">
                  Skip & finish
                </Button>
                <Button
                  variant="aurora"
                  size="lg"
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create & go"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => step > 1 && setStep(step - 1)}
          className={`mt-4 w-full text-center text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] ${
            step === 1 ? "invisible" : ""
          }`}
          type="button"
        >
          &larr; Back
        </button>
      </div>
    </AuroraBackground>
  );
}
