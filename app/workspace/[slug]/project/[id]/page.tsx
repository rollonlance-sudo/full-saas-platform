"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FadeIn } from "@/components/ui/motion";
import {
  cn,
  formatDate,
  getPriorityColor,
  getInitials,
} from "@/lib/utils";

// ── Types ──────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  assignee: { id: string; name: string; image: string | null } | null;
  dueDate: string | null;
  labels: { id: string; name: string; color: string }[];
  position: number;
  columnId: string;
}

interface Column {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  columns: Column[];
}

// ── Priority color helpers (Aurora tokens) ─────────────
function priorityDotClass(priority: Task["priority"]) {
  switch (priority) {
    case "urgent":
      return "bg-[var(--danger)]";
    case "high":
      return "bg-[var(--warning)]";
    case "medium":
      return "bg-[color-mix(in_oklab,var(--warning)_70%,var(--success)_30%)]";
    case "low":
      return "bg-[var(--fg-subtle)]";
    default:
      return "bg-[var(--border)]";
  }
}

// ── Sortable Task Card ─────────────────────────────────
function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 pt-4 shadow-sm cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-[color-mix(in_oklab,var(--primary)_30%,var(--border))]",
        isDragging && "opacity-50 ring-2 ring-[color-mix(in_oklab,var(--primary)_40%,transparent)]"
      )}
      onClick={onClick}
    >
      {/* Priority dot top-left */}
      <span
        aria-hidden
        className={cn(
          "absolute left-3 top-3 h-2 w-2 rounded-full ring-2 ring-[var(--surface)]",
          priorityDotClass(task.priority)
        )}
      />

      {/* Due-date pill top-right */}
      {task.dueDate && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--fg-muted)]">
          <Calendar className="h-3 w-3" />
          {formatDate(task.dueDate)}
        </span>
      )}

      <div className="flex items-start gap-2 mt-2">
        <button
          aria-label="Drag task"
          className="mt-0.5 cursor-grab text-[var(--fg-subtle)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-2.5">
          <p className="text-sm font-medium text-[var(--fg)] leading-snug tracking-[-0.01em] line-clamp-2">
            {task.title}
          </p>

          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 rounded-full"
                  style={{ borderColor: label.color, color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] font-medium">
              {task.priority !== "none" ? task.priority : ""}
            </span>
            {task.assignee && (
              <div className="flex -space-x-1">
                <Avatar className="h-6 w-6 ring-2 ring-[var(--surface)]">
                  <AvatarImage src={task.assignee.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task Card (no drag, for overlay) ──────────────────
function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-md)] w-72 rotate-1">
      <div className="flex items-center gap-2">
        <span
          className={cn("h-2 w-2 rounded-full", priorityDotClass(task.priority))}
        />
        <span className="text-sm font-medium text-[var(--fg)]">{task.title}</span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addTaskDialog, setAddTaskDialog] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ["project", slug, id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${slug}/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
  });

  const moveTask = useMutation({
    mutationFn: async (data: {
      taskId: string;
      columnId: string;
      position: number;
    }) => {
      const res = await fetch(
        `/api/workspaces/${slug}/projects/${id}/tasks/${data.taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: data.columnId,
            position: data.position,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to move task");
      return res.json();
    },
    onError: () => {
      toast.error("Failed to move task");
      queryClient.invalidateQueries({ queryKey: ["project", slug, id] });
    },
  });

  const addTask = useMutation({
    mutationFn: async (data: { columnId: string; title: string }) => {
      const res = await fetch(
        `/api/workspaces/${slug}/projects/${id}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to add task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", slug, id] });
      toast.success("Task added");
      setAddTaskDialog(null);
      setNewTaskTitle("");
    },
    onError: () => {
      toast.error("Failed to add task");
    },
  });

  const allTasks = project?.columns.flatMap((c) => c.tasks) ?? [];
  const selectedTask = allTasks.find((t) => t.id === selectedTaskId) ?? null;

  // ── DnD handlers ──
  function handleDragStart(event: DragStartEvent) {
    const task = allTasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setDragOverColumn(null);
      return;
    }
    // Find column containing the over target
    for (const col of project?.columns ?? []) {
      if (col.id === over.id) {
        setDragOverColumn(col.id);
        return;
      }
      if (col.tasks.some((t) => t.id === over.id)) {
        setDragOverColumn(col.id);
        return;
      }
    }
    setDragOverColumn(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setDragOverColumn(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTaskItem = allTasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    // Find destination column
    let destColumnId: string | null = null;
    let destPosition = 0;

    for (const col of project?.columns ?? []) {
      if (col.id === over.id) {
        destColumnId = col.id;
        destPosition = col.tasks.length;
        break;
      }
      const taskIndex = col.tasks.findIndex((t) => t.id === over.id);
      if (taskIndex !== -1) {
        destColumnId = col.id;
        destPosition = taskIndex;
        break;
      }
    }

    if (destColumnId) {
      moveTask.mutate({
        taskId: activeTaskItem.id,
        columnId: destColumnId,
        position: destPosition,
      });
    }
  }

  function handleAddTask(columnId: string) {
    if (!newTaskTitle.trim()) return;
    addTask.mutate({ columnId, title: newTaskTitle.trim() });
  }

  function toggleSort(col: string) {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  }

  function getSortedTasks() {
    const tasks = [...allTasks];
    tasks.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority": {
          const order = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
          cmp = order[a.priority] - order[b.priority];
          break;
        }
        case "assignee":
          cmp = (a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? "");
          break;
        case "dueDate":
          cmp =
            new Date(a.dueDate ?? "9999").getTime() -
            new Date(b.dueDate ?? "9999").getTime();
          break;
        default:
          cmp = 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return tasks;
  }

  // Palette for column dots — cycles through columns for visual distinction
  const columnDotPalette = [
    "var(--primary)",
    "var(--success)",
    "var(--warning)",
    "var(--danger)",
    "color-mix(in oklab, var(--primary) 60%, var(--success) 40%)",
    "color-mix(in oklab, var(--primary) 40%, var(--warning) 60%)",
  ];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-[var(--danger)]">Failed to load project.</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["project", slug, id] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  const totalTasks = allTasks.length;

  return (
    <div className="p-6 space-y-6 min-h-full">
      <FadeIn>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg-subtle)] uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              Project
            </div>
            <h1 className="text-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-[var(--fg)]">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-[var(--fg-muted)] max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-[var(--fg-subtle)] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                {project.columns.length} columns
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                {totalTasks} tasks
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      <Tabs defaultValue="board">
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="rounded-full bg-[var(--surface-muted)] p-1">
              <TabsTrigger
                value="board"
                className="rounded-full px-4 gap-1.5 data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="rounded-full px-4 gap-1.5 data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-sm"
              >
                <List className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                disabled
                className="rounded-full px-4 gap-1.5 opacity-60 cursor-not-allowed"
              >
                <Clock className="h-3.5 w-3.5" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>
        </FadeIn>

        {/* ── Board View ── */}
        <TabsContent value="board" className="mt-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-x-thin -mx-1 px-1">
              {project.columns.map((column, idx) => {
                const isDropTarget = dragOverColumn === column.id && activeTask !== null;
                const dotColor = columnDotPalette[idx % columnDotPalette.length];
                return (
                  <div
                    key={column.id}
                    className={cn(
                      "flex-shrink-0 w-72 md:w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-3 transition-all duration-200",
                      isDropTarget &&
                        "ring-2 ring-[color-mix(in_oklab,var(--primary)_40%,transparent)] bg-[color-mix(in_oklab,var(--primary)_6%,var(--surface-muted))]"
                    )}
                  >
                    <div className="sticky top-0 z-10 flex items-center justify-between -m-3 mb-0 p-3 pb-2 rounded-t-2xl bg-[var(--surface-muted)]/95 backdrop-blur">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: dotColor }}
                        />
                        <h3 className="font-semibold text-sm text-[var(--fg)] tracking-[-0.01em] truncate">
                          {column.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5 rounded-full bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]"
                        >
                          {column.tasks.length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                        onClick={() => setAddTaskDialog(column.id)}
                        aria-label={`Add task to ${column.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <SortableContext
                      items={column.tasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 min-h-[4rem]">
                        {column.tasks.length === 0 ? (
                          <button
                            onClick={() => setAddTaskDialog(column.id)}
                            className="w-full rounded-xl border border-dashed border-[var(--border)] bg-transparent hover:bg-[var(--surface)]/60 hover:border-[color-mix(in_oklab,var(--primary)_30%,var(--border))] py-6 text-xs text-[var(--fg-subtle)] hover:text-[var(--primary)] transition-colors"
                          >
                            <Plus className="inline h-3.5 w-3.5 mr-1" />
                            Add a task
                          </button>
                        ) : (
                          column.tasks.map((task) => (
                            <SortableTaskCard
                              key={task.id}
                              task={task}
                              onClick={() => setSelectedTaskId(task.id)}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        {/* ── List View ── */}
        <TabsContent value="list" className="mt-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  {[
                    { key: "title", label: "Title" },
                    { key: "status", label: "Status" },
                    { key: "priority", label: "Priority" },
                    { key: "assignee", label: "Assignee" },
                    { key: "dueDate", label: "Due Date" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] cursor-pointer hover:text-[var(--fg)] hover:bg-[color-mix(in_oklab,var(--primary)_6%,var(--surface-muted))] transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown
                          className={cn(
                            "h-3 w-3 transition-opacity",
                            sortColumn === col.key
                              ? "opacity-100 text-[var(--primary)]"
                              : "opacity-40"
                          )}
                        />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {getSortedTasks().length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[var(--fg-subtle)]"
                    >
                      No tasks yet
                    </td>
                  </tr>
                ) : (
                  getSortedTasks().map((task) => {
                    const col = project.columns.find(
                      (c) => c.id === task.columnId
                    );
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)] cursor-pointer transition-colors"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <td className="px-4 py-3 font-medium text-[var(--fg)]">
                          {task.title}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="rounded-full border-[var(--border)] text-[var(--fg-muted)]"
                          >
                            {col?.name ?? "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                priorityDotClass(task.priority)
                              )}
                            />
                            <span className="capitalize text-[var(--fg-muted)]">
                              {task.priority}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {task.assignee ? (
                            <span className="flex items-center gap-2 text-[var(--fg)]">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={task.assignee.image ?? undefined}
                                />
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(task.assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                              {task.assignee.name}
                            </span>
                          ) : (
                            <span className="text-[var(--fg-subtle)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--fg-muted)]">
                          {task.dueDate ? formatDate(task.dueDate) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
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
                                  setSelectedTaskId(task.id);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Add Task Dialog ── */}
      <Dialog
        open={addTaskDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddTaskDialog(null);
            setNewTaskTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="tracking-[-0.02em]">Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addTaskDialog) {
                    handleAddTask(addTaskDialog);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddTaskDialog(null);
                setNewTaskTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="aurora"
              onClick={() => addTaskDialog && handleAddTask(addTaskDialog)}
              disabled={addTask.isPending}
            >
              {addTask.isPending ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Task Detail Sheet ── */}
      <Sheet
        open={selectedTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedTask ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl tracking-[-0.02em]">
                  {selectedTask.title}
                </SheetTitle>
                <SheetDescription>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        priorityDotClass(selectedTask.priority)
                      )}
                    />
                    <span className="capitalize">{selectedTask.priority}</span>
                    <span className="text-[var(--fg-subtle)]">priority</span>
                  </span>
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--fg-subtle)] mb-1.5">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className="rounded-full border-[var(--border)] text-[var(--fg)]"
                    >
                      {project.columns.find((c) => c.id === selectedTask.columnId)
                        ?.name ?? "—"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--fg-subtle)] mb-1.5">
                      Assignee
                    </p>
                    {selectedTask.assignee ? (
                      <span className="flex items-center gap-2 text-sm text-[var(--fg)]">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={selectedTask.assignee.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(selectedTask.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedTask.assignee.name}
                      </span>
                    ) : (
                      <span className="text-[var(--fg-subtle)] text-sm">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--fg-subtle)] mb-1.5">
                      Due Date
                    </p>
                    <span className="flex items-center gap-1.5 text-sm text-[var(--fg)]">
                      <Calendar className="h-3.5 w-3.5 text-[var(--fg-subtle)]" />
                      {selectedTask.dueDate
                        ? formatDate(selectedTask.dueDate)
                        : "No due date"}
                    </span>
                  </div>
                </div>
                {selectedTask.labels.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--fg-subtle)] mb-2">
                      Labels
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTask.labels.map((label) => (
                        <Badge
                          key={label.id}
                          variant="outline"
                          className="rounded-full"
                          style={{
                            borderColor: label.color,
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
