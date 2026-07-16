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

export function searchBooks<T extends BooksterBookLike>(books: T[], rawTerm: string) {
  const term = normalizeBooksterText(rawTerm);
  if (term.length < 3) return books;

  return books
    .filter((book) => {
      const title = normalizeBooksterText(book.title);
      const author = normalizeBooksterText(book.author);
      return title.includes(term) || author.includes(term);
    })
    .sort((left, right) => {
      const leftTitle = normalizeBooksterText(left.title);
      const rightTitle = normalizeBooksterText(right.title);
      const leftRank = leftTitle.startsWith(term) ? 0 : leftTitle.includes(term) ? 1 : 2;
      const rightRank = rightTitle.startsWith(term) ? 0 : rightTitle.includes(term) ? 1 : 2;
      return (
        leftRank - rightRank ||
        leftTitle.localeCompare(rightTitle) ||
        left._id.localeCompare(right._id)
      );
    });
}

export function filterBooksByCategories<T extends BooksterBookLike>(
  books: T[],
  deselectedCategoryIds: ReadonlySet<string>,
  activeCategoryIds?: ReadonlySet<string>,
) {
  if (deselectedCategoryIds.size === 0) return books;
  return books.filter((book) =>
    book.categoryIds.some(
      (categoryId) =>
        (activeCategoryIds === undefined || activeCategoryIds.has(categoryId)) &&
        !deselectedCategoryIds.has(categoryId),
    ),
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
