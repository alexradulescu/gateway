export type PlotTrait = "plain" | "fertile" | "hillside" | "coastal";
export type NatureKind =
  | "olive-grove"
  | "cypress-grove"
  | "scrub"
  | "ruins"
  | "boulders"
  | "rocky-hill"
  | "rock-shelf"
  | "reeds";

export type AxialCoordinate = {
  q: number;
  r: number;
};

export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;

export const HEX_RADIUS = 4;
export const HEX_CELL_COUNT = 1 + 3 * HEX_RADIUS * (HEX_RADIUS + 1);

export const PLOT_DISTRICTS: number[][] = [
  [7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 21, 22],
  [0, 1, 2, 3, 4, 5, 6, 11],
  [12, 17, 18, 23, 24, 25, 30, 31],
  [26, 27, 28, 29, 32, 33, 34, 35],
];

export const HEX_DIRECTIONS: ReadonlyArray<AxialCoordinate> = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export type MapPosition = {
  x: number;
  y: number;
  depth: number;
};

type BaseMapCell = AxialCoordinate & {
  cellId: number;
  position: MapPosition;
};

export type PlotMapCell = BaseMapCell & {
  kind: "plot";
  plotId: number;
  district: number;
  trait: PlotTrait;
};

export type NatureMapCell = BaseMapCell & {
  kind: "nature";
  nature: NatureKind;
  atlasIndex: number;
  trait: PlotTrait;
};

export type LandmarkMapCell = BaseMapCell & {
  kind: "town-hall" | "harbour";
};

export type WaterMapCell = BaseMapCell & {
  kind: "water";
};

export type LandMapCell = PlotMapCell | NatureMapCell | LandmarkMapCell;
export type MapCell = LandMapCell | WaterMapCell;

export type CityMapLayout = {
  cells: MapCell[];
  landCells: LandMapCell[];
  plotCells: Map<number, PlotMapCell>;
  cellByCoordinate: Map<string, MapCell>;
  exposedEdges: Map<number, HexDirection[]>;
  townHall: LandmarkMapCell;
  harbour: LandmarkMapCell;
};

export type RoadTile = AxialCoordinate & {
  key: string;
  cellId: number;
  x: number;
  y: number;
  depth: number;
  mask: number;
  hillside: boolean;
};

const TOWN_HALL_COORDINATE = { q: 0, r: 0 } as const;
const HARBOUR_COORDINATE = { q: 1, r: 3 } as const;
const NATURE_KINDS: NatureKind[] = [
  "olive-grove",
  "cypress-grove",
  "scrub",
  "ruins",
  "boulders",
  "rocky-hill",
  "rock-shelf",
  "reeds",
];
const layoutCache = new Map<number, CityMapLayout>();

export function axialKey(coordinate: AxialCoordinate) {
  return `${coordinate.q},${coordinate.r}`;
}

export function axialNeighbours(coordinate: AxialCoordinate): AxialCoordinate[] {
  return HEX_DIRECTIONS.map((direction) => ({
    q: coordinate.q + direction.q,
    r: coordinate.r + direction.r,
  }));
}

export function axialDistance(left: AxialCoordinate, right: AxialCoordinate) {
  const q = left.q - right.q;
  const r = left.r - right.r;
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

export function exposedHexEdges(
  landCoordinates: ReadonlySet<string>,
  coordinate: AxialCoordinate,
): HexDirection[] {
  const exposed: HexDirection[] = [];
  axialNeighbours(coordinate).forEach((neighbour, direction) => {
    if (!landCoordinates.has(axialKey(neighbour))) exposed.push(direction as HexDirection);
  });
  return exposed;
}

export function getRoadDirections(mask: number): HexDirection[] {
  if (!Number.isInteger(mask) || mask < 1 || mask > 63) {
    throw new Error(`Invalid six-way road connection mask: ${mask}`);
  }
  return HEX_DIRECTIONS.map((_, direction) => direction as HexDirection).filter(
    (direction) => (mask & (1 << direction)) !== 0,
  );
}

const HEX_COORDINATES: AxialCoordinate[] = [];
for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q += 1) {
  const minimumR = Math.max(-HEX_RADIUS, -q - HEX_RADIUS);
  const maximumR = Math.min(HEX_RADIUS, -q + HEX_RADIUS);
  for (let r = minimumR; r <= maximumR; r += 1) {
    HEX_COORDINATES.push({ q, r });
  }
}
HEX_COORDINATES.sort((left, right) => left.r - right.r || left.q - right.q);

const CELL_ID_BY_COORDINATE = new Map(
  HEX_COORDINATES.map((coordinate, cellId) => [axialKey(coordinate), cellId]),
);

