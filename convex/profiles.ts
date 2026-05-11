import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .filter(q => q.eq(q.field("username"), args.username))
      .first();
  },
});

export const saveProfile = mutation({
  args: {
    username: v.string(),
    avatar: v.string(),
    bio: v.string(),
    banner: v.string(),
    currency: v.string(),
    joinedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .filter(q => q.eq(q.field("username"), args.username))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        avatar: args.avatar,
        bio: args.bio,
        banner: args.banner,
        currency: args.currency,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      username: args.username,
      avatar: args.avatar,
      bio: args.bio,
      banner: args.banner,
      currency: args.currency,
      joinedAt: args.joinedAt,
    });
  },
});
