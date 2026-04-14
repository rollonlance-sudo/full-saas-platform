"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading1, Heading2, Heading3, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Doc {
  id: string;
  title: string;
  content: string;
}

export default function DocEditorPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInitialized = useRef(false);

  const { data: doc, isLoading, error } = useQuery<Doc>({
    queryKey: ["doc", slug, id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/docs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch document");
      return res.json();
    },
  });

  const saveDoc = useCallback(
    async (data: { title?: string; content?: string }) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/workspaces/${slug}/docs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to save");
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
        toast.error("Failed to save document");
      }
    },
    [slug, id]
  );

  const debouncedSave = useCallback(
    (data: { title?: string; content?: string }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveDoc(data), 1000);
    },
    [saveDoc]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: doc?.content ?? "",
    onUpdate: ({ editor }) => {
      debouncedSave({ content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[50vh] px-1 py-2",
      },
    },
  });

  // Set initial content when doc loads
  useEffect(() => {
    if (doc && editor && !editor.isDestroyed) {
      if (editor.getHTML() === "<p></p>" || editor.isEmpty) {
        editor.commands.setContent(doc.content || "");
      }
    }
  }, [doc, editor]);

  // Set initial title
  useEffect(() => {
    if (doc && !titleInitialized.current) {
      setTitle(doc.title);
      titleInitialized.current = true;
    }
  }, [doc]);

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-destructive">Failed to load document.</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["doc", slug, id] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {/* Save status */}
      <div className="flex items-center justify-end h-6">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled"
        className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
      />

      {/* Toolbar */}
      {editor && (
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              editor.isActive("bold") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              editor.isActive("italic") && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              editor.isActive("heading", { level: 1 }) && "bg-muted"
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              editor.isActive("heading", { level: 2 }) && "bg-muted"
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              editor.isActive("heading", { level: 3 }) && "bg-muted"
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
