const COVER_COLORS = ["#0058ad", "#008a9a", "#b43f28", "#166849", "#5b4094", "#a53b61"] as const;

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
  return COVER_COLORS[hashString(title) % COVER_COLORS.length];
}

export function getBookPatternIndex(title: string) {
  return hashString(`${title.toLocaleLowerCase()}-pattern`) % 6;
}
