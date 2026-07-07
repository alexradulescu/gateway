import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes_cards: defineTable({
    body: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
