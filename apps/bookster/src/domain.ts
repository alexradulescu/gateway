export function cleanBooksterText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

export type BooksterBookLike = {
  _id: string;
  title: string;
  author: string;
  categoryIds: string[];
  locationIds: string[];
  isSample: boolean;
  dateAdded: number;
  lastUpdated: number;
};

export type BooksterSortOrder = "dateAdded" | "title" | "author" | "category" | "location";

export function normalizeBooksterText(value: string) {
  return cleanBooksterText(value).toLowerCase();
}

function normalizeSearchText(value: string) {
  return normalizeBooksterText(value)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "");
}

function isWithinEditDistance(left: string, right: string, maximumDistance: number) {
  if (Math.abs(left.length - right.length) > maximumDistance) return false;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const distance = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
      current.push(distance);
      rowMinimum = Math.min(rowMinimum, distance);
    }
    if (rowMinimum > maximumDistance) return false;
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length] <= maximumDistance;
}

function fuzzyTextMatch(value: string, term: string) {
  if (value.includes(term)) return true;
  const queryWords = term.split(" ");
  const valueWords = value.split(/[^\p{Letter}\p{Number}]+/u).filter(Boolean);
  return queryWords.every((queryWord) => {
    if (queryWord.length < 4) return valueWords.some((word) => word.startsWith(queryWord));
    const maximumDistance = queryWord.length >= 8 ? 2 : 1;
    return valueWords.some(
      (word) => word.includes(queryWord) || isWithinEditDistance(word, queryWord, maximumDistance),
    );
  });
}

export function searchBooks<T extends BooksterBookLike>(books: T[], rawTerm: string) {
  const term = normalizeSearchText(rawTerm);
  if (term.length < 2) return books;

  return books
    .filter((book) => {
      const title = normalizeSearchText(book.title);
      const author = normalizeSearchText(book.author);
      return fuzzyTextMatch(title, term) || fuzzyTextMatch(author, term);
    })
    .sort((left, right) => {
      const leftTitle = normalizeSearchText(left.title);
      const rightTitle = normalizeSearchText(right.title);
      const rank = (book: T) => {
        const title = normalizeSearchText(book.title);
        const author = normalizeSearchText(book.author);
        if (title.startsWith(term)) return 0;
        if (title.includes(term)) return 1;
        if (fuzzyTextMatch(title, term)) return 2;
        if (author.startsWith(term)) return 3;
        if (author.includes(term)) return 4;
        return 5;
      };
      return (
        rank(left) - rank(right) ||
        leftTitle.localeCompare(rightTitle) ||
        left._id.localeCompare(right._id)
      );
    });
}

export function filterBooksByCategories<T extends BooksterBookLike>(
  books: T[],
  selectedCategoryIds: ReadonlySet<string>,
) {
  if (selectedCategoryIds.size === 0) return books;
  return books.filter((book) =>
    book.categoryIds.some((categoryId) => selectedCategoryIds.has(categoryId)),
  );
}

export function sortBooks<T extends BooksterBookLike>(
  books: T[],
  sortOrder: BooksterSortOrder,
  categoryLabels: ReadonlyMap<string, string>,
  locationLabels: ReadonlyMap<string, string>,
) {
  const sorted = [...books];
  const byTitle = (left: T, right: T) =>
    normalizeBooksterText(left.title).localeCompare(normalizeBooksterText(right.title)) ||
    normalizeBooksterText(left.author).localeCompare(normalizeBooksterText(right.author)) ||
    left._id.localeCompare(right._id);
  const firstLabel = (ids: string[], labels: ReadonlyMap<string, string>) => {
    const label = ids.map((id) => labels.get(id)).find((candidate) => candidate !== undefined);
    return label === undefined ? null : normalizeBooksterText(label);
  };

  sorted.sort((left, right) => {
    if (sortOrder === "dateAdded") {
      return right.dateAdded - left.dateAdded || byTitle(left, right);
    }
    if (sortOrder === "title") return byTitle(left, right);
    if (sortOrder === "author") {
      return (
        normalizeBooksterText(left.author).localeCompare(normalizeBooksterText(right.author)) ||
        byTitle(left, right)
      );
    }

    const labels = sortOrder === "category" ? categoryLabels : locationLabels;
    const leftIds = sortOrder === "category" ? left.categoryIds : left.locationIds;
    const rightIds = sortOrder === "category" ? right.categoryIds : right.locationIds;
    const leftLabel = firstLabel(leftIds, labels);
    const rightLabel = firstLabel(rightIds, labels);
    if (leftLabel === null && rightLabel !== null) return 1;
    if (leftLabel !== null && rightLabel === null) return -1;
    return (leftLabel ?? "").localeCompare(rightLabel ?? "") || byTitle(left, right);
  });

  return sorted;
}

export type DuplicateBookGroup<T extends BooksterBookLike> = {
  normalizedTitle: string;
  displayTitle: string;
  books: T[];
};

export function findDuplicateGroups<T extends BooksterBookLike>(books: T[]) {
  const grouped = new Map<string, T[]>();
  for (const book of books) {
    const normalizedTitle = normalizeBooksterText(book.title);
    const group = grouped.get(normalizedTitle) ?? [];
    group.push(book);
    grouped.set(normalizedTitle, group);
  }

  return [...grouped.entries()]
    .filter(([, group]) => group.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([normalizedTitle, group]): DuplicateBookGroup<T> => {
      const sortedBooks = [...group].sort((left, right) => left._id.localeCompare(right._id));
      return {
        normalizedTitle,
        displayTitle: cleanBooksterText(group[0].title),
        books: sortedBooks,
      };
    });
}
