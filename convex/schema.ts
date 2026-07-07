import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes_cards: defineTable({
    body: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  task_groups: defineTable({
    name: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]),
  tasks: defineTable({
    groupId: v.id("task_groups"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.union(v.literal("P1"), v.literal("P2"), v.literal("P3"), v.literal("P4")),
    done: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group_order", ["groupId", "order"])
    .index("by_group_done_order", ["groupId", "done", "order"]),
});
