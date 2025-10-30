import { cn } from "@/lib/utils";
import {
  useTaskStore,
  useChildTasks,
  useAllWorkspaceTasks,
  useCreateTask,
  useUpdateTask,
  type Task,
} from "@/store";
import type { Id } from "@/../convex/_generated/dataModel";
import { useEffect, useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Checkbox } from "./ui/checkbox";
import { Folder, Plus } from "lucide-react";
import { TaskMenu } from "./task-menu";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface TaskListProps {
  tasks: Task[];
  parentId?: Id<"tasks"> | null;
  addingSubtasksFor?: Id<"tasks"> | null; // ID of task we're adding subtasks for
  canEdit?: boolean;
}

const TaskList = ({
  tasks,
  parentId = null,
  addingSubtasksFor,
  canEdit = false,
}: TaskListProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addingSubtasksFor_internal, setAddingSubtasksFor_internal] =
    useState<Id<"tasks"> | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<Id<"tasks"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { currentWorkspaceId } = useTaskStore();
  const childTasks = useChildTasks(
    currentWorkspaceId,
    selectedTask?._id || null
  );
  // Get all tasks in workspace to check which ones have children
  const allWorkspaceTasks = useAllWorkspaceTasks(currentWorkspaceId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // Helper function to check if a task has children
  const getTaskHasChildren = (taskId: Id<"tasks">) => {
    if (!allWorkspaceTasks) return false;
    return allWorkspaceTasks.some((task) => task.parentId === taskId);
  };

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const updatedTask = tasks.find((task) => task._id === selectedTask?._id);
    setSelectedTask(updatedTask || null);
  }, [tasks, selectedTask?._id]);

  useEffect(() => {
    // Only auto-focus when explicitly adding subtasks, not on page load
    if (isAddingTask && addingSubtasksFor && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTask, addingSubtasksFor]);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  // Show the "Add a task" input when we're adding subtasks for this specific task
  useEffect(() => {
    if (addingSubtasksFor && addingSubtasksFor === parentId) {
      setIsAddingTask(true);
    }
  }, [addingSubtasksFor, parentId]);

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && currentWorkspaceId) {
      try {
        await createTask({
          title: newTaskTitle.trim(),
          workspaceId: currentWorkspaceId,
          parentId: parentId || undefined,
        });
        setNewTaskTitle("");
        // Keep the input focused for continuous task addition
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddTask();
    } else if (event.key === "Escape") {
      setNewTaskTitle("");
      setIsAddingTask(false);
      setAddingSubtasksFor_internal(null);
    }
  };

  const handleInputBlur = () => {
    // Add task if there's content and close the input
    if (newTaskTitle.trim()) {
      handleAddTask();
    } else {
      // Close input if no content when clicking outside
      setIsAddingTask(false);
      setAddingSubtasksFor_internal(null);
    }
  };

  const handleAddSubtasks = (task: Task) => {
    setSelectedTask(task);
    setAddingSubtasksFor_internal(task._id);
  };

  const handleDoubleClick = (task: Task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  };

  const saveEdit = async () => {
    if (editingTaskId && editingTitle.trim()) {
      try {
        await updateTask({
          id: editingTaskId,
          title: editingTitle.trim(),
        });
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleEditBlur = () => {
    saveEdit();
  };

  const handleTaskToggle = async (task: Task, checked: boolean) => {
    try {
      await updateTask({
        id: task._id,
        completed: checked,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <div className="flex">
      <div className="bg-muted dark:bg-muted/50 px-6 py-4 m-4 w-80 rounded-lg space-y-3 max-h-[calc(100vh-10rem)] h-fit overflow-y-auto">
        {/* Add task input - moved to top for better UX */}
        {canEdit && isAddingTask ? (
          <div className="bg-card rounded-lg p-2">
            <div className="flex gap-3 items-start">
              <Textarea
                ref={inputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                placeholder="Enter a task (Enter to add, Esc to close)"
                className="flex-1 border-none dark:bg-transparent bg-transparent rounded-none h-auto p-0 text-sm focus-visible:ring-0 focus:bg-transparent shadow-none resize-none"
                rows={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingTask(false);
                  setAddingSubtasksFor_internal(null);
                }}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          </div>
        ) : canEdit ? (
          <Button
            variant="outline"
            onClick={() => {
              setIsAddingTask(true);
              // Focus the input after the component re-renders
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 0);
            }}
            className="w-full justify-start"
          >
            <Plus className="size-4" />
            <span className="text-sm">Add a task</span>
          </Button>
        ) : null}

        {tasks.map((task) => {
          const hasChildren = getTaskHasChildren(task._id);
          const isEditing = editingTaskId === task._id;

          return (
            <button
              type="button"
              key={task._id}
              className={cn(
                "bg-card rounded-lg p-3 cursor-pointer hover:opacity-90 group relative w-full text-left border-none",
                selectedTask?._id === task._id &&
                  "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (!isEditing) {
                  setSelectedTask(task);
                }
              }}
              aria-label={`Select task: ${task.title}`}
            >
              {/* Task content with properly spaced action icons */}
              <div className="flex gap-3 items-start">
                {hasChildren ? (
                  <Folder className="size-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={
                      canEdit
                        ? (checked) =>
                            handleTaskToggle(task, checked as boolean)
                        : undefined
                    }
                    className={cn(
                      "flex-shrink-0 mt-0.5 bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground",
                      selectedTask?._id !== task._id &&
                        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    )}
                  />
                )}
                {isEditing ? (
                  <textarea
                    ref={editInputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleEditBlur}
                    className="flex-1 bg-transparent outline-none text-sm min-w-0 resize-none"
                    rows={editingTitle.split("\n").length || 1}
                  />
                ) : (
                  <p
                    className={cn(
                      "flex-1 text-sm cursor-pointer select-none break-words leading-snug min-w-0 whitespace-pre-wrap",
                      task.completed &&
                        !hasChildren &&
                        "line-through opacity-80"
                    )}
                    onDoubleClick={() => canEdit && handleDoubleClick(task)}
                    title="Double-click to edit"
                  >
                    {task.title}
                  </p>
                )}

                {/* Action icons with gradient background - appears on hover */}
                {canEdit && !isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
                    {/* Gradient overlay that extends to the left - matches selection state */}
                    <div
                      className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-l to-transparent pointer-events-none -mr-3",
                        selectedTask?._id === task._id
                          ? "from-primary"
                          : "from-card"
                      )}
                    />
                    <div
                      className={cn(
                        "relative rounded px-1",
                        selectedTask?._id === task._id
                          ? "bg-primary"
                          : "bg-card"
                      )}
                    >
                      <TaskMenu
                        task={task}
                        hasChildren={hasChildren}
                        onAddSubtasks={handleAddSubtasks}
                      />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* Show children column if task has children OR if we're adding subtasks for this task */}
      {selectedTask &&
        ((childTasks && childTasks.length > 0) ||
          addingSubtasksFor_internal === selectedTask._id) && (
          <TaskList
            tasks={childTasks || []}
            parentId={selectedTask._id}
            addingSubtasksFor={
              addingSubtasksFor_internal === selectedTask._id
                ? selectedTask._id
                : null
            }
            canEdit={canEdit}
          />
        )}
    </div>
  );
};

export default TaskList;
