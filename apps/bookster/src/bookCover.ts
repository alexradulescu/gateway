const PASTEL_COLORS = [
  "#e8ddd4",
  "#d4c4b5",
  "#c9d4c5",
  "#dde4d5",
  "#e8d8d4",
  "#d8c8c4",
  "#e4d8c8",
  "#d4d8d4",
  "#e0d4d8",
  "#d0dcd4",
  "#dcd8d0",
  "#d8d4dc",
  "#e4dcd4",
  "#c8d4cc",
  "#dcd0d4",
  "#d4dcd8",
] as const;

function hashString(value: string) {
  let hash = 0;
  for (const character of value.toLocaleLowerCase()) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBookInitials(title: string) {
  const words = title.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 3).toLocaleUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase();
}

export function getBookColor(title: string) {
  return PASTEL_COLORS[hashString(title) % PASTEL_COLORS.length];
}

export function getBookPatternIndex(title: string) {
  return hashString(`${title.toLocaleLowerCase()}-pattern`) % 6;
}
