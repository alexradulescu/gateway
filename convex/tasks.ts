import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const priorityValidator = v.union(
  v.literal("P1"),
  v.literal("P2"),
  v.literal("P3"),
  v.literal("P4"),
);

async function ensureDefaultGroup(ctx: MutationCtx) {
  const existing = await ctx.db.query("task_groups").withIndex("by_order").first();

  if (existing) return existing._id;

  return await ctx.db.insert("task_groups", {
    name: "Inbox",
    order: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

function cleanTitle(title: string) {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    throw new Error("Title is required.");
  }

  return trimmed;
}

function cleanOptionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("task_groups").withIndex("by_order").order("asc").collect();
    const tasks = await ctx.db.query("tasks").collect();

    return {
      groups,
      tasks,
    };
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    return await ensureDefaultGroup(ctx);
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const name = cleanTitle(args.name);
    const now = Date.now();

    return await ctx.db.insert("task_groups", {
      name,
      order: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("task_groups"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.groupId, {
      name: cleanTitle(args.name),
      updatedAt: Date.now(),
    });
  },
});

export const deleteGroup = mutation({
  args: {
    groupId: v.id("task_groups"),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db.query("task_groups").collect();

    if (groups.length <= 1) {
      throw new Error("Keep at least one group.");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_group_order", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.groupId);
  },
});

export const reorderGroups = mutation({
  args: {
    groupIds: v.array(v.id("task_groups")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await Promise.all(
      args.groupIds.map((groupId, index) =>
        ctx.db.patch(groupId, {
          order: index,
          updatedAt: now,
        }),
      ),
    );
  },
});

export const createTask = mutation({
  args: {
    groupId: v.optional(v.id("task_groups")),
    dueDate: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const groupId = args.groupId ?? (await ensureDefaultGroup(ctx));
    const now = Date.now();

    return await ctx.db.insert("tasks", {
      groupId,
      title: cleanTitle(args.title),
      dueDate: cleanOptionalText(args.dueDate),
      priority: "P4",
      done: false,
      order: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.optional(priorityValidator),
    groupId: v.optional(v.id("task_groups")),
  },
  handler: async (ctx, args) => {
    const patch: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: "P1" | "P2" | "P3" | "P4";
      groupId?: typeof args.groupId;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) patch.title = cleanTitle(args.title);
    if (args.description !== undefined) patch.description = cleanOptionalText(args.description);
    if (args.dueDate !== undefined) patch.dueDate = cleanOptionalText(args.dueDate);
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.groupId !== undefined) patch.groupId = args.groupId;

    await ctx.db.patch(args.taskId, patch);
  },
});

export const toggleTaskDone = mutation({
  args: {
    taskId: v.id("tasks"),
    done: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      done: args.done,
      order: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

export const reorderTasks = mutation({
  args: {
    groupId: v.id("task_groups"),
    done: v.boolean(),
    taskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await Promise.all(
      args.taskIds.map((taskId, index) =>
        ctx.db.patch(taskId, {
          groupId: args.groupId,
          done: args.done,
          order: index,
          updatedAt: now,
        }),
      ),
    );
  },
});
