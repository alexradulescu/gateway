import { getPlotDistance, getPlotTrait, PLOT_DISTRICTS } from "./map";
export { getPlotDistance, getPlotTrait, PLOT_DISTRICTS } from "./map";
export type { PlotTrait } from "./map";

export type ResourceKey = "food" | "timber" | "stone" | "coin" | "goods" | "knowledge";
export type Resources = Record<ResourceKey, number>;
export type BuildingType =
  | "house"
  | "farm"
  | "lumber"
  | "quarry"
  | "warehouse"
  | "workshop"
  | "market"
  | "academy"
  | "clinic"
  | "firewatch"
  | "barracks"
  | "park";
export type Staffing = 0 | 0.5 | 1 | 1.25;
export type BuildingStatus = "constructing" | "upgrading" | "active" | "damaged";
export type CrisisType = "fire" | "plague" | "invasion" | "drought" | "unrest" | "storm";
export type Doctrine =
  | "balanced"
  | "industrial"
  | "scholarly"
  | "maritime"
  | "civic"
  | "cultural"
  | "pastoral";
export type HarbourMission = "fishing" | "trade" | "patrol";

export type BuildingDefinition = {
  type: BuildingType;
  name: string;
  shortName: string;
  description: string;
  atlasIndex: number;
  cost: Resources;
  buildSeconds: number;
  workers: number;
  output?: Partial<Resources>;
  service?: "housing" | "health" | "safety" | "beauty" | "storage" | "defence";
};

export type Building = {
  id: string;
  type: BuildingType;
  plotId: number;
  level: number;
  condition: number;
  staffing: Staffing;
  status: BuildingStatus;
};

export type TimedProject = {
  kind: "build" | "upgrade" | "repair";
  targetBuildingId: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
};

export type ResearchProject = {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
};

export type ExpansionProject = {
  district: number;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
};

export type EventLogEntry = {
  id: string;
  title: string;
  detail: string;
  tone: "good" | "neutral" | "warning";
};

export type CityState = {
  version: 1;
  name: string;
  seed: number;
  foundedAt: number;
  lastSavedAt: number;
  activeSeconds: number;
  nextId: number;
  resources: Resources;
  population: number;
  buildings: Building[];
  unlockedDistricts: number[];
  construction: TimedProject | null;
  research: ResearchProject | null;
  expansion: ExpansionProject | null;
  completedResearch: string[];
  doctrine: Doctrine;
  roadLevel: number;
  wallLevel: number;
  harbourLevel: number;
  townHallLevel: number;
  pendingCrisis: CrisisType | null;
  crisisWarning: CrisisType | null;
  crisisWarningEndsAt: number | null;
  nextCrisisAt: number;
  nextMinorEventAt: number;
  tutorialDismissed: boolean;
  eventLog: EventLogEntry[];
};

const zeroResources = (): Resources => ({
  food: 0,
  timber: 0,
  stone: 0,
  coin: 0,
  goods: 0,
  knowledge: 0,
});

const cost = (values: Partial<Resources>): Resources => ({ ...zeroResources(), ...values });

export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingDefinition> = {
  house: {
    type: "house",
    name: "Courtyard house",
    shortName: "House",
    description: "A cool stone home with room for a growing household.",
    atlasIndex: 0,
    cost: cost({ timber: 60, stone: 30, coin: 40 }),
    buildSeconds: 18,
    workers: 0,
    service: "housing",
  },
  farm: {
    type: "farm",
    name: "Terraced farm",
    shortName: "Farm",
    description: "Olives, grain and vegetables for the city.",
    atlasIndex: 1,
    cost: cost({ timber: 50, stone: 10, coin: 30 }),
    buildSeconds: 16,
    workers: 5,
    output: { food: 7 },
  },
  lumber: {
    type: "lumber",
    name: "Lumber yard",
    shortName: "Lumber",
    description: "Shapes local pine into useful beams and boards.",
    atlasIndex: 2,
    cost: cost({ timber: 25, stone: 20, coin: 35 }),
    buildSeconds: 18,
    workers: 4,
    output: { timber: 6 },
  },
  quarry: {
    type: "quarry",
    name: "Limestone quarry",
    shortName: "Quarry",
    description: "Cuts pale island stone for civic works.",
    atlasIndex: 3,
    cost: cost({ timber: 40, coin: 50 }),
    buildSeconds: 22,
    workers: 6,
    output: { stone: 5 },
  },
  warehouse: {
    type: "warehouse",
    name: "Harbour warehouse",
    shortName: "Store",
    description: "Keeps grain, amphorae and building material safe.",
    atlasIndex: 4,
    cost: cost({ timber: 70, stone: 80, coin: 70 }),
    buildSeconds: 30,
    workers: 3,
    service: "storage",
  },
  workshop: {
    type: "workshop",
    name: "Artisan workshop",
    shortName: "Workshop",
    description: "Produces tools, pottery and other crafted goods.",
    atlasIndex: 5,
    cost: cost({ timber: 80, stone: 70, coin: 90, goods: 10 }),
    buildSeconds: 35,
    workers: 7,
    output: { goods: 3 },
  },
  market: {
    type: "market",
    name: "Agora market",
    shortName: "Market",
    description: "A shaded place for exchange, gossip and fresh produce.",
    atlasIndex: 6,
    cost: cost({ timber: 60, stone: 50, coin: 100, goods: 10 }),
    buildSeconds: 35,
    workers: 6,
    output: { coin: 8 },
  },
  academy: {
    type: "academy",
    name: "Civic academy",
    shortName: "Academy",
    description: "Teachers, surveyors and physicians exchange ideas here.",
    atlasIndex: 7,
    cost: cost({ timber: 90, stone: 90, coin: 120, goods: 20 }),
    buildSeconds: 45,
    workers: 8,
    output: { knowledge: 4 },
  },
  clinic: {
    type: "clinic",
    name: "Public clinic",
    shortName: "Clinic",
    description: "Clean water, trained healers and a safer neighbourhood.",
    atlasIndex: 8,
    cost: cost({ timber: 70, stone: 100, coin: 130, goods: 20 }),
    buildSeconds: 45,
    workers: 7,
    service: "health",
  },
  firewatch: {
    type: "firewatch",
    name: "Fire watch",
    shortName: "Fire watch",
    description: "Raises alarms and keeps cistern crews ready.",
    atlasIndex: 9,
    cost: cost({ timber: 90, stone: 60, coin: 90 }),
    buildSeconds: 35,
    workers: 4,
    service: "safety",
  },
  barracks: {
    type: "barracks",
    name: "Hoplite barracks",
    shortName: "Barracks",
    description: "Maintains a small stationary force to defend the polis.",
    atlasIndex: 10,
    cost: cost({ timber: 110, stone: 100, coin: 140, goods: 30 }),
    buildSeconds: 50,
    workers: 8,
    service: "defence",
  },
  park: {
    type: "park",
    name: "Fountain garden",
    shortName: "Garden",
    description: "Cypress, herbs and water make nearby homes more desirable.",
    atlasIndex: 11,
    cost: cost({ timber: 30, stone: 35, coin: 60 }),
    buildSeconds: 20,
    workers: 2,
    service: "beauty",
  },
};