function cellIdAt(coordinate: AxialCoordinate) {
  return CELL_ID_BY_COORDINATE.get(axialKey(coordinate));
}

export function mapPosition(q: number, r: number): MapPosition {
  return {
    x: 660 + q * 142 + r * 71,
    y: 360 + r * 60,
    depth: (r + HEX_RADIUS) * 16 + q + HEX_RADIUS,
  };
}

function baseCell(cellId: number): BaseMapCell {
  const coordinate = HEX_COORDINATES[cellId];
  return {
    cellId,
    ...coordinate,
    position: mapPosition(coordinate.q, coordinate.r),
  };
}

function neighbourIds(cellId: number) {
  return axialNeighbours(HEX_COORDINATES[cellId])
    .map(cellIdAt)
    .filter((candidate): candidate is number => candidate !== undefined);
}

function seededValue(seed: number, salt: number) {
  let value = (seed ^ Math.imul(salt + 1, 0x45d9f3b)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296;
}

function isConnected(openCells: Set<number>) {
  const start = openCells.values().next().value as number | undefined;
  if (start === undefined) return false;
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of neighbourIds(current)) {
      if (openCells.has(next) && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return visited.size === openCells.size;
}

function waterCells(seed: number) {
  const harbourId = cellIdAt(HARBOUR_COORDINATE)!;
  const candidates = HEX_COORDINATES.reduce<number[]>((cellIds, coordinate, cellId) => {
    if (
      axialDistance(TOWN_HALL_COORDINATE, coordinate) === HEX_RADIUS &&
      cellId !== harbourId &&
      axialDistance(HARBOUR_COORDINATE, coordinate) > 1
    ) {
      cellIds.push(cellId);
    }
    return cellIds;
  }, []);

  for (let attempt = 0; attempt < 64; attempt += 1) {
    const water = new Set(
      [...candidates]
        .sort(
          (left, right) =>
            seededValue(seed + attempt * 67, left) - seededValue(seed + attempt * 67, right),
        )
        .slice(0, 5),
    );
    const land = new Set(
      Array.from({ length: HEX_CELL_COUNT }, (_, cellId) => cellId).filter(
        (cellId) => !water.has(cellId),
      ),
    );
    if (isConnected(land)) return water;
  }
  throw new Error("Could not shape a connected hex island.");
}

function obstacleCells(seed: number, water: ReadonlySet<number>) {
  const townHallId = cellIdAt(TOWN_HALL_COORDINATE)!;
  const harbourId = cellIdAt(HARBOUR_COORDINATE)!;
  const protectedCells = new Set<number>([townHallId, harbourId]);
  HEX_COORDINATES.forEach((coordinate, cellId) => {
    if (axialDistance(TOWN_HALL_COORDINATE, coordinate) <= 2) protectedCells.add(cellId);
  });
  for (const neighbour of neighbourIds(harbourId)) protectedCells.add(neighbour);

  const candidates = Array.from({ length: HEX_CELL_COUNT }, (_, cellId) => cellId).filter(
    (cellId) => !water.has(cellId) && !protectedCells.has(cellId),
  );
  for (let attempt = 0; attempt < 96; attempt += 1) {
    const obstacles = new Set(
      [...candidates]
        .sort(
          (left, right) =>
            seededValue(seed + attempt * 101, left) - seededValue(seed + attempt * 101, right),
        )
        .slice(0, 18),
    );
    const open = new Set(
      Array.from({ length: HEX_CELL_COUNT }, (_, cellId) => cellId).filter(
        (cellId) => !water.has(cellId) && !obstacles.has(cellId),
      ),
    );
    if (isConnected(open)) return obstacles;
  }

  const open = new Set(
    Array.from({ length: HEX_CELL_COUNT }, (_, cellId) => cellId).filter(
      (cellId) => !water.has(cellId),
    ),
  );
  const obstacles = new Set<number>();
  for (const cellId of [...candidates].sort(
    (left, right) => seededValue(seed, left) - seededValue(seed, right),
  )) {
    if (obstacles.size === 18) break;
    open.delete(cellId);
    if (isConnected(open)) obstacles.add(cellId);
    else open.add(cellId);
  }
  if (obstacles.size !== 18) throw new Error("Could not place natural blockers.");
  return obstacles;
}

function takeNearest(cells: number[], count: number, target: AxialCoordinate, seed: number) {
  return [...cells]
    .sort(
      (left, right) =>
        axialDistance(HEX_COORDINATES[left], target) -
          axialDistance(HEX_COORDINATES[right], target) ||
        seededValue(seed, left) - seededValue(seed, right),
    )
    .slice(0, count);
}

function takeConnected(
  cells: number[],
  count: number,
  anchors: Iterable<number>,
  target: AxialCoordinate,
  seed: number,
) {
  const available = new Set(cells);
  const connected = new Set(anchors);
  const selected: number[] = [];
  while (selected.length < count) {
    const frontier = [...available].filter((cellId) =>
      neighbourIds(cellId).some((neighbour) => connected.has(neighbour)),
    );
    const next = takeNearest(frontier, 1, target, seed + selected.length)[0];
    if (next === undefined) throw new Error("Could not create a connected city district.");
    available.delete(next);
    connected.add(next);
    selected.push(next);
  }
  return selected;
}

function traitForCell(
  seed: number,
  cellId: number,
  landCoordinates: ReadonlySet<string>,
): PlotTrait {
  const coordinate = HEX_COORDINATES[cellId];
  if (exposedHexEdges(landCoordinates, coordinate).length > 0) return "coastal";
  if (axialDistance(coordinate, { q: 2, r: -2 }) <= 2 || seededValue(seed + 71, cellId) > 0.84) {
    return "hillside";
  }
  if (axialDistance(coordinate, { q: -1, r: 1 }) <= 2 && seededValue(seed + 97, cellId) > 0.34) {
    return "fertile";
  }
  return "plain";
}

export function getMapLayout(seed: number): CityMapLayout {
  const normalizedSeed = Math.trunc(seed) || 1;
  const cached = layoutCache.get(normalizedSeed);
  if (cached) return cached;

  const water = waterCells(normalizedSeed);
  const obstacles = obstacleCells(normalizedSeed, water);
  const townHallId = cellIdAt(TOWN_HALL_COORDINATE)!;
  const harbourId = cellIdAt(HARBOUR_COORDINATE)!;
  const buildable = Array.from({ length: HEX_CELL_COUNT }, (_, cellId) => cellId).filter(
    (cellId) =>
      cellId !== townHallId && cellId !== harbourId && !water.has(cellId) && !obstacles.has(cellId),
  );
  const connectedCells = new Set([townHallId]);
  const initialCells = takeConnected(
    buildable,
    PLOT_DISTRICTS[0].length,
    connectedCells,
    TOWN_HALL_COORDINATE,
    normalizedSeed,
  );
  initialCells.forEach((cellId) => connectedCells.add(cellId));
  const initialCellSet = new Set(initialCells);
  let remaining = buildable.filter((cellId) => !initialCellSet.has(cellId));
  const ridgeCells = takeConnected(
    remaining,
    PLOT_DISTRICTS[1].length,
    connectedCells,
    { q: 2, r: -3 },
    normalizedSeed + 11,
  );
  ridgeCells.forEach((cellId) => connectedCells.add(cellId));
  const ridgeCellSet = new Set(ridgeCells);
  remaining = remaining.filter((cellId) => !ridgeCellSet.has(cellId));
  const harbourCells = takeConnected(
    remaining,
    PLOT_DISTRICTS[2].length,
    connectedCells,
    HARBOUR_COORDINATE,
    normalizedSeed + 23,
  );
  harbourCells.forEach((cellId) => connectedCells.add(cellId));
  const harbourCellSet = new Set(harbourCells);
  remaining = remaining.filter((cellId) => !harbourCellSet.has(cellId));
  const districtCells = [initialCells, ridgeCells, harbourCells, remaining];
  const plotByCell = new Map<number, { plotId: number; district: number }>();

  districtCells.forEach((cellIds, district) => {
    const sortedCells = [...cellIds].sort((left, right) => left - right);
    PLOT_DISTRICTS[district].forEach((plotId, index) => {
      plotByCell.set(sortedCells[index], { plotId, district });
    });
  });

  const landCoordinates = new Set<string>();
  HEX_COORDINATES.forEach((coordinate, cellId) => {
    if (!water.has(cellId)) landCoordinates.add(axialKey(coordinate));
  });
  const cells: MapCell[] = HEX_COORDINATES.map((_, cellId) => {
    const base = baseCell(cellId);
    if (water.has(cellId)) return { ...base, kind: "water" };
    if (cellId === townHallId) return { ...base, kind: "town-hall" };
    if (cellId === harbourId) return { ...base, kind: "harbour" };
    const plot = plotByCell.get(cellId);
    const trait = traitForCell(normalizedSeed, cellId, landCoordinates);
    if (plot) return { ...base, ...plot, kind: "plot", trait };
    const atlasIndex = Math.floor(seededValue(normalizedSeed + 37, cellId) * NATURE_KINDS.length);
    return {
      ...base,
      kind: "nature",
      nature: NATURE_KINDS[atlasIndex],
      atlasIndex,
      trait,
    };
  });

  const landCells = cells.filter((cell): cell is LandMapCell => cell.kind !== "water");
  const plotCells = new Map<number, PlotMapCell>();
  landCells.forEach((cell) => {
    if (cell.kind === "plot") plotCells.set(cell.plotId, cell);
  });
  const cellByCoordinate = new Map(cells.map((cell) => [axialKey(cell), cell]));
  const exposedEdges = new Map(
    landCells.map((cell) => [cell.cellId, exposedHexEdges(landCoordinates, cell)]),
  );
  const layout: CityMapLayout = {
    cells,
    landCells,
    plotCells,
    cellByCoordinate,
    exposedEdges,
    townHall: landCells.find((cell): cell is LandmarkMapCell => cell.kind === "town-hall")!,
    harbour: landCells.find((cell): cell is LandmarkMapCell => cell.kind === "harbour")!,
  };
  if (layoutCache.size >= 24) layoutCache.delete(layoutCache.keys().next().value!);
  layoutCache.set(normalizedSeed, layout);
  return layout;
}

export function getPlotTrait(seed: number, plotId: number): PlotTrait {
  return getMapLayout(seed).plotCells.get(plotId)?.trait ?? "plain";
}

export function getPlotDistance(seed: number, leftPlotId: number, rightPlotId: number) {
  const layout = getMapLayout(seed);
  const left = layout.plotCells.get(leftPlotId);
  const right = layout.plotCells.get(rightPlotId);
  if (!left || !right) return Number.POSITIVE_INFINITY;
  return axialDistance(left, right);
}

function findRoadPath(layout: CityMapLayout, fromCellId: number, passable: Set<number>) {
  const queue = [fromCellId];
  const previous = new Map<number, number | null>([[fromCellId, null]]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === layout.townHall.cellId) break;
    for (const coordinate of axialNeighbours(layout.cells[current])) {
      const next = layout.cellByCoordinate.get(axialKey(coordinate));
      if (next && passable.has(next.cellId) && !previous.has(next.cellId)) {
        previous.set(next.cellId, current);
        queue.push(next.cellId);
      }
    }
  }
  if (!previous.has(layout.townHall.cellId)) return [];
  const path = [layout.townHall.cellId];
  let current = layout.townHall.cellId;
  while (current !== fromCellId) {
    current = previous.get(current)!;
    path.push(current);
  }
  return path.reverse();
}

function getRoadEdges(seed: number, occupiedPlotIds: number[], _unlockedDistricts: number[]) {
  const layout = getMapLayout(seed);
  const passable = new Set<number>([layout.townHall.cellId, layout.harbour.cellId]);
  for (const cell of layout.plotCells.values()) passable.add(cell.cellId);
  const edges = new Map<string, [number, number]>();
  for (const plotId of occupiedPlotIds) {
    const cell = layout.plotCells.get(plotId);
    if (!cell) continue;
    const path = findRoadPath(layout, cell.cellId, passable);
    for (let index = 1; index < path.length; index += 1) {
      const left = Math.min(path[index - 1], path[index]);
      const right = Math.max(path[index - 1], path[index]);
      edges.set(`${left}-${right}`, [left, right]);
    }
  }
  return edges;
}

export function getRoadTiles(
  seed: number,
  occupiedPlotIds: number[],
  unlockedDistricts: number[],
): RoadTile[] {
  const layout = getMapLayout(seed);
  const connections = new Map<number, number>();
  const connect = (cellId: number, direction: HexDirection) => {
    connections.set(cellId, (connections.get(cellId) ?? 0) | (1 << direction));
  };

  for (const [fromId, toId] of getRoadEdges(seed, occupiedPlotIds, unlockedDistricts).values()) {
    const from = layout.cells[fromId];
    const to = layout.cells[toId];
    const direction = HEX_DIRECTIONS.findIndex(
      (candidate) => from.q + candidate.q === to.q && from.r + candidate.r === to.r,
    ) as HexDirection;
    if (direction < 0) throw new Error("Road edge does not join neighbouring hexes.");
    connect(fromId, direction);
    connect(toId, ((direction + 3) % 6) as HexDirection);
  }

  return [...connections.entries()].map(([cellId, mask]) => {
    const cell = layout.cells[cellId];
    const hillside = "trait" in cell && cell.trait === "hillside";
    return {
      key: `road-${cellId}`,
      cellId,
      q: cell.q,
      r: cell.r,
      x: cell.position.x,
      y: cell.position.y,
      depth: cell.position.depth,
      mask,
      hillside,
    };
  });
}
