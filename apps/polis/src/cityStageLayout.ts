import { PLOT_DISTRICTS, type PlotTrait } from "./map";

export const CITY_STAGE_WIDTH = 1536;
export const CITY_STAGE_HEIGHT = 1024;
export const CITY_STAGE_CENTER = {
  x: CITY_STAGE_WIDTH / 2,
  y: CITY_STAGE_HEIGHT / 2,
};

export type StagePosition = {
  x: number;
  y: number;
};

export type CityStageSite = {
  plotId: number;
  district: number;
  position: StagePosition;
  radiusX: number;
  radiusY: number;
  trait: PlotTrait;
  size: "standard" | "large";
};

export type CityStageLandmark = {
  kind: "town-hall" | "harbour";
  position: StagePosition;
  scale: number;
};

export type CityStageLayout = {
  id: "thalassa-01";
  sites: CityStageSite[];
  sitesByPlot: Map<number, CityStageSite>;
  townHall: CityStageLandmark;
  harbour: CityStageLandmark;
};

export type StageAnchorOverrides = Partial<Record<number, StagePosition>>;

const ROAD_BACKGROUNDS = [
  "/polis/assets/thalassa-01-road-1.avif",
  "/polis/assets/thalassa-01-road-2.avif",
  "/polis/assets/thalassa-01-road-3.avif",
  "/polis/assets/thalassa-01-road-4.avif",
] as const;

/**
 * Manual building-anchor list in player-facing plot order (Plot 1 is index 0).
 * Each pair is the ground-contact [x, y] on the 1536 × 1024 stage.
 * Calibration workflow and a labelled table: docs/polis/placement-guide.md.
 */
const POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [230, 210],
  [420, 185],
  [585, 178],
  [785, 180],
  [980, 188],
  [1180, 205],
  [1350, 285],
  [365, 275],
  [650, 286],
  [1162, 298],
  [315, 410],
  [1330, 390],
  [215, 590],
  [610, 610],
  [430, 710],
  [1085, 420],
  [1240, 535],
  [300, 675],
  [560, 760],
  [338, 520],
  [720, 690],
  [970, 520],
  [905, 305],
  [760, 810],
  [900, 760],
  [1050, 710],
  [220, 795],
  [380, 850],
  [555, 875],
  [735, 900],
  [1230, 650],
  [1330, 585],
  [915, 870],
  [1080, 835],
  [1230, 790],
  [1360, 715],
];

const TRAITS: PlotTrait[] = [
  "hillside",
  "hillside",
  "plain",
  "plain",
  "fertile",
  "hillside",
  "coastal",
  "hillside",
  "plain",
  "fertile",
  "plain",
  "hillside",
  "coastal",
  "plain",
  "fertile",
  "fertile",
  "hillside",
  "coastal",
  "fertile",
  "plain",
  "fertile",
  "plain",
  "fertile",
  "coastal",
  "coastal",
  "coastal",
  "coastal",
  "plain",
  "plain",
  "coastal",
  "coastal",
  "hillside",
  "plain",
  "hillside",
  "coastal",
  "coastal",
];

function districtForPlot(plotId: number) {
  return PLOT_DISTRICTS.findIndex((plots) => plots.includes(plotId));
}

const sites = POSITIONS.map(([x, y], plotId): CityStageSite => {
  const large = plotId === 15 || plotId === 16;
  return {
    plotId,
    district: districtForPlot(plotId),
    position: { x, y },
    radiusX: large ? 88 : 76,
    radiusY: large ? 43 : 37,
    trait: TRAITS[plotId],
    size: large ? "large" : "standard",
  };
});

export const THALASSA_LAYOUT: CityStageLayout = {
  id: "thalassa-01",
  sites,
  sitesByPlot: new Map(sites.map((site) => [site.plotId, site])),
  townHall: {
    kind: "town-hall",
    position: { x: 750, y: 470 },
    scale: 1.16,
  },
  harbour: {
    kind: "harbour",
    position: { x: 1180, y: 715 },
    scale: 1.06,
  },
};

export function getRoadBackground(roadLevel: number) {
  const index = Math.max(0, Math.min(3, Math.trunc(roadLevel) - 1));
  return ROAD_BACKGROUNDS[index];
}

export function positionForSite(site: CityStageSite, overrides: StageAnchorOverrides) {
  return overrides[site.plotId] ?? site.position;
}
