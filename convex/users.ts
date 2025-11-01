import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers/auth";

const profileResponseValidator = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
});

type ProfilePatch = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  returns: profileResponseValidator,
  handler: async (ctx, args) => {
    const { userId, user } = await requireUser(ctx);

    const patch: ProfilePatch = {};
    if (args.name !== undefined) {
      patch.name = args.name;
    }
    if (args.email !== undefined) {
      patch.email = args.email;
    }
    if (args.phone !== undefined) {
      patch.phone = args.phone;
    }
    if (args.address !== undefined) {
      patch.address = args.address;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }

    const updatedUser = ((await ctx.db.get(userId)) ?? user) as ProfilePatch;

    return {
      _id: userId,
      name: updatedUser.name ?? undefined,
      email: updatedUser.email ?? undefined,
      phone: updatedUser.phone ?? undefined,
      address: updatedUser.address ?? undefined,
    };
  },
});