export const BUILDING_ORDER = Object.keys(BUILDING_DEFINITIONS) as BuildingType[];

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  food: "Food",
  timber: "Timber",
  stone: "Stone",
  coin: "Coin",
  goods: "Goods",
  knowledge: "Knowledge",
};

export const DISTRICT_NAMES = ["Civic heart", "Olive ridge", "Harbour ward", "Sunset terraces"];

export const DISTRICT_COSTS: Resources[] = [
  cost({}),
  cost({ timber: 320, stone: 220, coin: 300 }),
  cost({ timber: 460, stone: 360, coin: 480, goods: 40 }),
  cost({ timber: 680, stone: 540, coin: 720, goods: 90 }),
];

export const RESEARCH_DEFINITIONS = [
  {
    id: "irrigation",
    label: "Irrigation",
    detail: "Farms produce 20% more food.",
    knowledge: 45,
    seconds: 55,
  },
  {
    id: "stonecraft",
    label: "Stonecraft",
    detail: "Quarries produce 20% more stone and artisan workshops become available.",
    knowledge: 60,
    seconds: 70,
  },
  {
    id: "civic-records",
    label: "Civic records",
    detail: "Markets and maritime civic policy become available.",
    knowledge: 75,
    seconds: 85,
  },
  {
    id: "public-health",
    label: "Public health",
    detail: "Clinics and civic administration become available.",
    knowledge: 90,
    seconds: 100,
  },
] as const;

export const BUILDING_RESEARCH_REQUIREMENTS: Partial<Record<BuildingType, string>> = {
  workshop: "stonecraft",
  market: "civic-records",
  clinic: "public-health",
};

export const DOCTRINE_RESEARCH_REQUIREMENTS: Partial<Record<Doctrine, string>> = {
  industrial: "stonecraft",
  maritime: "civic-records",
  civic: "public-health",
};

export const CRISIS_DEFINITIONS: Record<
  CrisisType,
  { title: string; summary: string; warning: string }
> = {
  fire: {
    title: "Dry wind, bright sparks",
    summary: "A workshop fire is jumping between awnings.",
    warning: "Fire watches and upgraded roads improve the response.",
  },
  plague: {
    title: "A fever at the harbour",
    summary: "Several sailors arrived sick and the market is uneasy.",
    warning: "Clinics, gardens and public-health research reduce harm.",
  },
  invasion: {
    title: "Sails beyond the headland",
    summary: "Raiders are testing the harbour wall and storehouses.",
    warning: "Barracks, walls and a prepared harbour protect the city.",
  },
  drought: {
    title: "The cisterns run low",
    summary: "A long dry spell is thinning crops and worrying households.",
    warning: "Farms, gardens and irrigation make the city resilient.",
  },
  unrest: {
    title: "Voices in the agora",
    summary: "Food prices and hard work have brought a tense crowd together.",
    warning: "Markets, parks and high happiness help restore calm.",
  },
  storm: {
    title: "Storm over the Aegean",
    summary: "Heavy seas and hard rain are striking the lower streets.",
    warning: "Roads, warehouses and the harbour reduce damage.",
  },
};

