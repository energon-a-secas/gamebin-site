import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Lists ───────────────────────────────────────────────────────
export const createList = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    coverColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lists", {
      name: args.name,
      userId: args.userId,
      coverColor: args.coverColor || "#6366f1",
      isPublic: args.isPublic !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const updateList = mutation({
  args: {
    listId: v.id("lists"),
    name: v.optional(v.string()),
    coverColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.coverColor !== undefined) patch.coverColor = args.coverColor;
    if (args.isPublic !== undefined) patch.isPublic = args.isPublic;
    await ctx.db.patch(args.listId, patch);
  },
});

export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .collect();
    for (const game of games) {
      await ctx.db.delete(game._id);
    }
    await ctx.db.delete(args.listId);
  },
});

export const getMyLists = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lists")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getPublicLists = query({
  args: {},
  handler: async (ctx) => {
    const lists = await ctx.db
      .query("lists")
      .filter(q => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();

    const result = [];
    for (const list of lists) {
      const games = await ctx.db
        .query("games")
        .filter(q => q.eq(q.field("listId"), list._id))
        .collect();

      const profile = await ctx.db
        .query("profiles")
        .filter(q => q.eq(q.field("username"), list.userId))
        .first();

      result.push({
        ...list,
        _gameCount: games.length,
        _previewCovers: games.filter(g => g.coverUrl).slice(0, 4).map(g => g.coverUrl),
        _owner: profile || { username: list.userId, avatar: "warrior" },
      });
    }
    return result;
  },
});

export const getSharedList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    if (!list) return null;

    const games = await ctx.db
      .query("games")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .collect();

    const likes = await ctx.db
      .query("likes")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .collect();

    return { list, games, likesCount: likes.length };
  },
});

// ── Games ───────────────────────────────────────────────────────
export const addGame = mutation({
  args: {
    listId: v.id("lists"),
    name: v.string(),
    coverUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    steamAppId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("games", {
      listId: args.listId,
      name: args.name,
      coverUrl: args.coverUrl || "",
      notes: args.notes || "",
      categories: args.categories || [],
      steamAppId: args.steamAppId || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    name: v.string(),
    coverUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    steamAppId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, {
      name: args.name,
      coverUrl: args.coverUrl,
      notes: args.notes,
      categories: args.categories,
      steamAppId: args.steamAppId,
      updatedAt: Date.now(),
    });
  },
});

export const deleteGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.gameId);
  },
});

export const getGamesByList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .order("desc")
      .collect();
  },
});

// ── Categories ──────────────────────────────────────────────────
export const createCategory = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("categories", {
      userId: args.userId,
      name: args.name,
      color: args.color,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getCategories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .order("asc")
      .collect();
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.categoryId);
  },
});

// ── Likes ───────────────────────────────────────────────────────
export const toggleLike = mutation({
  args: {
    listId: v.id("lists"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", {
      listId: args.listId,
      userId: args.userId,
      createdAt: Date.now(),
    });
    return { liked: true };
  },
});

export const hasLiked = query({
  args: {
    listId: v.id("lists"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const like = await ctx.db
      .query("likes")
      .filter(q => q.eq(q.field("listId"), args.listId))
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
    return !!like;
  },
});
