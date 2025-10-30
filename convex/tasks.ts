import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getIdentityOrThrow } from "./authz";

// Get all tasks for a specific workspace (authenticated user only)
export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    // Only show tasks for workspaces the user owns
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== identity.subject)
      throw new Error("Unauthorized");
    return await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("asc")
      .collect();
  },
});

// Get child tasks for a specific parent (or root tasks if parentId is null)
export const getChildTasks = query({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== identity.subject)
      throw new Error("Unauthorized");
    if (args.parentId === undefined) {
      // Get root tasks (no parent)
      return await ctx.db
        .query("tasks")
        .withIndex("by_workspace_and_parent", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("parentId", undefined)
        )
        .order("asc")
        .collect();
    } else {
      // Get child tasks
      return await ctx.db
        .query("tasks")
        .withIndex("by_workspace_and_parent", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId)
        )
        .order("asc")
        .collect();
    }
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("tasks")),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== identity.subject)
      throw new Error("Unauthorized");
    // If parentId is provided, verify it belongs to the same workspace
    if (args.parentId) {
      const parentTask = await ctx.db.get(args.parentId);
      if (!parentTask || parentTask.workspaceId !== args.workspaceId) {
        throw new Error("Parent task not found or not authorized");
      }
    }
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      completed: args.completed ?? false,
      parentId: args.parentId,
      workspaceId: args.workspaceId,
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== identity.subject)
      throw new Error("Unauthorized");

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.completed !== undefined) updates.completed = args.completed;

    await ctx.db.patch(args.id, updates);
  },
});

// Helper function to get all descendant task IDs
const getAllDescendantIdsHelper = async (
  ctx: any,
  parentId: any
): Promise<any[]> => {
  const children = await ctx.db
    .query("tasks")
    .withIndex("by_parent", (q: any) => q.eq("parentId", parentId as any))
    .collect();
  let allIds = children.map((child: any) => child._id);
  for (const child of children) {
    const descendantIds = await getAllDescendantIdsHelper(ctx, child._id);
    allIds = allIds.concat(descendantIds);
  }
  return allIds;
};

// Get all descendant IDs for a task
export const getAllDescendantIds = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== identity.subject)
      throw new Error("Unauthorized");
    return await getAllDescendantIdsHelper(ctx, args.taskId);
  },
});

// Mark a task and all its descendants as completed
export const markCompleted = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== identity.subject)
      throw new Error("Unauthorized");
    // Mark the main task as completed
    await ctx.db.patch(args.taskId, {
      completed: true,
      updatedAt: Date.now(),
    });
    // Get all descendant IDs and mark them completed too
    const descendantIds = await getAllDescendantIdsHelper(ctx, args.taskId);
    for (const descendantId of descendantIds) {
      await ctx.db.patch(descendantId, {
        completed: true,
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete a task and all its descendants
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== identity.subject)
      throw new Error("Unauthorized");
    // Get all descendant IDs
    const descendantIds = await getAllDescendantIdsHelper(ctx, args.taskId);
    // Delete all descendants
    for (const descendantId of descendantIds) {
      await ctx.db.delete(descendantId);
    }
    // Delete the main task
    await ctx.db.delete(args.taskId);
  },
});
