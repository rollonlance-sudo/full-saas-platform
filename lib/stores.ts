import { create } from "zustand";

interface WorkspaceState {
  currentWorkspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    plan: string;
    role: string;
  } | null;
  sidebarOpen: boolean;
  setCurrentWorkspace: (workspace: WorkspaceState["currentWorkspace"]) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  sidebarOpen: true,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

interface TaskFilterState {
  assignee: string | null;
  priority: string | null;
  label: string | null;
  search: string;
  setFilter: (key: "assignee" | "priority" | "label", value: string | null) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  assignee: null,
  priority: null,
  label: null,
  search: "",
  setFilter: (key, value) => set({ [key]: value }),
  setSearch: (search) => set({ search }),
  clearFilters: () => set({ assignee: null, priority: null, label: null, search: "" }),
}));
