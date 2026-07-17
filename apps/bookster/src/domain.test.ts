import { describe, expect, test } from "bun:test";
import {
  cleanBooksterText,
  findDuplicateGroups,
  filterBooksByCategories,
  searchBooks,
  sortBooks,
} from "./domain";
import { getBookColor, getBookInitials, getBookPatternIndex } from "./bookCover";

describe("Bookster text cleanup", () => {
  test("stores readable single-line text without changing punctuation or case", () => {
    expect(cleanBooksterText("  A  Memory\nCalled\tEmpire  ")).toBe("A Memory Called Empire");
    expect(cleanBooksterText("L'Étranger — Camus")).toBe("L'Étranger — Camus");
  });
});

describe("Bookster search", () => {
  test("ranks title prefixes before title substrings and author matches", () => {
    const books = [
      book("1", "Empire of Silence", "Christopher Ruocchio"),
      book("2", "A Memory Called Empire", "Arkady Martine"),
      book("3", "Ancillary Justice", "Ann Empire"),
      book("4", "Unrelated", "Nobody"),
    ];

    expect(searchBooks(books, "emp").map((candidate) => candidate._id)).toEqual(["1", "2", "3"]);
    expect(searchBooks(books, "e")).toEqual(books);
  });

  test("finds small typos, accents, and authors written in a different order", () => {
    const books = [
      book("1", "A Desolation Called Peace", "Arkady Martine"),
      book("2", "L'Étranger", "Albert Camus"),
      book("3", "Ancillary Justice", "Ann Leckie"),
    ];

    expect(searchBooks(books, "desolaton").map((candidate) => candidate._id)).toEqual(["1"]);
    expect(searchBooks(books, "etranger").map((candidate) => candidate._id)).toEqual(["2"]);
    expect(searchBooks(books, "Martine Arkady").map((candidate) => candidate._id)).toEqual(["1"]);
  });
});

describe("Bookster category filters", () => {
  test("shows everything initially and includes books from any selected category", () => {
    const uncategorized = book("1", "No category", "Author");
    const scienceFiction = { ...book("2", "Dune", "Frank Herbert"), categoryIds: ["sci-fi"] };
    const shared = {
      ...book("3", "Shared", "Author"),
      categoryIds: ["sci-fi", "soft-cover"],
    };
    const books = [uncategorized, scienceFiction, shared];

    expect(filterBooksByCategories(books, new Set())).toEqual(books);
    expect(
      filterBooksByCategories(books, new Set(["sci-fi"])).map((candidate) => candidate._id),
    ).toEqual(["2", "3"]);
    expect(
      filterBooksByCategories(books, new Set(["sci-fi", "soft-cover"])).map(
        (candidate) => candidate._id,
      ),
    ).toEqual(["2", "3"]);
  });
});

describe("Bookster sorting", () => {
  test("sorts deterministically and places missing labels last", () => {
    const books = [
      { ...book("3", "zulu", "Beta"), categoryIds: [] },
      { ...book("2", "Alpha", "Gamma"), categoryIds: ["history"] },
      { ...book("1", "alpha", "Beta"), categoryIds: ["fiction"] },
    ];
    const labels = new Map([
      ["fiction", "Fiction"],
      ["history", "History"],
    ]);

    expect(sortBooks(books, "title", labels, new Map()).map((item) => item._id)).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(sortBooks(books, "category", labels, new Map()).map((item) => item._id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});

describe("Bookster duplicate review", () => {
  test("groups same-title books regardless of author or sample status", () => {
    const first = book("1", " The Hobbit ", "J.R.R. Tolkien");
    const second = { ...book("2", "the hobbit", "Unknown"), isSample: true };
    const unrelated = book("3", "The Silmarillion", "J.R.R. Tolkien");

    expect(findDuplicateGroups([unrelated, second, first])).toEqual([
      {
        normalizedTitle: "the hobbit",
        displayTitle: "the hobbit",
        books: [first, second],
      },
    ]);
  });
});

describe("Bookster generated covers", () => {
  test("derives stable initials, colors, and patterns from a title", () => {
    expect(getBookInitials("A Memory Called Empire")).toBe("AM");
    expect(getBookInitials("Abundance")).toBe("ABU");
    expect(getBookColor("Dune")).toBe(getBookColor("dune"));
    expect(getBookPatternIndex("Dune")).toBe(getBookPatternIndex("dune"));
  });
});

function book(_id: string, title: string, author: string) {
  return {
    _id,
    title,
    author,
    categoryIds: [] as string[],
    locationIds: [] as string[],
    isSample: false,
    dateAdded: 0,
    lastUpdated: 0,
  };
}
