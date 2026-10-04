/**
 * Painted building sprites (public/sprites), sliced from one sheet where every building
 * stands on the same ground diamond. One shared scale keeps their relative sizes; a gentle
 * per-tier boost makes later landmarks read as grander, since the sheet's height steps are mild.
 */

type Sprite = { name: string; file: string; width: number; height: number };

// Tier order: index 0 = tile 2, index 11 = tile 4096 (and beyond).
const SPRITES: Sprite[] = [
  { name: "Fountain square", file: "01-fountain.webp", width: 243, height: 160 },
  { name: "Kiosk buvette", file: "02-kiosk.webp", width: 223, height: 230 },
  { name: "Boulangerie", file: "03-boulangerie.webp", width: 277, height: 261 },
  { name: "Brasserie", file: "04-brasserie.webp", width: 284, height: 309 },
  { name: "Hôtel particulier", file: "05-hotel.webp", width: 284, height: 298 },
  { name: "Immeuble haussmannien", file: "06-haussmann.webp", width: 273, height: 358 },
  { name: "Marché couvert", file: "07-market.webp", width: 350, height: 278 },
  { name: "Église", file: "08-church.webp", width: 307, height: 372 },
  { name: "Opéra Garnier", file: "09-opera.webp", width: 355, height: 352 },
  { name: "Arc de Triomphe", file: "10-arc.webp", width: 284, height: 306 },
  { name: "Notre-Dame", file: "11-notre-dame.webp", width: 386, height: 351 },
  { name: "Tour Eiffel", file: "12-eiffel.webp", width: 276, height: 379 },
];

/** Sheet pixels → share of the plot's on-screen diagonal. */
const SCALE = 0.72 / 386;
/** Widest any sprite may be, as a share of the plot diagonal: inside the lawn (~0.76). */
const MAX_FIT = 0.74;

export function buildingFor(value: number) {
  const tier = Math.min(Math.max(Math.log2(value) - 1, 0), SPRITES.length - 1);
  const sprite = SPRITES[tier];
  const boost = 0.92 + tier * 0.025;
  return {
    name: sprite.name,
    src: `${import.meta.env.BASE_URL}sprites/${sprite.file}`,
    aspect: sprite.height / sprite.width,
    fit: Math.min(MAX_FIT, sprite.width * SCALE * boost),
  };
}

/** Warm the browser cache so a newly reached tier never pops in blank on its first merge. */
export function preloadBuildings() {
  for (const sprite of SPRITES)
    new Image().src = `${import.meta.env.BASE_URL}sprites/${sprite.file}`;
}
