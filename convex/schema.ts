import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  clerkAccountLinks: defineTable({
    clerkSubject: v.string(),
    legacyUsername: v.string(),
    legacyConvexUserId: v.id("users"),
    legacyRole: v.optional(v.string()),
    linkedAt: v.number(),
  })
    .index("by_subject", ["clerkSubject"])
    .index("by_legacy_username", ["legacyUsername"]),

  userSettings: defineTable({
    clerkSubject: v.string(),
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_owner_key", ["clerkSubject", "key"])
    .index("by_subject", ["clerkSubject"]),

  profiles: defineTable({
    username: v.string(),
    avatar: v.string(),
    bio: v.string(),
    banner: v.string(),
    currency: v.string(),
    joinedAt: v.number(),
  }),

  lists: defineTable({
    name: v.string(),
    userId: v.string(),
    coverColor: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  games: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    coverUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    categories: v.array(v.string()),
    steamAppId: v.optional(v.string()),
    steamTags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    createdAt: v.number(),
  }),

  likes: defineTable({
    listId: v.id("lists"),
    userId: v.string(),
    createdAt: v.number(),
  }),

  votes: defineTable({
    listId: v.id("lists"),
    gameId: v.id("games"),
    username: v.string(),
    direction: v.number(),
  }),

  allowedVoters: defineTable({
    listId: v.id("lists"),
    voters: v.array(v.string()),
  }),
});
