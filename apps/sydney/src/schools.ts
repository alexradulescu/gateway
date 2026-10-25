/**
 * Rough quality tiers, from widely cited public rankings:
 * - Primary: NAPLAN-based state rankings (Better Education / My School results
 *   vs. similar schools).
 * - High: HSC Band 6 rankings (selective and independent schools dominate).
 * Indicative only — verify on myschool.edu.au before relying on a catchment.
 */
export type Tier = 1 | 2 | 3 | 4;

export const TIER_LABEL: Record<Tier, string> = {
  1: "Top tier",
  2: "Strong",
  3: "Solid",
  4: "Average",
};

export const TIER_HINT: Record<Tier, string> = {
  1: "Roughly top 5% in NSW",
  2: "Roughly top 15–20%",
  3: "Above state average",
  4: "Around state average",
};

// First match wins, so list specific names before general ones.
const RULES: [RegExp, Tier][] = [
  // Selective & leading independent
  [/James Ruse|North Sydney Boys|Sydney Boys|Fort Street|St George Girls/, 1],
  [
    /Shore|Ascham|Queenwood|Sydney Grammar|Riverview|MLC School|Trinity Grammar|PLC Sydney|King's School|Reddam/,
    1,
  ],
  [/Sydney Technical|Manly Selective|Brigidine/, 2],
  // Primaries
  [
    /Artarmon Public|North Sydney Demonstration|Chatswood Public|Neutral Bay Public|Strathfield North|Woollahra Public/,
    1,
  ],
  [
    /Willoughby Public|Lane Cove|Mosman Public|Beauty Point|Concord (West )?Public|Burwood Public|Hurstville Public|Kogarah Public|Erskineville|Newtown Public|Stanmore|Leichhardt Public|Ferncourt|Marrickville West|Forest Lodge|Ultimo|Bourke Street|Crown Street|Balmain Public|Nicholson Street|Rozelle|Drummoyne|Wentworth Point|North Ryde|Bondi Beach|Double Bay|Paddington Public|Glenmore Road|Randwick Public|Coogee Public|Kensington Public|Manly (Village|West)|Naremburn/,
    2,
  ],
  // Public highs
  [
    /Chatswood High|Willoughby Girls|Cammeraygal|Mosman High|Burwood Girls|Strathfield Girls|Epping Boys/,
    2,
  ],
  [/Marrickville High|Ashfield Boys|James Cook|Kogarah High|JJ Cahill/, 4],
];

export function schoolTier(name: string): Tier {
  for (const [re, tier] of RULES) if (re.test(name)) return tier;
  return 3;
}
