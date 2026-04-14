"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { ArrowRight, Plus, X, SkipForward } from "lucide-react";

const templates = [
  { id: "blank", name: "Blank", description: "Start from scratch" },
  { id: "software", name: "Software Development", description: "Backlog, Sprint, Review, Done" },
  { id: "marketing", name: "Marketing", description: "Ideas, Planning, In Progress, Published" },
  { id: "product", name: "Product Launch", description: "Research, Design, Build, Launch" },
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

  const addInvite = () => {
    setInvites([...invites, { email: "", role: "member" }]);
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create workspace
      const wsRes = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspace),
      });

      if (!wsRes.ok) {
        const data = await wsRes.json();
        toast.error(data.error || "Failed to create workspace");
        setLoading(false);
        return;
      }

      const wsData = await wsRes.json();

      // Send invites
      const validInvites = invites.filter((i) => i.email.trim());
      if (validInvites.length > 0) {
        await Promise.all(
          validInvites.map((invite) =>
            fetch(`/api/workspaces/${wsData.workspace.slug}/invites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(invite),
            })
          )
        );
      }

      // Create project
      if (project.name.trim()) {
        await fetch(`/api/workspaces/${wsData.workspace.slug}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: project.name, template: project.template }),
        });
      }

      router.push(`/workspace/${wsData.workspace.slug}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600">FlowBoard</h1>
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Create your workspace</h2>
              <p className="text-sm text-gray-600">
                A workspace is where your team collaborates on projects.
              </p>
              <div>
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  placeholder="Acme Corp"
                  value={workspace.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ws-slug">URL</Label>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-sm text-gray-500">flowboard.app/</span>
                  <Input
                    id="ws-slug"
                    value={workspace.slug}
                    onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
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
              <h2 className="text-xl font-semibold text-gray-900">Invite your team</h2>
              <p className="text-sm text-gray-600">
                Add team members to collaborate with. You can skip this for now.
              </p>
              {invites.map((invite, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={invite.email}
                    onChange={(e) => {
                      const newInvites = [...invites];
                      newInvites[index].email = e.target.value;
                      setInvites(newInvites);
                    }}
                    className="flex-1"
                  />
                  <select
                    value={invite.role}
                    onChange={(e) => {
                      const newInvites = [...invites];
                      newInvites[index].role = e.target.value;
                      setInvites(newInvites);
                    }}
                    className="rounded-md border border-gray-300 px-2 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  {invites.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeInvite(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addInvite} className="gap-1">
                <Plus className="h-3 w-3" /> Add another
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 gap-1">
                  <SkipForward className="h-4 w-4" /> Skip
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Create your first project</h2>
              <p className="text-sm text-gray-600">
                Choose a template to get started quickly.
              </p>
              <div>
                <Label htmlFor="proj-name">Project name</Label>
                <Input
                  id="proj-name"
                  placeholder="My First Project"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProject({ ...project, template: t.id })}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      project.template === t.id
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleFinish} className="flex-1">
                  Skip & finish
                </Button>
                <Button onClick={handleFinish} disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create & go"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => step > 1 && setStep(step - 1)}
          className={`mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 ${
            step === 1 ? "invisible" : ""
          }`}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}
