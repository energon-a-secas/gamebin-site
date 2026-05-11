import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllowedVoters = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("allowedVoters")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .first();
    return record ? record.voters : [];
  },
});

export const setAllowedVoters = mutation({
  args: {
    listId: v.id("lists"),
    voters: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("allowedVoters")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { voters: args.voters });
    } else {
      await ctx.db.insert("allowedVoters", {
        listId: args.listId,
        voters: args.voters,
      });
    }
  },
});

export const userExists = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("username"), args.username))
      .first();
    return !!user;
  },
});
