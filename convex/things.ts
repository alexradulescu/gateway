import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  assertCompleteOrder,
  cleanVisibleText,
  nextPosition,
  normalizeCatalogueKey,
  normalizeGroupName,
} from "./thingsDomain";

type DatabaseReader = QueryCtx["db"] | MutationCtx["db"];

function requiredText(value: string, label: string) {
  const cleaned = cleanVisibleText(value);
  if (!cleaned) throw new Error(`${label} is required.`);
  return cleaned;
}

async function activeGroups(db: DatabaseReader) {
  const groups = await db.query("thingsGroups").withIndex("by_position").order("asc").collect();
  return groups.filter((group) => group.deletedAt === undefined);
}

async function groupItems(db: DatabaseReader, groupId: Id<"thingsGroups">) {
  return await db
    .query("thingsGroupItems")
    .withIndex("by_group_position", (index) => index.eq("groupId", groupId))
    .collect();
}

function isActiveItem(item: Doc<"thingsGroupItems">) {
  return item.deletedAt === undefined && item.completedAt === undefined;
}

async function activeGroupItems(db: DatabaseReader, groupId: Id<"thingsGroups">) {
  return (await groupItems(db, groupId)).filter(isActiveItem);
}

async function requireActiveGroup(db: DatabaseReader, groupId: Id<"thingsGroups">) {
  const group = await db.get(groupId);
  if (!group || group.deletedAt !== undefined) throw new Error("Group not found.");
  return group;
}

async function requireActiveItem(db: DatabaseReader, itemId: Id<"thingsGroupItems">) {
  const item = await db.get(itemId);
  if (!item || item.deletedAt !== undefined) throw new Error("Item not found.");
  await requireActiveGroup(db, item.groupId);
  return item;
}

async function assertUniqueGroupName(
  db: DatabaseReader,
  normalizedName: string,
  exceptId?: Id<"thingsGroups">,
) {
  const matches = await db
    .query("thingsGroups")
    .withIndex("by_normalizedName", (index) => index.eq("normalizedName", normalizedName))
    .collect();

  if (matches.some((group) => group.deletedAt === undefined && group._id !== exceptId)) {
    throw new Error("An active group already uses that name.");
  }
}

async function resolveCatalogueItem(ctx: MutationCtx, inputName: string) {
  const canonicalName = requiredText(inputName, "Item name");
  const normalizedKey = normalizeCatalogueKey(canonicalName);
  const existing = await ctx.db
    .query("thingsCatalogueItems")
    .withIndex("by_normalizedKey", (index) => index.eq("normalizedKey", normalizedKey))
    .first();

  if (existing) return existing;

  const catalogueItemId = await ctx.db.insert("thingsCatalogueItems", {
    canonicalName,
    normalizedKey,
  });
  const catalogueItem = await ctx.db.get(catalogueItemId);
  if (!catalogueItem) throw new Error("Catalogue item could not be created.");
  return catalogueItem;
}

async function presentItem(db: DatabaseReader, item: Doc<"thingsGroupItems">) {
  const catalogueItem = await db.get(item.catalogueItemId);
  if (!catalogueItem) throw new Error("Catalogue item not found.");

  return {
    _id: item._id,
    groupId: item.groupId,
    catalogueItemId: item.catalogueItemId,
    canonicalName: catalogueItem.canonicalName,
    quantity: item.quantity,
    position: item.position,
    ...(item.completedAt === undefined ? {} : { completedAt: item.completedAt }),
  };
}

export const home = query({
  args: {},
  handler: async (ctx) => {
    const groups = await activeGroups(ctx.db);
    return {
      groups: await Promise.all(
        groups.map(async (group) => {
          const items = (await groupItems(ctx.db, group._id)).filter(
            (item) => item.deletedAt === undefined,
          );
          return {
            _id: group._id,
            name: group.name,
            position: group.position,
            activeCount: items.filter((item) => item.completedAt === undefined).length,
            completedCount: items.filter((item) => item.completedAt !== undefined).length,
          };
        }),
      ),
    };
  },
});

export const openedGroup = query({
  args: { groupId: v.string() },
  handler: async (ctx, args) => {
    const groupId = ctx.db.normalizeId("thingsGroups", args.groupId);
    if (!groupId) return null;

    const group = await ctx.db.get(groupId);
    if (!group || group.deletedAt !== undefined) return null;

    const items = (await groupItems(ctx.db, groupId)).filter(
      (item) => item.deletedAt === undefined,
    );
    const activeItems = items
      .filter(isActiveItem)
      .sort((left, right) => left.position - right.position);
    const completedItems = items
      .filter((item) => item.completedAt !== undefined)
      .sort((left, right) => (right.completedAt ?? 0) - (left.completedAt ?? 0));

    return {
      group: { _id: group._id, name: group.name, position: group.position },
      activeItems: await Promise.all(activeItems.map((item) => presentItem(ctx.db, item))),
      completedItems: await Promise.all(completedItems.map((item) => presentItem(ctx.db, item))),
    };
  },
});

export const catalogue = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("thingsCatalogueItems").collect();
    return items
      .map(({ _id, canonicalName, normalizedKey }) => ({ _id, canonicalName, normalizedKey }))
      .sort((left, right) =>
        left.canonicalName.localeCompare(right.canonicalName, undefined, { sensitivity: "base" }),
      );
  },
});

