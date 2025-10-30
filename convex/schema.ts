import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
  }),

  workspaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(), // Clerk user ID
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    title: v.string(),
    completed: v.boolean(),
    parentId: v.optional(v.id("tasks")), // Reference to parent task
    workspaceId: v.id("workspaces"), // Reference to workspace
    userId: v.string(), // Clerk user ID
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentId"])
    .index("by_workspace_and_parent", ["workspaceId", "parentId"])
    .index("by_user", ["userId"]),

  // Memberships for users in workspaces with roles
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(), // Clerk user ID
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  // Email-based invitations to join a workspace
  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked"),
      v.literal("expired")
    ),
    invitedBy: v.string(), // Clerk user ID
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"]),
});
