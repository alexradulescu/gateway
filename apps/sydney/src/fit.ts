import { affluenceFor } from "./affluence";
import { ANGLO, type Amenity, type Suburb } from "./data";

export type Prefs = {
  budget: number; // AUD thousands
  beds: 2 | 3;
  maxCommute: number;
  /** Hide suburbs where one non-Anglo-Celtic ancestry is at or above this share. 100 = off. */
  maxSingleGroup: number;
  /** Minimum SEIFA advantage decile (1 = off). */
  minAffluence: number;
};

export const defaultPrefs: Prefs = {
  budget: 2000,
  beds: 3,
  maxCommute: 45,
  maxSingleGroup: 100,
  minAffluence: 1,
};

export function priceFor(s: Suburb, beds: 2 | 3) {
  return beds === 2 ? s.buy2 : s.buy3;
}

export function rentFor(s: Suburb, beds: 2 | 3) {
  return beds === 2 ? s.rent2 : s.rent3;
}

/** Largest ancestry group outside Anglo-Celtic/Australian responses. */
export function largestOtherGroup(s: Suburb): [string, number] | null {
  return s.ancestry.find(([name]) => !ANGLO.has(name)) ?? null;
}

const ESSENTIALS: Amenity["kind"][] = ["supermarket", "food", "station", "park"];

/** Average walk to everyday essentials; lower is better. */
export function essentialsWalk(s: Suburb) {
  const walks = ESSENTIALS.map(
    (kind) => Math.min(...s.amenities.filter((a) => a.kind === kind).map((a) => a.walk)) || 30,
  );
  return Math.round(walks.reduce((a, b) => a + b, 0) / walks.length);
}

export function passes(s: Suburb, p: Prefs) {
  const other = largestOtherGroup(s);
  return (
    s.commute <= p.maxCommute &&
    priceFor(s, p.beds)[0] <= p.budget &&
    (p.maxSingleGroup >= 100 || !other || other[1] < p.maxSingleGroup) &&
    affluenceFor(s.id).decile >= p.minAffluence
  );
}

/**
 * 0–100 "fit" for this family. Each factor is normalised to 0..1, then weighted.
 * Weights reflect the brief: being close to shops/food matters most, then
 * safety, commute and price headroom.
 */
export function fitScore(s: Suburb, p: Prefs) {
  const convenience = clamp01((20 - essentialsWalk(s)) / 17); // 3 min ≈ 1, 20 min ≈ 0
  const safety = (s.safety - 1) / 4;
  const commute = clamp01((p.maxCommute - s.commute) / (p.maxCommute - 10));
  const [low, high] = priceFor(s, p.beds);
  const mid = (low + high) / 2;
  const headroom = clamp01((p.budget - mid) / (p.budget * 0.5));
  const hospital = s.amenities.some((a) => a.kind === "hospital" && a.walk <= 15) ? 1 : 0;

  const affluent = clamp01((affluenceFor(s.id).decile - 4) / 6); // decile 4 ≈ 0, 10 = 1

  const score =
    0.3 * convenience +
    0.2 * safety +
    0.2 * commute +
    0.15 * affluent +
    0.1 * headroom +
    0.05 * hospital;
  return Math.round(score * 100);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function fmtK(k: number) {
  return k >= 1000 ? `$${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 2).replace(/0$/, "")}M` : `$${k}k`;
}
