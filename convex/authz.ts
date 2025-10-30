import type { MutationCtx, QueryCtx } from "./_generated/server";

export type Ctx = QueryCtx | MutationCtx;

export async function getIdentityOrThrow(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}
