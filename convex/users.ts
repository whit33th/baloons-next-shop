import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { requireUser } from "./helpers/auth";

const STORAGE_ID_PATTERN = /^[a-z0-9]{32}$/;

const isStorageId = (value: unknown): value is Id<"_storage"> =>
  typeof value === "string" && STORAGE_ID_PATTERN.test(value);

const profileResponseValidator = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  imageFileId: v.optional(v.union(v.id("_storage"), v.string())),
  image: v.optional(v.string()),
});

type ProfilePatch = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  imageFileId?: Id<"_storage"> | string;
  image?: string;
};

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    image: v.optional(v.string()),
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
    if (args.image !== undefined) {
      patch.image = args.image;
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
      imageFileId: updatedUser.imageFileId ?? undefined,
      image: updatedUser.image ?? undefined,
    };
  },
});

export const updateAvatar = mutation({
  args: {
    imageFileId: v.optional(v.union(v.id("_storage"), v.string())),
    image: v.optional(v.string()),
  },
  returns: profileResponseValidator,
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const user = await ctx.db.get(userId);
    const previousFileId = user?.imageFileId;

    const patch: ProfilePatch = {};

    if (args.imageFileId !== undefined) {
      patch.imageFileId = args.imageFileId as Id<"_storage"> | string;
      // Try to resolve a public URL for the storage id and save it to `image` too
      try {
        if (isStorageId(args.imageFileId)) {
          const publicUrl = await ctx.storage.getUrl(
            args.imageFileId as Id<"_storage">,
          );
          patch.image = publicUrl ?? undefined;
        }
      } catch (_e) {
        // ignore errors resolving public url
      }
    }

    if (args.image !== undefined) {
      patch.image = args.image ?? null;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }

    if (
      previousFileId &&
      args.imageFileId &&
      previousFileId !== args.imageFileId &&
      isStorageId(previousFileId)
    ) {
      try {
        await ctx.storage.delete(previousFileId);
      } catch (_e) {
        // ignore delete errors
      }
    }

    const updatedUser = (await ctx.db.get(userId)) ?? user;

    return {
      _id: userId,
      name: updatedUser?.name ?? undefined,
      email: updatedUser?.email ?? undefined,
      phone: updatedUser?.phone ?? undefined,
      address: updatedUser?.address ?? undefined,
      imageFileId: updatedUser?.imageFileId ?? undefined,
      image: updatedUser?.image ?? undefined,
    };
  },
});
