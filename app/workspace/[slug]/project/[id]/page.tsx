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
        "rounded-lg border bg-card p-3 shadow-sm cursor-pointer hover:border-primary/40 transition-colors",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", getPriorityColor(task.priority))}
            />
            <span className="text-sm font-medium truncate">{task.title}</span>
          </div>
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ borderColor: label.color, color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.image ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
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
    <div className="rounded-lg border bg-card p-3 shadow-lg w-72">
      <div className="flex items-center gap-2">
        <span
          className={cn("h-2 w-2 rounded-full", getPriorityColor(task.priority))}
        />
        <span className="text-sm font-medium">{task.title}</span>
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

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
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
        <p className="text-destructive">Failed to load project.</p>
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* ── Board View ── */}
        <TabsContent value="board" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {project.columns.map((column) => (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{column.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setAddTaskDialog(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <SortableContext
                    items={column.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[4rem]">
                      {column.tasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTaskId(task.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        {/* ── List View ── */}
        <TabsContent value="list" className="mt-4">
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {[
                    { key: "title", label: "Title" },
                    { key: "status", label: "Status" },
                    { key: "priority", label: "Priority" },
                    { key: "assignee", label: "Assignee" },
                    { key: "dueDate", label: "Due Date" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {getSortedTasks().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
                        className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <td className="px-4 py-3 font-medium">{task.title}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{col?.name ?? "—"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                getPriorityColor(task.priority)
                              )}
                            />
                            <span className="capitalize">{task.priority}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {task.assignee ? (
                            <span className="flex items-center gap-2">
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
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {task.dueDate ? formatDate(task.dueDate) : "—"}
                        </td>
                        <td className="px-4 py-3">
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
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addTaskDialog) {
                    handleAddTask(addTaskDialog);
                  }
                }}
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
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        getPriorityColor(selectedTask.priority)
                      )}
                    />
                    <span className="capitalize">{selectedTask.priority}</span>
                    priority
                  </span>
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge variant="outline">
                    {project.columns.find((c) => c.id === selectedTask.columnId)
                      ?.name ?? "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Assignee
                  </p>
                  {selectedTask.assignee ? (
                    <span className="flex items-center gap-2">
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
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Due Date
                  </p>
                  <span>
                    {selectedTask.dueDate
                      ? formatDate(selectedTask.dueDate)
                      : "No due date"}
                  </span>
                </div>
                {selectedTask.labels.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Labels
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTask.labels.map((label) => (
                        <Badge
                          key={label.id}
                          variant="outline"
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