export const GAME_TIMING = {
  offlineCapSeconds: 8 * 60 * 60,
  minorEventMinSeconds: 20 * 60,
  minorEventMaxSeconds: 40 * 60,
  crisisWarningSeconds: 2 * 60,
  severeCrisisMinDays: 2,
  severeCrisisMaxDays: 5,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

function minorEventInterval(seed: number, eventCount: number) {
  const range = GAME_TIMING.minorEventMaxSeconds - GAME_TIMING.minorEventMinSeconds;
  return GAME_TIMING.minorEventMinSeconds + ((seed * 17 + eventCount * 97) % (range + 1));
}

function severeCrisisDelay(seed: number, eventCount: number) {
  const dayRange = GAME_TIMING.severeCrisisMaxDays - GAME_TIMING.severeCrisisMinDays + 1;
  return (GAME_TIMING.severeCrisisMinDays + ((seed + eventCount) % dayRange)) * 24 * 60 * 60 * 1000;
}

const starterBuilding = (id: string, type: BuildingType, plotId: number): Building => ({
  id,
  type,
  plotId,
  level: 1,
  condition: 100,
  staffing: 1,
  status: "active",
});

export function createCity(
  name = "Thalassa",
  seed = Math.floor(Math.random() * 999_999),
): CityState {
  const now = Date.now();
  return {
    version: 1,
    name: name.trim() || "Thalassa",
    seed,
    foundedAt: now,
    lastSavedAt: now,
    activeSeconds: 0,
    nextId: 5,
    resources: {
      food: 360,
      timber: 460,
      stone: 380,
      coin: 720,
      goods: 120,
      knowledge: 90,
    },
    population: 24,
    buildings: [
      starterBuilding("building-1", "house", 13),
      starterBuilding("building-2", "farm", 14),
      starterBuilding("building-3", "lumber", 19),
      starterBuilding("building-4", "park", 20),
    ],
    unlockedDistricts: [0],
    construction: null,
    research: null,
    expansion: null,
    completedResearch: [],
    doctrine: "balanced",
    roadLevel: 1,
    wallLevel: 0,
    harbourLevel: 1,
    townHallLevel: 1,
    pendingCrisis: null,
    crisisWarning: null,
    crisisWarningEndsAt: null,
    nextCrisisAt: now + severeCrisisDelay(seed, 0),
    nextMinorEventAt: minorEventInterval(seed, 0),
    tutorialDismissed: false,
    eventLog: [
      {
        id: "founded",
        title: "A new polis",
        detail: "Twelve plots are cleared. The first households are ready to build.",
        tone: "good",
      },
    ],
  };
}

export function canAfford(resources: Resources, price: Resources) {
  return (Object.keys(price) as ResourceKey[]).every((key) => resources[key] >= price[key]);
}

function spend(resources: Resources, price: Resources): Resources {
  if (!canAfford(resources, price)) throw new Error("Not enough resources.");
  return Object.fromEntries(
    (Object.keys(resources) as ResourceKey[]).map((key) => [
      key,
      round(resources[key] - price[key]),
    ]),
  ) as Resources;
}

function refund(resources: Resources, price: Resources, share: number): Resources {
  return Object.fromEntries(
    (Object.keys(resources) as ResourceKey[]).map((key) => [
      key,
      round(resources[key] + price[key] * share),
    ]),
  ) as Resources;
}

export function isPlotUnlocked(city: CityState, plotId: number) {
  const district = PLOT_DISTRICTS.findIndex((plots) => plots.includes(plotId));
  return district >= 0 && city.unlockedDistricts.includes(district);
}

export function placeBuilding(city: CityState, type: BuildingType, plotId: number): CityState {
  if (city.construction) throw new Error("The builders are already working.");
  if (!isPlotUnlocked(city, plotId)) throw new Error("Clear this district first.");
  if (city.buildings.some((building) => building.plotId === plotId)) {
    throw new Error("That plot is occupied.");
  }

  const definition = BUILDING_DEFINITIONS[type];
  const requirement = BUILDING_RESEARCH_REQUIREMENTS[type];
  if (requirement && !city.completedResearch.includes(requirement)) {
    throw new Error(
      `Complete ${RESEARCH_DEFINITIONS.find((research) => research.id === requirement)?.label ?? requirement} first.`,
    );
  }
  const id = `building-${city.nextId}`;
  return {
    ...city,
    nextId: city.nextId + 1,
    resources: spend(city.resources, definition.cost),
    buildings: [
      ...city.buildings,
      {
        id,
        type,
        plotId,
        level: 1,
        condition: 100,
        staffing: 1,
        status: "constructing",
      },
    ],
    construction: {
      kind: "build",
      targetBuildingId: id,
      label: `Build ${definition.shortName}`,
      totalSeconds: definition.buildSeconds,
      remainingSeconds: definition.buildSeconds,
    },
  };
}

export function queueUpgrade(city: CityState, buildingId: string): CityState {
  if (city.construction) throw new Error("The builders are already working.");
  const building = city.buildings.find((candidate) => candidate.id === buildingId);
  if (!building) throw new Error("Building not found.");
  if (building.level >= 3) throw new Error("This building is fully upgraded.");
  if (building.condition < 100) throw new Error("Repair the building before upgrading.");

  const definition = BUILDING_DEFINITIONS[building.type];
  const multiplier = building.level + 1;
  const price = Object.fromEntries(
    (Object.keys(definition.cost) as ResourceKey[]).map((key) => [
      key,
      Math.ceil(definition.cost[key] * multiplier * 0.75),
    ]),
  ) as Resources;
  const duration = Math.ceil(definition.buildSeconds * multiplier * 1.4);

  return {
    ...city,
    resources: spend(city.resources, price),
    buildings: city.buildings.map((candidate) =>
      candidate.id === buildingId ? { ...candidate, status: "upgrading" } : candidate,
    ),
    construction: {
      kind: "upgrade",
      targetBuildingId: buildingId,
      label: `Upgrade ${definition.shortName}`,
      totalSeconds: duration,
      remainingSeconds: duration,
    },
  };
}

export function queueRepair(city: CityState, buildingId: string): CityState {
  if (city.construction) throw new Error("The builders are already working.");
  const building = city.buildings.find((candidate) => candidate.id === buildingId);
  if (!building) throw new Error("Building not found.");
  if (building.condition >= 100) throw new Error("This building does not need repairs.");
  const definition = BUILDING_DEFINITIONS[building.type];
  const damageShare = 1 - building.condition / 100;
  const price = Object.fromEntries(
    (Object.keys(definition.cost) as ResourceKey[]).map((key) => [
      key,
      Math.ceil(definition.cost[key] * damageShare * 0.45),
    ]),
  ) as Resources;
  const duration = Math.max(8, Math.ceil(definition.buildSeconds * damageShare));

  return {
    ...city,
    resources: spend(city.resources, price),
    buildings: city.buildings.map((candidate) =>
      candidate.id === buildingId ? { ...candidate, status: "constructing" } : candidate,
    ),
    construction: {
      kind: "repair",
      targetBuildingId: buildingId,
      label: `Repair ${definition.shortName}`,
      totalSeconds: duration,
      remainingSeconds: duration,
    },
  };
}

export function demolishBuilding(city: CityState, buildingId: string): CityState {
  const building = city.buildings.find((candidate) => candidate.id === buildingId);
  if (!building) return city;
  if (city.construction?.targetBuildingId === buildingId) {
    throw new Error("Wait for the builders to finish.");
  }
  const definition = BUILDING_DEFINITIONS[building.type];
  return {
    ...city,
    buildings: city.buildings.filter((candidate) => candidate.id !== buildingId),
    resources: refund(city.resources, definition.cost, 0.35),
    eventLog: addLog(city, {
      title: `${definition.shortName} demolished`,
      detail: "Reusable stone and timber returned to storage.",
      tone: "neutral",
    }),
  };
}

export function moveBuilding(city: CityState, buildingId: string, plotId: number): CityState {
  if (!isPlotUnlocked(city, plotId)) throw new Error("Clear this district first.");
  if (city.buildings.some((building) => building.plotId === plotId)) {
    throw new Error("That plot is occupied.");
  }
  const price = cost({ coin: 25, timber: 10 });
  return {
    ...city,
    resources: spend(city.resources, price),
    buildings: city.buildings.map((building) =>
      building.id === buildingId ? { ...building, plotId } : building,
    ),
  };
}

export function setStaffing(city: CityState, buildingId: string, staffing: Staffing): CityState {
  return {
    ...city,
    buildings: city.buildings.map((building) =>
      building.id === buildingId ? { ...building, staffing } : building,
    ),
  };
}

export function startResearch(city: CityState, researchId: string): CityState {
  if (city.research) throw new Error("Research is already in progress.");
  if (city.completedResearch.includes(researchId)) throw new Error("Research already completed.");
  const definition = RESEARCH_DEFINITIONS.find((candidate) => candidate.id === researchId);
  if (!definition) throw new Error("Research not found.");
  const price = cost({ knowledge: definition.knowledge });
  return {
    ...city,
    resources: spend(city.resources, price),
    research: {
      id: definition.id,
      label: definition.label,
      totalSeconds: definition.seconds,
      remainingSeconds: definition.seconds,
    },
  };
}

export function startExpansion(city: CityState, district: number): CityState {
  if (district < 1 || district > 3) throw new Error("Unknown district.");
  if (city.unlockedDistricts.includes(district)) throw new Error("District already cleared.");
  if (city.expansion) throw new Error("A district is already being cleared.");
  const price = DISTRICT_COSTS[district];
  const duration = 75 + district * 45;
  return {
    ...city,
    resources: spend(city.resources, price),
    expansion: {
      district,
      label: `Clear ${DISTRICT_NAMES[district]}`,
      totalSeconds: duration,
      remainingSeconds: duration,
    },
  };
}

export function upgradeRoads(city: CityState): CityState {
  if (city.roadLevel >= 4) throw new Error("Roads are fully upgraded.");
  const level = city.roadLevel + 1;
  const price = cost({ timber: 45 * level, stone: 80 * level, coin: 90 * level });
  return { ...city, resources: spend(city.resources, price), roadLevel: level };
}

export function upgradeWalls(city: CityState): CityState {
  if (city.wallLevel >= 3) throw new Error("Walls are fully upgraded.");
  const level = city.wallLevel + 1;
  const price = cost({ timber: 60 * level, stone: 120 * level, coin: 100 * level });
  return { ...city, resources: spend(city.resources, price), wallLevel: level };
}

function productionMultiplier(city: CityState, building: Building) {
  let multiplier = 1;
  if (building.type === "farm" && city.completedResearch.includes("irrigation")) multiplier *= 1.2;
  if (building.type === "quarry" && city.completedResearch.includes("stonecraft"))
    multiplier *= 1.2;
  if (building.type === "market" && city.completedResearch.includes("civic-records")) {
    multiplier *= 1.15;
  }

  if (city.doctrine === "industrial" && ["lumber", "quarry", "workshop"].includes(building.type)) {
    multiplier *= 1.12;
  }
  if (city.doctrine === "scholarly" && building.type === "academy") multiplier *= 1.18;
  if (city.doctrine === "maritime" && ["market", "warehouse"].includes(building.type)) {
    multiplier *= 1.12;
  }
  if (city.doctrine === "pastoral" && building.type === "farm") multiplier *= 1.12;

  const trait = getPlotTrait(city.seed, building.plotId);
  if (trait === "fertile" && building.type === "farm") multiplier *= 1.15;
  if (trait === "hillside" && ["quarry", "barracks"].includes(building.type)) multiplier *= 1.15;
  if (trait === "coastal" && ["market", "warehouse"].includes(building.type)) multiplier *= 1.1;
  return multiplier;
}

function workforceFactors(city: CityState) {
  const factors = new Map<string, number>();
  let availableWorkers = Math.max(0, Math.floor(city.population * 0.6));
  const staffed = city.buildings
    .filter(
      (building) =>
        building.status === "active" &&
        building.condition > 0 &&
        BUILDING_DEFINITIONS[building.type].workers > 0 &&
        building.staffing > 0,
    )
    .sort((left, right) => right.staffing - left.staffing || left.id.localeCompare(right.id));

  for (const building of staffed) {
    const baseWorkers = BUILDING_DEFINITIONS[building.type].workers * building.level;
    const requestedWorkers = baseWorkers * building.staffing;
    const assignedWorkers = Math.min(availableWorkers, requestedWorkers);
    factors.set(building.id, baseWorkers === 0 ? 1 : assignedWorkers / baseWorkers);
    availableWorkers -= assignedWorkers;
  }
  return factors;
}

function completeConstruction(city: CityState): CityState {
  const project = city.construction;
  if (!project) return city;
  return {
    ...city,
    construction: null,
    buildings: city.buildings.map((building) => {
      if (building.id !== project.targetBuildingId) return building;
      if (project.kind === "upgrade") {
        return { ...building, level: building.level + 1, status: "active" };
      }
      if (project.kind === "repair") {
        return { ...building, condition: 100, status: "active" };
      }
      return { ...building, status: "active" };
    }),
    eventLog: addLog(city, {
      title: `${project.label} complete`,
      detail: "The builders have cleared their tools from the road.",
      tone: "good",
    }),
  };
}

function finishResearch(city: CityState): CityState {
  if (!city.research) return city;
  return {
    ...city,
    completedResearch: [...city.completedResearch, city.research.id],
    eventLog: addLog(city, {
      title: `${city.research.label} understood`,
      detail: "The academy has shared its findings across the city.",
      tone: "good",
    }),
    research: null,
  };
}

function finishExpansion(city: CityState): CityState {
  if (!city.expansion) return city;
  const district = city.expansion.district;
  const rewards = [
    cost({ timber: 140 + district * 20 }),
    cost({ stone: 120 + district * 30 }),
    cost({ coin: 180 + district * 45 }),
    cost({ goods: 35 + district * 10, knowledge: 25 }),
  ];
  const reward = rewards[(city.seed + district) % rewards.length];
  const resources = Object.fromEntries(
    (Object.keys(city.resources) as ResourceKey[]).map((key) => [
      key,
      round(city.resources[key] + reward[key]),
    ]),
  ) as Resources;
  return {
    ...city,
    expansion: null,
    resources,
    unlockedDistricts: [...city.unlockedDistricts, district].sort(),
    eventLog: addLog(city, {
      title: `${DISTRICT_NAMES[district]} cleared`,
      detail: "Surveyors found useful stores while opening eight new plots.",
      tone: "good",
    }),
  };
}

export function advanceCity(
  city: CityState,
  elapsedSeconds: number,
  speed = 1,
  allowEvents = true,
): CityState {
  const simulationSeconds = Math.max(0, elapsedSeconds * speed);
  if (simulationSeconds === 0) return city;
  const minutes = simulationSeconds / 60;
  const produced = { ...city.resources };
  const workFactors = workforceFactors(city);
  const forces = getDefenceForces(city);

  for (const building of city.buildings) {
    if (building.status !== "active" || building.condition <= 0 || building.staffing === 0)
      continue;
    const definition = BUILDING_DEFINITIONS[building.type];
    if (!definition.output) continue;
    const conditionFactor = building.condition / 100;
    const levelFactor = 1 + (building.level - 1) * 0.65;
    const factor =
      minutes *
      (workFactors.get(building.id) ?? 1) *
      conditionFactor *
      levelFactor *
      productionMultiplier(city, building);
    for (const [key, amount] of Object.entries(definition.output) as [ResourceKey, number][]) {
      produced[key] = round(produced[key] + amount * factor);
    }
  }
  produced.food = Math.max(0, produced.food - (forces.hoplites + forces.archers) * 0.02 * minutes);
  produced.coin = Math.max(0, produced.coin - forces.ships * 0.03 * minutes);

  const metrics = getCityMetrics(city);
  const housingHeadroom = metrics.housing - city.population;
  const populationGrowth =
    housingHeadroom > 0 && metrics.happiness >= 50
      ? Math.min(housingHeadroom, minutes * 0.025 * (metrics.happiness / 70))
      : 0;

  let next: CityState = {
    ...city,
    activeSeconds: city.activeSeconds + simulationSeconds,
    resources: Object.fromEntries(
      (Object.keys(produced) as ResourceKey[]).map((key) => [key, Math.min(99_999, produced[key])]),
    ) as Resources,
    population: round(city.population + populationGrowth),
    construction: city.construction
      ? {
          ...city.construction,
          remainingSeconds: Math.max(0, city.construction.remainingSeconds - simulationSeconds),
        }
      : null,
    research: city.research
      ? {
          ...city.research,
          remainingSeconds: Math.max(0, city.research.remainingSeconds - simulationSeconds),
        }
      : null,
    expansion: city.expansion
      ? {
          ...city.expansion,
          remainingSeconds: Math.max(0, city.expansion.remainingSeconds - simulationSeconds),
        }
      : null,
  };

  if (next.construction?.remainingSeconds === 0) next = completeConstruction(next);
  if (next.research?.remainingSeconds === 0) next = finishResearch(next);
  if (next.expansion?.remainingSeconds === 0) next = finishExpansion(next);
  if (
    allowEvents &&
    next.crisisWarning &&
    next.crisisWarningEndsAt !== null &&
    next.activeSeconds >= next.crisisWarningEndsAt
  ) {
    const crisis = next.crisisWarning;
    next = {
      ...next,
      pendingCrisis: crisis,
      crisisWarning: null,
      crisisWarningEndsAt: null,
      eventLog: addLog(next, {
        title: CRISIS_DEFINITIONS[crisis].title,
        detail: "The warning period has ended. Choose the city's response.",
        tone: "warning",
      }),
    };
  }
  if (
    allowEvents &&
    !next.pendingCrisis &&
    !next.crisisWarning &&
    next.activeSeconds >= next.nextMinorEventAt
  ) {
    next = applyMinorOpportunity(next);
  }
  return next;
}

export function advanceOffline(city: CityState, elapsedRealSeconds: number): CityState {
  const warningRemaining =
    city.crisisWarningEndsAt === null
      ? null
      : Math.max(0, city.crisisWarningEndsAt - city.activeSeconds);
  const advanced = advanceCity(
    city,
    Math.min(GAME_TIMING.offlineCapSeconds, Math.max(0, elapsedRealSeconds)),
    1,
    false,
  );
  return {
    ...advanced,
    crisisWarningEndsAt:
      warningRemaining === null ? null : advanced.activeSeconds + warningRemaining,
    nextMinorEventAt:
      advanced.activeSeconds + minorEventInterval(advanced.seed, advanced.eventLog.length),
  };
}

export function getCityMetrics(city: CityState) {
  const active = city.buildings.filter(
    (building) => building.status === "active" && building.condition > 0,
  );
  const levels = (type: BuildingType) =>
    active
      .filter((building) => building.type === type)
      .reduce((sum, building) => sum + building.level * (building.condition / 100), 0);
  const housing = Math.round(24 + levels("house") * 18);
  const jobs = Math.round(
    active.reduce(
      (sum, building) =>
        sum + BUILDING_DEFINITIONS[building.type].workers * building.level * building.staffing,
      0,
    ),
  );
  const neighbourhoodEffect = active
    .filter((building) => building.type === "house")
    .reduce((total, house) => {
      const neighbours = active.filter(
        (building) =>
          building.id !== house.id &&
          getPlotDistance(city.seed, house.plotId, building.plotId) <= 2,
      );
      return (
        total +
        neighbours.reduce((effect, building) => {
          if (building.type === "park") return effect + 4;
          if (building.type === "market" || building.type === "clinic") return effect + 2;
          if (["workshop", "quarry", "barracks"].includes(building.type)) return effect - 3;
          return effect;
        }, 0)
      );
    }, 0);
  const workersAvailable = Math.max(0, Math.floor(city.population * 0.6));
  const workersAssigned = Math.min(workersAvailable, jobs);
  const employment =
    workersAvailable === 0
      ? 0
      : clamp(Math.round((workersAssigned / workersAvailable) * 100), 0, 100);
  const industrialPressure = levels("workshop") * 4 + levels("quarry") * 3 + levels("barracks") * 2;
  const doctrineHappiness =
    city.doctrine === "cultural"
      ? 7
      : city.doctrine === "pastoral"
        ? 9
        : city.doctrine === "industrial"
          ? -3
          : 0;
  const happiness = clamp(
    Math.round(
      57 +
        levels("park") * 8 +
        levels("market") * 3 +
        neighbourhoodEffect +
        doctrineHappiness -
        industrialPressure,
    ),
    20,
    100,
  );
  const researchHealth = city.completedResearch.includes("public-health") ? 8 : 0;
  const safety = clamp(
    Math.round(
      42 +
        levels("clinic") * 10 +
        levels("firewatch") * 13 +
        city.roadLevel * 3 +
        researchHealth +
        (city.doctrine === "civic" ? 8 : 0),
    ),
    0,
    100,
  );
  const defence = Math.round(
    city.wallLevel * 22 +
      city.harbourLevel * 4 +
      levels("barracks") * 26 +
      (city.doctrine === "maritime" ? 8 : 0),
  );
  return {
    housing,
    jobs,
    workersAvailable,
    workersAssigned,
    employment,
    happiness,
    safety,
    defence,
  };
}

export function getDefenceForces(city: CityState) {
  const barracksLevels = city.buildings
    .filter(
      (building) =>
        building.type === "barracks" && building.status === "active" && building.condition > 0,
    )
    .reduce((sum, building) => sum + building.level, 0);
  return {
    militia: city.townHallLevel * 6,
    hoplites: barracksLevels * 8,
    archers: city.wallLevel * 4,
    ships: city.harbourLevel * 2,
  };
}

export function resolveHarbourMission(city: CityState, mission: HarbourMission): CityState {
  const definitions = {
    fishing: {
      cost: cost({ coin: 25 }),
      reward: cost({ food: 110 }),
      title: "Fishing boats return",
      detail: "The harbour crews found a generous shoal beyond the headland.",
    },
    trade: {
      cost: cost({ coin: 20, goods: 20 }),
      reward: cost({ coin: 145 }),
      title: "Trade voyage complete",
      detail: "Local pottery and tools fetched a good price on a neighbouring island.",
    },
    patrol: {
      cost: cost({ food: 50, coin: 45 }),
      reward: cost({ timber: 90, stone: 75, coin: 80 }),
      title: "Barbarian camp cleared",
      detail: "The stationary force returned safely with recovered stores.",
    },
  } satisfies Record<
    HarbourMission,
    { cost: Resources; reward: Resources; title: string; detail: string }
  >;
  if (mission === "patrol" && getCityMetrics(city).defence < 30) {
    throw new Error("Reach 30 defence before sending a patrol.");
  }
  const definition = definitions[mission];
  const afterCost = spend(city.resources, definition.cost);
  const resources = Object.fromEntries(
    (Object.keys(afterCost) as ResourceKey[]).map((key) => [
      key,
      round(afterCost[key] + definition.reward[key]),
    ]),
  ) as Resources;
  return {
    ...city,
    resources,
    eventLog: addLog(city, {
      title: definition.title,
      detail: definition.detail,
      tone: "good",
    }),
  };
}

export function triggerCrisis(city: CityState, type: CrisisType): CityState {
  return {
    ...city,
    pendingCrisis: type,
    crisisWarning: null,
    crisisWarningEndsAt: null,
  };
}

function crisisPreparedness(city: CityState, type: CrisisType) {
  const levels = (buildingType: BuildingType) =>
    city.buildings
      .filter(
        (building) =>
          building.type === buildingType && building.status === "active" && building.condition > 0,
      )
      .reduce((sum, building) => sum + building.level, 0);
  if (type === "invasion")
    return city.wallLevel * 22 + levels("barracks") * 30 + city.harbourLevel * 5;
  if (type === "fire") return levels("firewatch") * 30 + city.roadLevel * 8;
  if (type === "plague") {
    return (
      levels("clinic") * 28 +
      levels("park") * 7 +
      (city.completedResearch.includes("public-health") ? 18 : 0)
    );
  }
  if (type === "drought") {
    return (
      levels("farm") * 12 +
      levels("park") * 5 +
      (city.completedResearch.includes("irrigation") ? 20 : 0)
    );
  }
  if (type === "unrest") return getCityMetrics(city).happiness + levels("market") * 10;
  return city.roadLevel * 10 + city.harbourLevel * 10 + levels("warehouse") * 16;
}

export function resolveCrisis(
  city: CityState,
  response: "mobilise" | "spend" | "shelter",
): CityState {
  if (!city.pendingCrisis) return city;
  const type = city.pendingCrisis;
  const responseBonus = response === "mobilise" ? 25 : response === "spend" ? 18 : 0;
  const responseCost =
    response === "mobilise"
      ? cost({ food: 35, coin: 45 })
      : response === "spend"
        ? cost({ timber: 45, stone: 35, coin: 80 })
        : cost({});
  const affordableBonus = canAfford(city.resources, responseCost) ? responseBonus : 0;
  let resources = canAfford(city.resources, responseCost)
    ? spend(city.resources, responseCost)
    : city.resources;
  const preparedness = crisisPreparedness(city, type) + affordableBonus;
  let buildings = city.buildings;
  let detail: string;
  let tone: EventLogEntry["tone"];

  if (preparedness >= 65) {
    resources = {
      ...resources,
      coin: round(resources.coin + 70),
      knowledge: round(resources.knowledge + 12),
    };
    detail = "Preparation held. Damage was minor and the city learned from the response.";
    tone = "good";
  } else if (preparedness >= 35) {
    const target = buildings.find(
      (building) => building.type !== "house" && building.condition > 0,
    );
    buildings = buildings.map((building) =>
      building.id === target?.id
        ? { ...building, condition: Math.max(35, building.condition - 35), status: "damaged" }
        : building,
    );
    resources = { ...resources, coin: round(Math.max(0, resources.coin - 55)) };
    detail = "The city held, but one building needs repairs.";
    tone = "neutral";
  } else {
    const candidates = buildings.filter(
      (building) => building.type !== "house" && building.condition > 0,
    );
    const destroyed =
      candidates[(city.seed + city.eventLog.length) % Math.max(1, candidates.length)];
    const damaged = candidates.find((building) => building.id !== destroyed?.id);
    buildings = buildings.map((building) => {
      if (building.id === destroyed?.id) return { ...building, condition: 0, status: "damaged" };
      if (building.id === damaged?.id) {
        return { ...building, condition: Math.max(40, building.condition - 45), status: "damaged" };
      }
      return building;
    });
    resources = {
      ...resources,
      food: round(Math.max(0, resources.food * 0.82)),
      coin: round(Math.max(0, resources.coin * 0.78)),
      goods: round(Math.max(0, resources.goods * 0.85)),
    };
    detail = "The city survived, but raiders or damage ruined one building and depleted stores.";
    tone = "warning";
  }

  const nextCrisisAt = Date.now() + severeCrisisDelay(city.seed, city.eventLog.length);
  return {
    ...city,
    resources,
    buildings,
    pendingCrisis: null,
    crisisWarning: null,
    crisisWarningEndsAt: null,
    nextCrisisAt,
    eventLog: addLog(city, {
      title: `${CRISIS_DEFINITIONS[type].title} resolved`,
      detail,
      tone,
    }),
  };
}

export function maybeTriggerScheduledCrisis(city: CityState, now = Date.now()): CityState {
  if (city.pendingCrisis || city.crisisWarning || now < city.nextCrisisAt) return city;
  const types = Object.keys(CRISIS_DEFINITIONS) as CrisisType[];
  const crisis = types[(city.seed + city.eventLog.length) % types.length];
  return {
    ...city,
    crisisWarning: crisis,
    crisisWarningEndsAt: city.activeSeconds + GAME_TIMING.crisisWarningSeconds,
    eventLog: addLog(city, {
      title: `Warning: ${CRISIS_DEFINITIONS[crisis].title}`,
      detail: `${CRISIS_DEFINITIONS[crisis].warning} The city has time to prepare.`,
      tone: "warning",
    }),
  };
}

export function applyMinorOpportunity(city: CityState): CityState {
  const opportunities = [
    {
      title: "Merchant at the mole",
      detail: "A friendly trader paid well for local pottery.",
      reward: cost({ coin: 85 }),
    },
    {
      title: "A fine olive harvest",
      detail: "The terraces produced more than expected.",
      reward: cost({ food: 110 }),
    },
    {
      title: "Surveyor's cache",
      detail: "Old cut stone was found beside a forgotten path.",
      reward: cost({ stone: 70, knowledge: 10 }),
    },
  ];
  const opportunity = opportunities[(city.seed + city.eventLog.length) % opportunities.length];
  const resources = Object.fromEntries(
    (Object.keys(city.resources) as ResourceKey[]).map((key) => [
      key,
      round(city.resources[key] + opportunity.reward[key]),
    ]),
  ) as Resources;
  return {
    ...city,
    resources,
    nextMinorEventAt: city.activeSeconds + minorEventInterval(city.seed, city.eventLog.length + 1),
    eventLog: addLog(city, { ...opportunity, tone: "good" }),
  };
}

function addLog(city: CityState, entry: Omit<EventLogEntry, "id">): EventLogEntry[] {
  return [
    {
      id: `event-${city.nextId}-${city.eventLog.length}`,
      ...entry,
    },
    ...city.eventLog,
  ].slice(0, 8);
}

export function serializeCity(city: CityState) {
  return JSON.stringify(city, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidResources(value: unknown): value is Resources {
  return (
    isRecord(value) &&
    (Object.keys(RESOURCE_LABELS) as ResourceKey[]).every(
      (key) => isFiniteNumber(value[key]) && (value[key] as number) >= 0,
    )
  );
}

function isValidProject(value: unknown, identityKey: "targetBuildingId" | "id" | "district") {
  if (value === null) return true;
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    isFiniteNumber(value.totalSeconds) &&
    isFiniteNumber(value.remainingSeconds) &&
    (identityKey === "district"
      ? isFiniteNumber(value[identityKey])
      : typeof value[identityKey] === "string")
  );
}

export function parseCity(serialized: string): CityState {
  const value: unknown = JSON.parse(serialized);
  const buildingStatuses: BuildingStatus[] = ["constructing", "upgrading", "active", "damaged"];
  const staffingLevels: Staffing[] = [0, 0.5, 1, 1.25];
  const doctrines: Doctrine[] = [
    "balanced",
    "industrial",
    "scholarly",
    "maritime",
    "civic",
    "cultural",
    "pastoral",
  ];
  const crises = Object.keys(CRISIS_DEFINITIONS) as CrisisType[];
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.name !== "string" ||
    !isFiniteNumber(value.seed) ||
    !isFiniteNumber(value.foundedAt) ||
    !isFiniteNumber(value.lastSavedAt) ||
    !isFiniteNumber(value.activeSeconds) ||
    !isFiniteNumber(value.nextId) ||
    !isFiniteNumber(value.population) ||
    !isValidResources(value.resources) ||
    !Array.isArray(value.buildings) ||
    !value.buildings.every(
      (building) =>
        isRecord(building) &&
        typeof building.id === "string" &&
        BUILDING_ORDER.includes(building.type as BuildingType) &&
        isFiniteNumber(building.plotId) &&
        (building.plotId as number) >= 0 &&
        (building.plotId as number) < 36 &&
        isFiniteNumber(building.level) &&
        (building.level as number) >= 1 &&
        (building.level as number) <= 3 &&
        isFiniteNumber(building.condition) &&
        (building.condition as number) >= 0 &&
        (building.condition as number) <= 100 &&
        staffingLevels.includes(building.staffing as Staffing) &&
        buildingStatuses.includes(building.status as BuildingStatus),
    ) ||
    !Array.isArray(value.unlockedDistricts) ||
    !value.unlockedDistricts.every(
      (district) => Number.isInteger(district) && district >= 0 && district <= 3,
    ) ||
    !isValidProject(value.construction, "targetBuildingId") ||
    !isValidProject(value.research, "id") ||
    !isValidProject(value.expansion, "district") ||
    !Array.isArray(value.completedResearch) ||
    !value.completedResearch.every((research) => typeof research === "string") ||
    !doctrines.includes(value.doctrine as Doctrine) ||
    !isFiniteNumber(value.roadLevel) ||
    !isFiniteNumber(value.wallLevel) ||
    !isFiniteNumber(value.harbourLevel) ||
    !isFiniteNumber(value.townHallLevel) ||
    !isFiniteNumber(value.nextCrisisAt) ||
    typeof value.tutorialDismissed !== "boolean" ||
    !Array.isArray(value.eventLog) ||
    value.eventLog.length === 0 ||
    !value.eventLog.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        typeof entry.detail === "string" &&
        ["good", "neutral", "warning"].includes(String(entry.tone)),
    ) ||
    !(value.pendingCrisis === null || crises.includes(value.pendingCrisis as CrisisType)) ||
    !(
      value.crisisWarning === undefined ||
      value.crisisWarning === null ||
      crises.includes(value.crisisWarning as CrisisType)
    )
  ) {
    throw new Error("This is not a valid Aegean Polis city file.");
  }

  const city = value as unknown as CityState;
  return {
    ...city,
    crisisWarning: city.crisisWarning ?? null,
    crisisWarningEndsAt: isFiniteNumber(city.crisisWarningEndsAt) ? city.crisisWarningEndsAt : null,
    nextMinorEventAt: isFiniteNumber(city.nextMinorEventAt)
      ? city.nextMinorEventAt
      : city.activeSeconds + minorEventInterval(city.seed, city.eventLog.length),
  };
}