export const createGroup = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = requiredText(args.name, "Group name");
    const normalizedName = normalizeGroupName(name);
    await assertUniqueGroupName(ctx.db, normalizedName);
    const groups = await activeGroups(ctx.db);

    return await ctx.db.insert("thingsGroups", {
      name,
      normalizedName,
      position: nextPosition(groups),
    });
  },
});

export const renameGroup = mutation({
  args: { groupId: v.id("thingsGroups"), name: v.string() },
  handler: async (ctx, args) => {
    await requireActiveGroup(ctx.db, args.groupId);
    const name = requiredText(args.name, "Group name");
    const normalizedName = normalizeGroupName(name);
    await assertUniqueGroupName(ctx.db, normalizedName, args.groupId);
    await ctx.db.patch(args.groupId, { name, normalizedName });
  },
});

export const reorderGroups = mutation({
  args: { groupIds: v.array(v.id("thingsGroups")) },
  handler: async (ctx, args) => {
    const groups = await activeGroups(ctx.db);
    assertCompleteOrder(
      args.groupIds.map(String),
      groups.map((group) => String(group._id)),
    );
    await Promise.all(
      args.groupIds.map((groupId, position) => ctx.db.patch(groupId, { position })),
    );
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("thingsGroups") },
  handler: async (ctx, args) => {
    await requireActiveGroup(ctx.db, args.groupId);
    const deletedAt = Date.now();
    const items = await groupItems(ctx.db, args.groupId);
    await Promise.all([
      ctx.db.patch(args.groupId, { deletedAt }),
      ...items.map((item) => ctx.db.patch(item._id, { deletedAt })),
    ]);
  },
});

export const addGroupItem = mutation({
  args: { groupId: v.id("thingsGroups"), name: v.string(), quantity: v.string() },
  handler: async (ctx, args) => {
    await requireActiveGroup(ctx.db, args.groupId);
    const catalogueItem = await resolveCatalogueItem(ctx, args.name);
    const activeItems = await activeGroupItems(ctx.db, args.groupId);

    return await ctx.db.insert("thingsGroupItems", {
      groupId: args.groupId,
      catalogueItemId: catalogueItem._id,
      quantity: cleanVisibleText(args.quantity),
      position: nextPosition(activeItems),
    });
  },
});

export const updateGroupItem = mutation({
  args: { itemId: v.id("thingsGroupItems"), name: v.string(), quantity: v.string() },
  handler: async (ctx, args) => {
    await requireActiveItem(ctx.db, args.itemId);
    const catalogueItem = await resolveCatalogueItem(ctx, args.name);
    await ctx.db.patch(args.itemId, {
      catalogueItemId: catalogueItem._id,
      quantity: cleanVisibleText(args.quantity),
    });
  },
});

export const setGroupItemCompleted = mutation({
  args: { itemId: v.id("thingsGroupItems"), completed: v.boolean() },
  handler: async (ctx, args) => {
    const item = await requireActiveItem(ctx.db, args.itemId);
    if ((item.completedAt !== undefined) === args.completed) return;

    if (args.completed) {
      await ctx.db.patch(args.itemId, { completedAt: Date.now() });
      return;
    }

    const activeItems = await activeGroupItems(ctx.db, item.groupId);
    await ctx.db.patch(args.itemId, {
      completedAt: undefined,
      position: nextPosition(activeItems),
    });
  },
});

export const reorderGroupItems = mutation({
  args: { groupId: v.id("thingsGroups"), itemIds: v.array(v.id("thingsGroupItems")) },
  handler: async (ctx, args) => {
    await requireActiveGroup(ctx.db, args.groupId);
    const activeItems = await activeGroupItems(ctx.db, args.groupId);
    assertCompleteOrder(
      args.itemIds.map(String),
      activeItems.map((item) => String(item._id)),
    );
    await Promise.all(args.itemIds.map((itemId, position) => ctx.db.patch(itemId, { position })));
  },
});

export const deleteGroupItem = mutation({
  args: { itemId: v.id("thingsGroupItems") },
  handler: async (ctx, args) => {
    const item = await requireActiveItem(ctx.db, args.itemId);
    await ctx.db.patch(args.itemId, { deletedAt: Date.now() });
    return { itemId: item._id, groupId: item.groupId };
  },
});

export const restoreGroupItem = mutation({
  args: { itemId: v.id("thingsGroupItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item || item.deletedAt === undefined) throw new Error("Deleted item not found.");
    await requireActiveGroup(ctx.db, item.groupId);

    if (item.completedAt !== undefined) {
      await ctx.db.patch(args.itemId, { deletedAt: undefined });
      return;
    }

    const activeItems = await activeGroupItems(ctx.db, item.groupId);
    await ctx.db.patch(args.itemId, {
      deletedAt: undefined,
      position: nextPosition(activeItems),
    });
  },
});

export const clearCompletedGroupItems = mutation({
  args: { groupId: v.id("thingsGroups") },
  handler: async (ctx, args) => {
    await requireActiveGroup(ctx.db, args.groupId);
    const completedItems = (await groupItems(ctx.db, args.groupId)).filter(
      (item) => item.deletedAt === undefined && item.completedAt !== undefined,
    );
    const deletedAt = Date.now();
    await Promise.all(completedItems.map((item) => ctx.db.patch(item._id, { deletedAt })));
  },
});
