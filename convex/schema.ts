import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes_cards: defineTable({
    body: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  thingsGroups: defineTable({
    name: v.string(),
    normalizedName: v.string(),
    position: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_position", ["position"])
    .index("by_normalizedName", ["normalizedName"]),
  thingsCatalogueItems: defineTable({
    canonicalName: v.string(),
    normalizedKey: v.string(),
    deletedAt: v.optional(v.number()),
  }).index("by_normalizedKey", ["normalizedKey"]),
  thingsGroupItems: defineTable({
    groupId: v.id("thingsGroups"),
    catalogueItemId: v.id("thingsCatalogueItems"),
    quantity: v.string(),
    position: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  }).index("by_group_position", ["groupId", "position"]),
  booksterBooks: defineTable({
    title: v.string(),
    author: v.string(),
    categoryIds: v.array(v.id("booksterCategories")),
    locationIds: v.array(v.id("booksterLocations")),
    isSample: v.boolean(),
    dateAdded: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_title", ["title"])
    .index("by_author", ["author"])
    .index("by_dateAdded", ["dateAdded"]),
  booksterCategories: defineTable({
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }).index("by_deletedAt", ["deletedAt"]),
  booksterLocations: defineTable({
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }).index("by_deletedAt", ["deletedAt"]),
  booksterSettings: defineTable({
    userId: v.string(),
    defaultSortOrder: v.union(
      v.literal("dateAdded"),
      v.literal("title"),
      v.literal("author"),
      v.literal("category"),
      v.literal("location"),
    ),
    theme: v.union(v.literal("system"), v.literal("light"), v.literal("dark")),
  }).index("by_userId", ["userId"]),
});
