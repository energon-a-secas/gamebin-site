import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const vote = mutation({
  args: {
    listId: v.id("lists"),
    gameId: v.id("games"),
    username: v.string(),
    direction: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .filter(q => q.eq(q.field("gameId"), args.gameId))
      .filter(q => q.eq(q.field("username"), args.username))
      .first();

    if (existing) {
      if (existing.direction === args.direction) {
        await ctx.db.delete(existing._id);
        return { removed: true };
      }
      await ctx.db.patch(existing._id, { direction: args.direction });
      return { updated: true };
    }

    await ctx.db.insert("votes", {
      listId: args.listId,
      gameId: args.gameId,
      username: args.username,
      direction: args.direction,
    });
    return { created: true };
  },
});

export const getVotesForList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .collect();

    const result: Record<string, Record<string, number>> = {};
    for (const v of votes) {
      if (!result[v.gameId]) result[v.gameId] = {};
      result[v.gameId][v.username] = v.direction;
    }
    return result;
  },
});
