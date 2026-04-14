"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DocItem {
  id: string;
  title: string;
  lastEditedBy: { name: string; image: string | null } | null;
  lastEditedAt: string;
  children: DocItem[];
}

function DocTreeItem({
  doc,
  level,
  onSelect,
}: {
  doc: DocItem;
  level: number;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = doc.children.length > 0;

  return (
    <div>
      <button
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors text-left group"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(doc.id)}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
              }
            }}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate flex-1">{doc.title || "Untitled"}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {doc.children.map((child) => (
            <DocTreeItem
              key={child.id}
              doc={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const queryClient = useQueryClient();

  const {
    data: docs,
    isLoading,
    error,
  } = useQuery<DocItem[]>({
    queryKey: ["docs", slug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/docs`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const createDoc = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled" }),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["docs", slug] });
      toast.success("Document created");
      router.push(`/workspace/${slug}/docs/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create document");
    },
  });

  function handleSelectDoc(id: string) {
    router.push(`/workspace/${slug}/docs/${id}`);
  }

  // Flatten docs for the list view
  function flattenDocs(items: DocItem[]): DocItem[] {
    const result: DocItem[] = [];
    for (const item of items) {
      result.push(item);
      if (item.children.length > 0) {
        result.push(...flattenDocs(item.children));
      }
    }
    return result;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-destructive">Failed to load documents.</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["docs", slug] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Documents</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => createDoc.mutate()}
            disabled={createDoc.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : docs && docs.length > 0 ? (
            docs.map((doc) => (
              <DocTreeItem
                key={doc.id}
                doc={doc}
                level={0}
                onSelect={handleSelectDoc}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              No documents yet
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : docs && docs.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">All Documents</h1>
              <Button onClick={() => createDoc.mutate()} disabled={createDoc.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                New Page
              </Button>
            </div>
            <div className="space-y-2">
              {flattenDocs(docs).map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => handleSelectDoc(doc.id)}
                >
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {doc.title || "Untitled"}
                        </p>
                        {doc.lastEditedBy && (
                          <p className="text-xs text-muted-foreground">
                            Edited by {doc.lastEditedBy.name}{" "}
                            {formatRelativeTime(doc.lastEditedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.lastEditedBy && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={doc.lastEditedBy.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(doc.lastEditedBy.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoc(doc.id);
                            }}
                          >
                            Open
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No documents yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first document to start writing.
              </p>
            </div>
            <Button
              onClick={() => createDoc.mutate()}
              disabled={createDoc.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
