import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { useTaskStore, useWorkspaces, useCreateWorkspace } from "@/store";
import type { Id, Doc } from "@/../convex/_generated/dataModel";

export const WorkspaceSelector = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  const { currentWorkspaceId, setCurrentWorkspace } = useTaskStore();
  const workspaces = useWorkspaces();
  const createWorkspace = useCreateWorkspace();

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      try {
        const workspaceId = await createWorkspace({
          name: newWorkspaceName.trim(),
          description: newWorkspaceDescription.trim() || undefined,
        });
        // Only set workspace if we got a valid ID back (not undefined from fallback)
        if (workspaceId !== undefined) {
          setCurrentWorkspace(workspaceId);
        }
        setNewWorkspaceName("");
        setNewWorkspaceDescription("");
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId as Id<"workspaces">);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-background">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Label
          htmlFor="workspace-select"
          className="text-sm font-medium whitespace-nowrap"
        >
          Workspace
        </Label>
        <Select
          value={currentWorkspaceId || ""}
          onValueChange={handleWorkspaceChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(workspaces) &&
              workspaces.map((workspace: Doc<"workspaces">) => (
                <SelectItem key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim()}
            >
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
