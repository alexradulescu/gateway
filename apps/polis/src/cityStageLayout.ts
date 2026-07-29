import { PLOT_DISTRICTS, PLOT_TRAITS, type PlotTrait } from "./map";

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
  id: "thalassa-02";
  sites: CityStageSite[];
  sitesByPlot: Map<number, CityStageSite>;
  townHall: CityStageLandmark;
  harbour: CityStageLandmark;
};

export type StageAnchorOverrides = Partial<Record<number, StagePosition>>;

const ROAD_BACKGROUNDS = [
  "/polis/assets/thalassa-02-road-1.avif",
  "/polis/assets/thalassa-02-road-2.avif",
  "/polis/assets/thalassa-02-road-3.avif",
  "/polis/assets/thalassa-02-road-4.avif",
] as const;

/**
 * Approximate building-anchor list in player-facing plot order (Plot 1 is index 0).
 * Each pair is the ground-contact [x, y] on the 1536 × 1024 stage.
 * Calibration workflow and a labelled table: docs/polis/placement-guide.md.
 */
const POSITIONS: ReadonlyArray<readonly [number, number]> = [
  // Civic heart: eight connected western and southern clearings.
  [365, 360],
  [245, 455],
  [480, 450],
  [350, 538],
  [535, 605],
  [700, 675],
  [390, 730],
  [550, 740],
  // Olive ridge: eight connected northern clearings.
  [490, 286],
  [610, 165],
  [808, 138],
  [950, 170],
  [1080, 145],
  [1215, 175],
  [1360, 235],
  [700, 260],
  // Harbour ward: eight connected eastern clearings.
  [860, 280],
  [1195, 295],
  [1350, 362],
  [1135, 410],
  [1300, 495],
  [1225, 595],
  [1370, 630],
  [875, 578],
];

function districtForPlot(plotId: number) {
  return PLOT_DISTRICTS.findIndex((plots) => plots.includes(plotId));
}

const sites = POSITIONS.map(([x, y], plotId): CityStageSite => {
  const large = plotId === 6 || plotId === 18;
  return {
    plotId,
    district: districtForPlot(plotId),
    position: { x, y },
    radiusX: large ? 88 : 76,
    radiusY: large ? 43 : 37,
    trait: PLOT_TRAITS[plotId],
    size: large ? "large" : "standard",
  };
});

export const THALASSA_LAYOUT: CityStageLayout = {
  id: "thalassa-02",
  sites,
  sitesByPlot: new Map(sites.map((site) => [site.plotId, site])),
  townHall: {
    kind: "town-hall",
    position: { x: 720, y: 470 },
    scale: 1.08,
  },
  harbour: {
    kind: "harbour",
    position: { x: 1100, y: 735 },
    scale: 1,
  },
};

export function getRoadBackground(roadLevel: number) {
  const index = Math.max(0, Math.min(3, Math.trunc(roadLevel) - 1));
  return ROAD_BACKGROUNDS[index];
}

export function positionForSite(site: CityStageSite, overrides: StageAnchorOverrides) {
  return overrides[site.plotId] ?? site.position;
}
