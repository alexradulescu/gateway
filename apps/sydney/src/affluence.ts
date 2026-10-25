/**
 * How well off each area is, from ABS Census 2021:
 * - decile: SEIFA IRSAD (Index of Relative Socio-economic Advantage and
 *   Disadvantage), 1 = most disadvantaged 10% of Australia, 10 = most advantaged.
 *   Blends income, education, jobs and housing.
 * - income: median weekly household income, AUD.
 * Indicative values; verify on ABS QuickStats / SEIFA.
 */
export type Affluence = { decile: number; income: number };

export const affluence: Record<string, Affluence> = {
  "surry-hills": { decile: 9, income: 2300 },
  pyrmont: { decile: 9, income: 2600 },
  glebe: { decile: 7, income: 1900 },
  redfern: { decile: 7, income: 2000 },
  waterloo: { decile: 4, income: 1500 },
  zetland: { decile: 8, income: 2300 },
  alexandria: { decile: 9, income: 2700 },
  newtown: { decile: 8, income: 2100 },
  erskineville: { decile: 9, income: 2600 },
  mascot: { decile: 7, income: 2100 },
  "wolli-creek": { decile: 6, income: 1900 },
  rockdale: { decile: 5, income: 1600 },
  kogarah: { decile: 6, income: 1800 },
  hurstville: { decile: 5, income: 1600 },
  marrickville: { decile: 7, income: 1900 },
  "dulwich-hill": { decile: 8, income: 2100 },
  petersham: { decile: 8, income: 2200 },
  leichhardt: { decile: 9, income: 2400 },
  ashfield: { decile: 6, income: 1600 },
  burwood: { decile: 6, income: 1700 },
  strathfield: { decile: 7, income: 1900 },
  concord: { decile: 9, income: 2500 },
  rhodes: { decile: 7, income: 2100 },
  drummoyne: { decile: 9, income: 2600 },
  balmain: { decile: 10, income: 3000 },
  "wentworth-point": { decile: 7, income: 2000 },
  parramatta: { decile: 5, income: 1700 },
  "north-sydney": { decile: 10, income: 2800 },
  "neutral-bay": { decile: 10, income: 2700 },
  cremorne: { decile: 10, income: 2700 },
  mosman: { decile: 10, income: 3400 },
  "crows-nest": { decile: 10, income: 2600 },
  "st-leonards": { decile: 9, income: 2300 },
  artarmon: { decile: 9, income: 2400 },
  chatswood: { decile: 8, income: 2100 },
  "lane-cove": { decile: 10, income: 2700 },
  willoughby: { decile: 10, income: 3000 },
  "macquarie-park": { decile: 6, income: 1700 },
  "bondi-junction": { decile: 9, income: 2400 },
  bondi: { decile: 9, income: 2500 },
  "double-bay": { decile: 10, income: 3000 },
  paddington: { decile: 10, income: 3100 },
  randwick: { decile: 9, income: 2300 },
  kensington: { decile: 7, income: 1800 },
  coogee: { decile: 9, income: 2500 },
  manly: { decile: 10, income: 2900 },
};

export function affluenceFor(id: string): Affluence {
  return affluence[id] ?? { decile: 5, income: 1800 };
}

export function affluenceLabel(decile: number) {
  if (decile >= 9) return "Very well off";
  if (decile >= 7) return "Well off";
  if (decile >= 5) return "Mixed";
  return "Lower income";
}
