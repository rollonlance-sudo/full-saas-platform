"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Settings as SettingsIcon,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import { FadeIn } from "@/components/ui/motion";

interface WorkspaceSettings {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: workspace, isLoading, error } = useQuery<WorkspaceSettings>({
    queryKey: ["workspace-settings", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/settings`);
      if (!res.ok) throw new Error("Failed to fetch workspace settings");
      const data = await res.json();
      setName(data.name);
      setSlugValue(data.slug);
      return data;
    },
  });

  const updateWorkspace = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const res = await fetch(`/api/workspaces/${slug}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update workspace");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-settings"] });
      toast.success("Workspace updated");
      if (data.slug !== slug) {
        router.push(`/workspace/${data.slug}/settings`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch(`/api/workspaces/${slug}/logo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload logo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-settings", slug] });
      toast.success("Logo updated");
    },
    onError: () => {
      toast.error("Failed to upload logo");
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workspace");
    },
    onSuccess: () => {
      toast.success("Workspace deleted");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to delete workspace");
    },
  });

  function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!slugValue.trim()) {
      toast.error("Slug is required");
      return;
    }
    updateWorkspace.mutate({ name: name.trim(), slug: slugValue.trim() });
  }

  function handleLogoClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    uploadLogo.mutate(file);
  }

  function handleDelete() {
    if (deleteConfirm !== workspace?.name) return;
    deleteWorkspace.mutate();
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--danger)_12%,transparent)]">
            <AlertTriangle className="h-7 w-7 text-[var(--danger)]" />
          </div>
          <p className="text-[var(--danger)] font-medium">
            Failed to load settings.
          </p>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["workspace-settings", slug],
              })
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <FadeIn>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            <span className="inline-flex items-center gap-1.5">
              <SettingsIcon className="h-3.5 w-3.5" />
              Configuration
            </span>
          </p>
          <h1 className="text-display mt-1 text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[var(--fg)]">
            Workspace Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Configure your workspace identity, branding, and advanced options.
          </p>
        </div>
      </FadeIn>

      {/* General Section */}
      <FadeIn delay={0.1}>
        <Card className="card-aurora">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Identity
            </p>
            <CardTitle className="mt-1 text-xl font-semibold tracking-[-0.01em]">
              General
            </CardTitle>
            <CardDescription>
              Manage your workspace name, slug, and branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
                <Avatar className="h-16 w-16 ring-2 ring-[var(--border)] ring-offset-2 ring-offset-[var(--surface)]">
                  <AvatarImage src={workspace.logo ?? undefined} />
                  <AvatarFallback className="text-lg font-semibold tracking-[-0.01em]">
                    {getInitials(workspace.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoClick}
                    disabled={uploadLogo.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadLogo.isPending ? "Uploading..." : "Upload Logo"}
                  </Button>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--fg-subtle)]">
                    <ImageIcon className="h-3 w-3" />
                    Max 2MB. JPG, PNG, or SVG.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="ws-slug">Workspace URL</Label>
              <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[color-mix(in_oklab,var(--primary)_18%,transparent)]">
                <span className="inline-flex items-center border-r border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--fg-muted)]">
                  flowboard.app/workspace/
                </span>
                <input
                  id="ws-slug"
                  value={slugValue}
                  onChange={(e) =>
                    setSlugValue(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="aurora"
              onClick={handleSave}
              disabled={updateWorkspace.isPending}
            >
              {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </FadeIn>

      {/* Danger Zone */}
      <FadeIn delay={0.15}>
        <Card className="border-[color-mix(in_oklab,var(--danger)_40%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_4%,var(--surface))]">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--danger)]">
              Irreversible
            </p>
            <CardTitle className="mt-1 inline-flex items-center gap-2 text-xl font-semibold tracking-[-0.01em] text-[var(--danger)]">
              <ShieldAlert className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete this workspace and all of its data, projects,
              documents, and members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="inline-flex items-center gap-2 tracking-[-0.01em]">
                    <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
                    Delete Workspace
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All projects, tasks,
                    documents, and member data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Label>
                    Type{" "}
                    <strong className="text-[var(--fg)]">
                      {workspace.name}
                    </strong>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={workspace.name}
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
                      deleteConfirm !== workspace.name ||
                      deleteWorkspace.isPending
                    }
                  >
                    {deleteWorkspace.isPending
                      ? "Deleting..."
                      : "Delete Workspace"}
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
