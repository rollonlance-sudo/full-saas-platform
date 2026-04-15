"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  Briefcase,
  Bug,
  Rocket,
  BookOpen,
  ListChecks,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";

const ICON_OPTIONS = [
  { value: "folder", label: "Folder", icon: FolderKanban },
  { value: "briefcase", label: "Briefcase", icon: Briefcase },
  { value: "bug", label: "Bug Tracker", icon: Bug },
  { value: "rocket", label: "Rocket", icon: Rocket },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "checklist", label: "Checklist", icon: ListChecks },
];

const TEMPLATES = [
  { value: "blank", label: "Blank Project" },
  { value: "kanban", label: "Kanban Board" },
  { value: "scrum", label: "Scrum / Sprint" },
  { value: "bug-tracker", label: "Bug Tracker" },
  { value: "roadmap", label: "Product Roadmap" },
];

interface Project {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  taskCount: number;
  createdAt: string;
}

function getIconComponent(icon: string) {
  const found = ICON_OPTIONS.find((o) => o.value === icon);
  return found ? found.icon : FolderKanban;
}

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");
  const [template, setTemplate] = useState("blank");

  const { data, isLoading, error } = useQuery<{ projects: Project[] }>({
    queryKey: ["projects", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const projects = data?.projects;

  const createProject = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      icon: string;
      template: string;
    }) => {
      const res = await fetch(`/api/workspaces/${slug}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", slug] });
      toast.success("Project created successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("folder");
    setTemplate("blank");
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProject.mutate({ name: name.trim(), description, icon, template });
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--danger)_12%,transparent)]">
            <AlertTriangle className="h-7 w-7 text-[var(--danger)]" />
          </div>
          <p className="text-[var(--danger)] font-medium">
            Failed to load projects.
          </p>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["projects", slug] })
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace
              </span>
            </p>
            <h1 className="text-display mt-1 text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[var(--fg)]">
              Projects
            </h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Manage and organize your team&apos;s projects.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="aurora" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="tracking-[-0.01em]">
                  Create New Project
                </DialogTitle>
                <DialogDescription>
                  Set up a new project for your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Name</Label>
                  <Input
                    id="project-name"
                    placeholder="My Project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-desc">Description</Label>
                  <Textarea
                    id="project-desc"
                    placeholder="What is this project about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="aurora"
                  onClick={handleCreate}
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <FadeIn delay={0.1}>
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const Icon = getIconComponent(project.icon);
              return (
                <StaggerItem key={project.id}>
                  <Card
                    className="card-aurora group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                    onClick={() =>
                      router.push(`/workspace/${slug}/project/${project.id}`)
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--primary)_20%,transparent)]">
                          <Icon className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base font-semibold tracking-[-0.01em] truncate">
                              {project.name}
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                          </div>
                          {project.description && (
                            <CardDescription className="truncate">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">
                        {project.taskCount}{" "}
                        {project.taskCount === 1 ? "task" : "tasks"}
                      </Badge>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1}>
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 p-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--primary)_20%,transparent)]">
              <LayoutGrid className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-[var(--fg)]">
                No projects yet
              </h3>
              <p className="text-[var(--fg-muted)] mt-1 text-sm">
                Create your first project to start organizing tasks.
              </p>
            </div>
            <Button variant="aurora" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
