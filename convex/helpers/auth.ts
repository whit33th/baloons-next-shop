import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export type AuthenticatedCtx = QueryCtx | MutationCtx;

export type AuthenticatedUser = {
  userId: Id<"users">;
  user: Doc<"users">;
};

export const requireUser = async (
  ctx: AuthenticatedCtx,
): Promise<AuthenticatedUser> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User record missing");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return { userId, user };
};
