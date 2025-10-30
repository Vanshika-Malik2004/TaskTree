import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignIn, UserButton } from "@clerk/clerk-react";
import TaskList from "@/components/task-list";
import { WorkspaceSelector } from "@/components/workspace-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTaskStore, useCurrentWorkspaceTasks, useWorkspaces } from "@/store";
import { useEffect } from "react";
import type { Id } from "@/../convex/_generated/dataModel";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                TaskTree
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to manage your tasks
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
    </div>
  );
}

function AuthenticatedApp() {
  const { currentWorkspaceId, setCurrentWorkspace } = useTaskStore();
  const rootTasks = useCurrentWorkspaceTasks(currentWorkspaceId);
  const workspaces = useWorkspaces();

  // Validate persisted workspace still exists and belongs to user
  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      if (currentWorkspaceId) {
        // Check if current workspace still exists
        const workspaceExists = workspaces.some(
          (workspace) => workspace && workspace._id === currentWorkspaceId
        );
        if (!workspaceExists) {
          setCurrentWorkspace(null);
        }
      } else {
        // If no workspace selected and only one workspace exists, auto-select it
        if (workspaces.length === 1 && workspaces[0]) {
          setCurrentWorkspace(workspaces[0]._id as Id<"workspaces">);
        }
      }
    }
  }, [currentWorkspaceId, workspaces, setCurrentWorkspace]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6 border-b">
        <div className="flex items-center gap-4">
          <img src="/image.png" alt="TaskTree" className="h-6" />
          <WorkspaceSelector />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
      {currentWorkspaceId ? (
        <div className="flex overflow-x-auto space-x-4 pb-4">
          <TaskList
            tasks={rootTasks || []}
            parentId={null}
            addingSubtasksFor={null}
            canEdit={true}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Select a workspace to start managing tasks
          </p>
        </div>
      )}
    </div>
  );
}
