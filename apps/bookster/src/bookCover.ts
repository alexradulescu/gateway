const COVER_COLORS = [
  "#344c63",
  "#3d5957",
  "#655044",
  "#4b5540",
  "#55516b",
  "#684b57",
  "#3f5869",
  "#68604b",
  "#405c50",
  "#71524a",
  "#4d5366",
  "#605467",
] as const;

// Twelve fixed ornamental designs, shared by shelf and thumbnail covers.
export const COVER_PATTERNS = [
  "M0 20 30 0 60 20M0 28 30 8 60 28M0 70 30 90 60 70M0 62 30 82 60 62",
  "M12 0v90M18 0v90M42 0v90M48 0v90M0 18h60M0 72h60",
  "M0 15Q30 -10 60 15M0 22Q30 -3 60 22M0 75Q30 100 60 75M0 68Q30 93 60 68",
  "M0 0 60 90M-15 0 45 90M15 0 75 90M0 90 60 0M-15 90 45 0M15 90 75 0",
  "M8 8h14M8 8v14M52 8H38M52 8v14M8 82h14M8 82V68M52 82H38M52 82V68",
  "M30 0v90M30 18Q8 18 12 4Q30 4 30 18M30 30Q52 30 48 16Q30 16 30 30M30 62Q8 62 12 48Q30 48 30 62M30 78Q52 78 48 64Q30 64 30 78",
  "M0 15Q15 0 30 15T60 15M0 25Q15 10 30 25T60 25M0 65Q15 50 30 65T60 65M0 75Q15 60 30 75T60 75",
  "M6 90V30a24 24 0 0 1 48 0v60M12 90V30a18 18 0 0 1 36 0v60M18 90V30a12 12 0 0 1 24 0v60",
  "M30 3 42 15 30 27 18 15ZM30 63 42 75 30 87 18 75ZM0 33 12 45 0 57M60 33 48 45 60 57",
  "M0 8h60M0 12h60M0 78h60M0 82h60M8 0v90M12 0v90M48 0v90M52 0v90",
  "M0 0Q60 0 60 60M0 8Q52 8 52 60M0 16Q44 16 44 60M60 90Q0 90 0 30M60 82Q8 82 8 30M60 74Q16 74 16 30",
  "M30 0 0 30M30 0 60 30M30 8 0 38M30 8 60 38M30 90 0 60M30 90 60 60M30 82 0 52M30 82 60 52",
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
  return COVER_COLORS[hashString(title) % COVER_COLORS.length];
}

export function getBookPatternIndex(title: string) {
  return hashString(`${title.toLocaleLowerCase()}-pattern`) % COVER_PATTERNS.length;
}
