import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getIdentityOrThrow } from "./authz";

// List all workspaces for the authenticated user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentityOrThrow(ctx);
    // Only workspaces owned by user
    return await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Get a specific workspace (if owned by authenticated user)
export const get = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspace = await ctx.db.get(args.id);
    if (!workspace || workspace.userId !== identity.subject) return null;
    return workspace;
  },
});

// Create a new workspace
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      userId: identity.subject,
      createdAt: Date.now(),
    });
    return workspaceId;
  },
});

// Update a workspace (if owned by authenticated user)
export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspace = await ctx.db.get(args.id);
    if (!workspace || workspace.userId !== identity.subject)
      throw new Error("Unauthorized");
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    await ctx.db.patch(args.id, updates);
  },
});

// Delete a workspace and all its tasks (if owned by authenticated user)
export const remove = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const workspace = await ctx.db.get(args.id);
    if (!workspace || workspace.userId !== identity.subject)
      throw new Error("Unauthorized");
    // Delete all tasks in this workspace
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    // Delete the workspace
    await ctx.db.delete(args.id);
  },
});
