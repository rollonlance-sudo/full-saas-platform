"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Settings2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion";

interface ProjectSettings {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useQuery<ProjectSettings>({
    queryKey: ["project-settings", slug, id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project settings");
      const data = await res.json();
      setName(data.name);
      setDescription(data.description ?? "");
      return data;
    },
  });

  const updateProject = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await fetch(`/api/workspaces/${slug}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-settings", slug, id] });
      queryClient.invalidateQueries({ queryKey: ["project", slug, id] });
      toast.success("Project updated");
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", slug] });
      toast.success("Project deleted");
      router.push(`/workspace/${slug}/projects`);
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProject.mutate({ name: name.trim(), description });
  }

  function handleDelete() {
    if (deleteConfirm !== project?.name) return;
    deleteProject.mutate();
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-[var(--danger)]">Failed to load project settings.</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["project-settings", slug, id],
            })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <FadeIn>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg-subtle)] uppercase tracking-[0.18em]">
            <Settings2 className="h-3.5 w-3.5 text-[var(--primary)]" />
            Configuration
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--fg)]">
            Project Settings
          </h1>
          <p className="text-sm text-[var(--fg-muted)]">
            Manage project details and permissions.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="rounded-2xl border-[var(--border)] bg-[var(--surface)]">
          <CardHeader>
            <CardTitle className="tracking-[-0.01em] text-[var(--fg)]">
              General
            </CardTitle>
            <CardDescription className="text-[var(--fg-muted)]">
              Update your project name and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--fg)]">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[var(--fg)]">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-[var(--border)] bg-[var(--surface-muted)]/40 rounded-b-2xl">
            <Button
              variant="aurora"
              onClick={handleSave}
              disabled={updateProject.isPending}
            >
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="rounded-2xl border-2 border-[color-mix(in_oklab,var(--danger)_40%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_4%,var(--surface))]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] text-[var(--danger)]">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <CardTitle className="text-[var(--danger)] tracking-[-0.01em]">
                Danger Zone
              </CardTitle>
            </div>
            <CardDescription className="text-[var(--fg-muted)]">
              Permanently delete this project and all of its data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="tracking-[-0.02em]">
                    Delete Project
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the project{" "}
                    <strong className="text-[var(--fg)]">{project.name}</strong>{" "}
                    and all associated tasks, columns, and data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Label>
                    Type{" "}
                    <strong className="text-[var(--fg)]">{project.name}</strong>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={project.name}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeleteConfirm("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={
                      deleteConfirm !== project.name || deleteProject.isPending
                    }
                  >
                    {deleteProject.isPending ? "Deleting..." : "Delete Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
