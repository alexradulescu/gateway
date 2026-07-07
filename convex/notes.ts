import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listCards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes_cards").withIndex("by_createdAt").order("desc").collect();
  },
});

export const createCard = mutation({
  args: {
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const body = args.body.trim();

    if (body.length === 0) {
      throw new Error("Note cannot be empty.");
    }

    return await ctx.db.insert("notes_cards", {
      body,
      createdAt: Date.now(),
    });
  },
});
