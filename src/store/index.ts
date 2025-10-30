import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

export interface Task {
  _id: Id<"tasks">;
  title: string;
  completed: boolean;
  parentId?: Id<"tasks">;
  workspaceId: Id<"workspaces">;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

interface TaskState {
  currentWorkspaceId: Id<"workspaces"> | null;
  setCurrentWorkspace: (workspaceId: Id<"workspaces"> | null) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspace: (workspaceId) =>
        set({ currentWorkspaceId: workspaceId }),
    }),
    {
      name: "tasktree-workspace-storage",
      partialize: (state) => ({ currentWorkspaceId: state.currentWorkspaceId }),
    }
  )
);

// Convex hooks for workspaces
export const useWorkspaces = () => {
  return useQuery(api.workspaces.list);
};

export const useCreateWorkspace = () => {
  return useMutation(api.workspaces.create);
};

export const useCurrentWorkspaceTasks = (
  workspaceId: Id<"workspaces"> | null
) => {
  return useQuery(
    api.tasks.getChildTasks,
    workspaceId ? { workspaceId, parentId: undefined } : "skip"
  );
};

export const useAllWorkspaceTasks = (workspaceId: Id<"workspaces"> | null) => {
  return useQuery(
    api.tasks.listByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );
};

export const useChildTasks = (
  workspaceId: Id<"workspaces"> | null,
  parentId: Id<"tasks"> | null
) => {
  return useQuery(
    api.tasks.getChildTasks,
    workspaceId ? { workspaceId, parentId: parentId || undefined } : "skip"
  );
};

export const useCreateTask = () => {
  return useMutation(api.tasks.create);
};

export const useUpdateTask = () => {
  return useMutation(api.tasks.update);
};

export const useMarkTaskCompleted = () => {
  return useMutation(api.tasks.markCompleted);
};

export const useDeleteTask = () => {
  return useMutation(api.tasks.remove);
};

export const useGetDescendantIds = (taskId: Id<"tasks"> | null) => {
  return useQuery(api.tasks.getAllDescendantIds, taskId ? { taskId } : "skip");
};