export function renameCity(city: CityState, name: string): CityState {
  return { ...city, name: name.trim() || city.name };
}

export function setDoctrine(city: CityState, doctrine: Doctrine): CityState {
  const requirement = DOCTRINE_RESEARCH_REQUIREMENTS[doctrine];
  if (requirement && !city.completedResearch.includes(requirement)) {
    throw new Error(
      `Complete ${RESEARCH_DEFINITIONS.find((research) => research.id === requirement)?.label ?? requirement} first.`,
    );
  }
  const price = city.doctrine === "balanced" ? cost({}) : cost({ coin: 450, knowledge: 120 });
  return { ...city, doctrine, resources: spend(city.resources, price) };
}

export function developerGrant(city: CityState, amount = 500): CityState {
  return {
    ...city,
    resources: Object.fromEntries(
      (Object.keys(city.resources) as ResourceKey[]).map((key) => [
        key,
        round(city.resources[key] + amount),
      ]),
    ) as Resources,
  };
}

export function developerDamage(city: CityState): CityState {
  const target = city.buildings.find((building) => building.condition > 0);
  if (!target) return city;
  return {
    ...city,
    buildings: city.buildings.map((building) =>
      building.id === target.id ? { ...building, condition: 45, status: "damaged" } : building,
    ),
  };
}

export function finishAllProjects(city: CityState): CityState {
  let next = city;
  if (next.construction) {
    next = completeConstruction({
      ...next,
      construction: { ...next.construction, remainingSeconds: 0 },
    });
  }
  if (next.research) {
    next = finishResearch({
      ...next,
      research: { ...next.research, remainingSeconds: 0 },
    });
  }
  if (next.expansion) {
    next = finishExpansion({
      ...next,
      expansion: { ...next.expansion, remainingSeconds: 0 },
    });
  }
  return next;
}
