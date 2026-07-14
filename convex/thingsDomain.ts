const COMPLETE_ORDER_ERROR = "Order must include every visible record exactly once.";

export function cleanVisibleText(value: string) {
  return value
    .replace(/[\r\n]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

export function normalizeGroupName(value: string) {
  return cleanVisibleText(value).toLocaleLowerCase("en");
}

export function normalizeCatalogueKey(value: string) {
  return cleanVisibleText(value)
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

type CatalogueMatchCandidate = {
  canonicalName: string;
  normalizedKey: string;
};

export function rankCatalogueMatches<T extends CatalogueMatchCandidate>(
  catalogue: readonly T[],
  input: string,
  limit = 10,
) {
  const query = normalizeCatalogueKey(input);
  if (!query) return [];

  const matches: Array<{ item: T; tier: number }> = [];
  for (const item of catalogue) {
    const tier =
      item.normalizedKey === query
        ? 0
        : item.normalizedKey.startsWith(query)
          ? 1
          : item.normalizedKey.includes(query)
            ? 2
            : -1;
    if (tier >= 0) matches.push({ item, tier });
  }

  return matches
    .sort(
      (left, right) =>
        left.tier - right.tier ||
        left.item.canonicalName.localeCompare(right.item.canonicalName, undefined, {
          sensitivity: "base",
        }),
    )
    .slice(0, limit)
    .map(({ item }) => item);
}

export function nextPosition(records: ReadonlyArray<{ position: number }>) {
  return records.reduce((highest, record) => Math.max(highest, record.position), -1) + 1;
}

export function assertCompleteOrder(
  submittedIds: readonly string[],
  visibleIds: readonly string[],
) {
  if (
    submittedIds.length !== visibleIds.length ||
    new Set(submittedIds).size !== submittedIds.length
  ) {
    throw new Error(COMPLETE_ORDER_ERROR);
  }

  const visible = new Set(visibleIds);
  if (submittedIds.some((id) => !visible.has(id))) {
    throw new Error(COMPLETE_ORDER_ERROR);
  }
}
