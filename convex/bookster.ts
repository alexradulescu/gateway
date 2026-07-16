import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const DEFAULT_USER_ID = "default";
const DEFAULT_LOCATIONS = ["Bookshelf", "Kindle", "Apple Books", "Google Books", "PDF"];
const sortOrder = v.union(
  v.literal("dateAdded"),
  v.literal("title"),
  v.literal("author"),
  v.literal("category"),
  v.literal("location"),
);

function cleanText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value).toLowerCase();
}

function bookKey(title: string, author: string) {
  return JSON.stringify([normalizeText(title), normalizeText(author)]);
}

async function activeCategoryIds(ctx: MutationCtx, ids: Id<"booksterCategories">[]) {
  const categories = await Promise.all(ids.map(async (id) => await ctx.db.get(id)));
  return ids.filter((_, index) => categories[index] && categories[index].deletedAt === undefined);
}

async function activeLocationIds(ctx: MutationCtx, ids: Id<"booksterLocations">[]) {
  const locations = await Promise.all(ids.map(async (id) => await ctx.db.get(id)));
  return ids.filter((_, index) => locations[index] && locations[index].deletedAt === undefined);
}

async function getSettings(ctx: MutationCtx) {
  return await ctx.db
    .query("booksterSettings")
    .withIndex("by_userId", (index) => index.eq("userId", DEFAULT_USER_ID))
    .first();
}

async function requireUniqueBook(
  ctx: MutationCtx,
  title: string,
  author: string,
  excludeId?: Id<"booksterBooks">,
) {
  const key = bookKey(title, author);
  const books = await ctx.db.query("booksterBooks").collect();
  if (books.some((book) => book._id !== excludeId && bookKey(book.title, book.author) === key)) {
    throw new ConvexError("This book already exists in your library.");
  }
}

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query("booksterLocations").collect();
    if (locations.length === 0) {
      for (const label of DEFAULT_LOCATIONS) {
        await ctx.db.insert("booksterLocations", { label });
      }
    }
    if (!(await getSettings(ctx))) {
      await ctx.db.insert("booksterSettings", {
        userId: DEFAULT_USER_ID,
        defaultSortOrder: "dateAdded",
        theme: "system",
      });
    }
  },
});

export const library = query({
  args: {},
  handler: async (ctx) => {
    const [books, allCategories, allLocations, settings] = await Promise.all([
      ctx.db.query("booksterBooks").withIndex("by_dateAdded").order("desc").collect(),
      ctx.db.query("booksterCategories").collect(),
      ctx.db.query("booksterLocations").collect(),
      ctx.db
        .query("booksterSettings")
        .withIndex("by_userId", (index) => index.eq("userId", DEFAULT_USER_ID))
        .first(),
    ]);
    return {
      books,
      categories: allCategories
        .filter((category) => category.deletedAt === undefined)
        .sort((left, right) => left.label.localeCompare(right.label)),
      locations: allLocations
        .filter((location) => location.deletedAt === undefined)
        .sort((left, right) => left.label.localeCompare(right.label)),
      allLocations,
      settings: settings ?? {
        userId: DEFAULT_USER_ID,
        defaultSortOrder: "dateAdded" as const,
        theme: "system" as const,
      },
    };
  },
});

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    categoryIds: v.array(v.id("booksterCategories")),
    locationIds: v.array(v.id("booksterLocations")),
    isSample: v.boolean(),
  },
  handler: async (ctx, args) => {
    const title = cleanText(args.title);
    const author = cleanText(args.author);
    if (!title || !author) throw new ConvexError("Title and author are required.");
    await requireUniqueBook(ctx, title, author);
    const [categoryIds, locationIds] = await Promise.all([
      activeCategoryIds(ctx, args.categoryIds),
      activeLocationIds(ctx, args.locationIds),
    ]);
    const now = Date.now();
    return await ctx.db.insert("booksterBooks", {
      ...args,
      title,
      author,
      categoryIds,
      locationIds,
      dateAdded: now,
      lastUpdated: now,
    });
  },
});

export const addBookBatch = mutation({
  args: {
    books: v.array(
      v.object({
        title: v.string(),
        author: v.string(),
        isSample: v.boolean(),
      }),
    ),
    locationId: v.optional(v.id("booksterLocations")),
  },
  handler: async (ctx, args) => {
    if (args.books.length > 100) throw new ConvexError("Import batches cannot exceed 100 books.");
    const existingBooks = await ctx.db.query("booksterBooks").collect();
    const keys = new Set(existingBooks.map((book) => bookKey(book.title, book.author)));
    const locationIds = args.locationId ? await activeLocationIds(ctx, [args.locationId]) : [];
    let imported = 0;
    let skipped = 0;
    const now = Date.now();
    for (const candidate of args.books) {
      const title = cleanText(candidate.title);
      const author = cleanText(candidate.author);
      const key = bookKey(title, author);
      if (!title || !author || keys.has(key)) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert("booksterBooks", {
        title,
        author,
        categoryIds: [],
        locationIds,
        isSample: candidate.isSample,
        dateAdded: now + imported,
        lastUpdated: now + imported,
      });
      keys.add(key);
      imported += 1;
    }
    return { imported, skipped };
  },
});

