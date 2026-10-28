import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const house = v.union(
  v.literal("slytherin"),
  v.literal("gryffindor"),
  v.literal("ravenclaw"),
  v.literal("hufflepuff"),
);

function countWords(body: string) {
  const words = body.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function clean(value: string, label: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`${label} cannot be empty.`);
  if (trimmed.length > max) throw new Error(`${label} is too long.`);
  return trimmed;
}

async function touchBook(ctx: MutationCtx, bookId: Id<"libraryBooks">) {
  await ctx.db.patch(bookId, { updatedAt: Date.now() });
}

export const listBooks = query({
  args: {},
  handler: async (ctx) => {
    const books = await ctx.db.query("libraryBooks").withIndex("by_position").collect();
    const live = books.filter((book) => book.deletedAt === undefined);

    return await Promise.all(
      live.map(async (book) => {
        const chapters = await ctx.db
          .query("libraryChapters")
          .withIndex("by_book_position", (q) => q.eq("bookId", book._id))
          .collect();
        const visible = chapters.filter((chapter) => chapter.deletedAt === undefined);
        const published = visible.filter((chapter) => chapter.published);
        return {
          ...book,
          chapterCount: published.length,
          draftCount: visible.length - published.length,
          wordCount: published.reduce((sum, chapter) => sum + chapter.wordCount, 0),
        };
      }),
    );
  },
});

export const getBook = query({
  args: { bookId: v.id("libraryBooks") },
  handler: async (ctx, { bookId }) => {
    const book = await ctx.db.get(bookId);
    if (!book || book.deletedAt !== undefined) return null;

    const chapters = await ctx.db
      .query("libraryChapters")
      .withIndex("by_book_position", (q) => q.eq("bookId", bookId))
      .collect();

    return {
      book,
      chapters: chapters
        .filter((chapter) => chapter.deletedAt === undefined)
        .map(({ body: _body, ...meta }) => meta),
    };
  },
});

export const getChapter = query({
  args: { chapterId: v.id("libraryChapters") },
  handler: async (ctx, { chapterId }) => {
    const chapter = await ctx.db.get(chapterId);
    if (!chapter || chapter.deletedAt !== undefined) return null;
    return chapter;
  },
});

export const saveBook = mutation({
  args: {
    bookId: v.optional(v.id("libraryBooks")),
    title: v.string(),
    subtitle: v.string(),
    blurb: v.string(),
    narrator: v.string(),
    house,
    series: v.optional(v.string()),
  },
  handler: async (ctx, { bookId, ...fields }) => {
    const now = Date.now();
    const data = {
      title: clean(fields.title, "Title", 160),
      subtitle: fields.subtitle.trim().slice(0, 200),
      blurb: fields.blurb.trim().slice(0, 4000),
      narrator: fields.narrator.trim().slice(0, 120),
      house: fields.house,
      series: fields.series?.trim() || undefined,
      updatedAt: now,
    };

    if (bookId) {
      await ctx.db.patch(bookId, data);
      return bookId;
    }

    const last = await ctx.db.query("libraryBooks").withIndex("by_position").order("desc").first();
    return await ctx.db.insert("libraryBooks", {
      ...data,
      position: (last?.position ?? 0) + 1,
      createdAt: now,
    });
  },
});

export const removeBook = mutation({
  args: { bookId: v.id("libraryBooks") },
  handler: async (ctx, { bookId }) => {
    await ctx.db.patch(bookId, { deletedAt: Date.now() });
  },
});

export const saveChapter = mutation({
  args: {
    bookId: v.id("libraryBooks"),
    chapterId: v.optional(v.id("libraryChapters")),
    title: v.string(),
    body: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, { bookId, chapterId, title, body, published }) => {
    const now = Date.now();
    const data = {
      title: clean(title, "Chapter title", 200),
      body,
      wordCount: countWords(body),
      published,
      updatedAt: now,
    };

    let id = chapterId;
    if (id) {
      await ctx.db.patch(id, data);
    } else {
      const last = await ctx.db
        .query("libraryChapters")
        .withIndex("by_book_position", (q) => q.eq("bookId", bookId))
        .order("desc")
        .first();
      id = await ctx.db.insert("libraryChapters", {
        ...data,
        bookId,
        position: (last?.position ?? 0) + 1,
        createdAt: now,
      });
    }
    await touchBook(ctx, bookId);
    return id;
  },
});

export const removeChapter = mutation({
  args: { chapterId: v.id("libraryChapters") },
  handler: async (ctx, { chapterId }) => {
    const chapter = await ctx.db.get(chapterId);
    if (!chapter) return;
    await ctx.db.patch(chapterId, { deletedAt: Date.now() });
    await touchBook(ctx, chapter.bookId);
  },
});

export const moveChapter = mutation({
  args: { chapterId: v.id("libraryChapters"), direction: v.union(v.literal(-1), v.literal(1)) },
  handler: async (ctx, { chapterId, direction }) => {
    const chapter = await ctx.db.get(chapterId);
    if (!chapter) return;
    const siblings = (
      await ctx.db
        .query("libraryChapters")
        .withIndex("by_book_position", (q) => q.eq("bookId", chapter.bookId))
        .collect()
    ).filter((item) => item.deletedAt === undefined);
    const index = siblings.findIndex((item) => item._id === chapterId);
    const other = siblings[index + direction];
    if (!other) return;
    await ctx.db.patch(chapter._id, { position: other.position });
    await ctx.db.patch(other._id, { position: chapter.position });
  },
});

const PROLOGUE = `The Manor had been built to be admired from a distance, and on the night Darecaena Malfoy was born it was admired by no one at all.

Snow had come early to Wiltshire. It lay on the yew hedges and the long gravel drive and the backs of the white peacocks, who stood in the dark like small, offended ghosts. Inside, every candle in the east wing had been lit, because Narcissa had asked for light, and Lucius had learned long ago that it was cheaper to give Narcissa what she asked for than to explain why he would not.

The midwife was a Healer from St Mungo's who had been paid three times her usual fee to forget the address. She did not forget it. She forgot, instead, the thing she was meant to remember — that the Malfoys had been promised a son.

"A daughter," she said, and held the child up into the candlelight.

***

Lucius did not speak for a long moment. Outside, one of the peacocks cried — a thin, human sound — and in the nursery the cradle carved with serpents rocked once, gently, though no one was near it.

"Darecaena," Narcissa said from the bed. Her voice was hoarse and entirely certain. "After the star."

"There is no star called that."

"There will be."

The baby opened her eyes. They were grey, like her father's, and they were already looking at him as though deciding something.

*Eleven years,* Lucius thought, and was surprised to find that the number frightened him.`;

export const seedLibrary = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("libraryBooks").first();
    if (existing) return existing._id;

    const now = Date.now();
    const bookId = await ctx.db.insert("libraryBooks", {
      title: "The Serpent's Daughter",
      subtitle: "Darecaena Malfoy and the Philosopher's Stone",
      blurb:
        "The Malfoys were promised an heir. They got a daughter with her father's eyes and her mother's nerve. The first year at Hogwarts, retold from the other side of the Great Hall.",
      narrator: "Darecaena Malfoy",
      house: "slytherin",
      series: "The Malfoy Heir · Year One",
      position: 1,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("libraryChapters", {
      bookId,
      title: "Prologue: The Promised Son",
      body: PROLOGUE,
      wordCount: countWords(PROLOGUE),
      published: true,
      position: 1,
      createdAt: now,
      updatedAt: now,
    });
    return bookId;
  },
});
