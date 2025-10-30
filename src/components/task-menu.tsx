import {
  useMarkTaskCompleted,
  useDeleteTask,
  useGetDescendantIds,
  type Task,
} from "@/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Workflow, Check, Trash2 } from "lucide-react";
import { useState } from "react";

interface TaskMenuProps {
  task: Task;
  hasChildren: boolean;
  onAddSubtasks?: (task: Task) => void;
}

export const TaskMenu = ({
  task,
  hasChildren,
  onAddSubtasks,
}: TaskMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const markCompleted = useMarkTaskCompleted();
  const deleteTask = useDeleteTask();
  const descendantIds = useGetDescendantIds(task._id);

  const handleAddSubtasks = () => {
    onAddSubtasks?.(task);
  };

  const handleMarkCompleted = async () => {
    try {
      await markCompleted({ taskId: task._id });
    } catch (error) {
      console.error("Failed to mark task completed:", error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask({ taskId: task._id });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Calculate how many tasks will be affected
  const totalTasksToDelete =
    1 + (Array.isArray(descendantIds) ? descendantIds.length : 0);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Add subtasks - only show for leaf tasks */}
        {!hasChildren && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubtasks();
                }}
              >
                <Workflow className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add subtasks</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Mark completed - only show for parent tasks */}
        {hasChildren && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkCompleted();
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark completed</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Delete - always available */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete task</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"?
              {totalTasksToDelete > 1 && (
                <span className="block mt-2 font-medium text-destructive">
                  This will also delete {totalTasksToDelete - 1} subtask
                  {totalTasksToDelete - 1 !== 1 ? "s" : ""}.
                </span>
              )}
              <span className="block mt-2 text-muted-foreground">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete{" "}
              {totalTasksToDelete > 1 ? `${totalTasksToDelete} tasks` : "task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