export const updateBook = mutation({
  args: {
    id: v.id("booksterBooks"),
    title: v.string(),
    author: v.string(),
    categoryIds: v.array(v.id("booksterCategories")),
    locationIds: v.array(v.id("booksterLocations")),
    isSample: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError("Book not found.");
    const title = cleanText(args.title);
    const author = cleanText(args.author);
    if (!title || !author) throw new ConvexError("Title and author are required.");
    await requireUniqueBook(ctx, title, author, args.id);
    const [categoryIds, locationIds] = await Promise.all([
      activeCategoryIds(ctx, args.categoryIds),
      activeLocationIds(ctx, args.locationIds),
    ]);
    await ctx.db.patch(args.id, {
      title,
      author,
      categoryIds,
      locationIds,
      isSample: args.isSample,
      lastUpdated: Date.now(),
    });
  },
});

export const removeBook = mutation({
  args: { id: v.id("booksterBooks") },
  handler: async (ctx, args) => {
    if (!(await ctx.db.get(args.id))) throw new ConvexError("Book not found.");
    await ctx.db.delete(args.id);
  },
});

async function createLabel(
  ctx: MutationCtx,
  table: "booksterCategories" | "booksterLocations",
  rawLabel: string,
) {
  const label = cleanText(rawLabel);
  if (!label) throw new ConvexError("Label is required.");
  const normalized = normalizeText(label);
  const labels = await ctx.db.query(table).collect();
  const matching = labels.find((candidate) => normalizeText(candidate.label) === normalized);
  if (matching && matching.deletedAt === undefined) {
    throw new ConvexError("That label already exists.");
  }
  if (matching) {
    await ctx.db.patch(matching._id, { label, deletedAt: undefined });
    return matching._id;
  }
  return await ctx.db.insert(table, { label });
}

async function updateLabel(
  ctx: MutationCtx,
  table: "booksterCategories" | "booksterLocations",
  id: Id<"booksterCategories"> | Id<"booksterLocations">,
  rawLabel: string,
) {
  const existing = await ctx.db.get(id);
  if (!existing) throw new ConvexError("Label not found.");
  const label = cleanText(rawLabel);
  if (!label) throw new ConvexError("Label is required.");
  const normalized = normalizeText(label);
  const labels = await ctx.db.query(table).collect();
  if (
    labels.some(
      (candidate) =>
        candidate._id !== id &&
        candidate.deletedAt === undefined &&
        normalizeText(candidate.label) === normalized,
    )
  ) {
    throw new ConvexError("That label already exists.");
  }
  await ctx.db.patch(id, { label });
}

export const createCategory = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => await createLabel(ctx, "booksterCategories", args.label),
});

export const updateCategory = mutation({
  args: { id: v.id("booksterCategories"), label: v.string() },
  handler: async (ctx, args) => await updateLabel(ctx, "booksterCategories", args.id, args.label),
});

export const createLocation = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => await createLabel(ctx, "booksterLocations", args.label),
});

export const updateLocation = mutation({
  args: { id: v.id("booksterLocations"), label: v.string() },
  handler: async (ctx, args) => await updateLabel(ctx, "booksterLocations", args.id, args.label),
});

export const removeCategory = mutation({
  args: { id: v.id("booksterCategories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) throw new ConvexError("Category not found.");
    const books = await ctx.db.query("booksterBooks").collect();
    const affected = books.filter((book) => book.categoryIds.includes(args.id));
    for (const book of affected) {
      await ctx.db.patch(book._id, {
        categoryIds: book.categoryIds.filter((categoryId) => categoryId !== args.id),
        lastUpdated: Date.now(),
      });
    }
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
    return { affectedBooks: affected.length };
  },
});

export const removeLocation = mutation({
  args: { id: v.id("booksterLocations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.id);
    if (!location) throw new ConvexError("Location not found.");
    const books = await ctx.db.query("booksterBooks").collect();
    const affected = books.filter((book) => book.locationIds.includes(args.id));
    for (const book of affected) {
      await ctx.db.patch(book._id, {
        locationIds: book.locationIds.filter((locationId) => locationId !== args.id),
        lastUpdated: Date.now(),
      });
    }
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
    return { affectedBooks: affected.length };
  },
});

export const updateSortOrder = mutation({
  args: { defaultSortOrder: sortOrder },
  handler: async (ctx, args) => {
    const settings = await getSettings(ctx);
    if (settings) {
      await ctx.db.patch(settings._id, { defaultSortOrder: args.defaultSortOrder });
    } else {
      await ctx.db.insert("booksterSettings", {
        userId: DEFAULT_USER_ID,
        defaultSortOrder: args.defaultSortOrder,
        theme: "system",
      });
    }
  },
});

export type BooksterLibrary = {
  books: Doc<"booksterBooks">[];
  categories: Doc<"booksterCategories">[];
  locations: Doc<"booksterLocations">[];
};
