import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const register = mutation({
  args: {
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("username"), args.username))
      .first();

    if (existing) {
      throw new Error("Username already taken");
    }

    const id = await ctx.db.insert("users", {
      username: args.username,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const login = query({
  args: {
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("username"), args.username))
      .first();

    if (!user || user.passwordHash !== args.passwordHash) {
      return null;
    }

    return { _id: user._id, username: user.username };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, username: user.username };
  },
});
