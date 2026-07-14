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
  }).index("by_normalizedKey", ["normalizedKey"]),
  thingsGroupItems: defineTable({
    groupId: v.id("thingsGroups"),
    catalogueItemId: v.id("thingsCatalogueItems"),
    quantity: v.string(),
    position: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  }).index("by_group_position", ["groupId", "position"]),
});
