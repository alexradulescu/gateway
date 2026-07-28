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

export const MAP_COLUMNS = 8;
export const MAP_ROWS = 7;
export const MAP_CELL_COUNT = MAP_COLUMNS * MAP_ROWS;

export const PLOT_DISTRICTS: number[][] = [
  [7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 21, 22],
  [0, 1, 2, 3, 4, 5, 6, 11],
  [12, 17, 18, 23, 24, 25, 30, 31],
  [26, 27, 28, 29, 32, 33, 34, 35],
];

export type MapPosition = {
  x: number;
  y: number;
  depth: number;
};

type BaseMapCell = {
  cellId: number;
  row: number;
  column: number;
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

export type MapCell = PlotMapCell | NatureMapCell | LandmarkMapCell;

export type CityMapLayout = {
  cells: MapCell[];
  plotCells: Map<number, PlotMapCell>;
  townHall: LandmarkMapCell;
  harbour: LandmarkMapCell;
};

export type RoadSegment = {
  key: string;
  x: number;
  y: number;
  width: number;
  angle: number;
  depth: number;
};

export type RoadTile = {
  key: string;
  x: number;
  y: number;
  depth: number;
  atlas: "roads" | "connectors";
  atlasColumn: 0 | 1 | 2 | 3 | 4;
  orientation: "none" | "flip-x" | "flip-y" | "flip-both";
};

export type RoadTileVariant = Pick<RoadTile, "atlas" | "atlasColumn" | "orientation">;

const TOWN_HALL_CELL = 27;
const HARBOUR_CELL = 52;
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

function gridPoint(cellId: number) {
  return {
    row: Math.floor(cellId / MAP_COLUMNS),
    column: cellId % MAP_COLUMNS,
  };
}

export function mapPosition(row: number, column: number): MapPosition {
  return {
    x: 660 + (column - row) * 82,
    y: 72 + (column + row) * 41,
    depth: row + column,
  };
}

function neighbours(cellId: number) {
  const { row, column } = gridPoint(cellId);
  const result: number[] = [];
  if (row > 0) result.push(cellId - MAP_COLUMNS);
  if (row < MAP_ROWS - 1) result.push(cellId + MAP_COLUMNS);
  if (column > 0) result.push(cellId - 1);
  if (column < MAP_COLUMNS - 1) result.push(cellId + 1);
  return result;
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
    for (const next of neighbours(current)) {
      if (openCells.has(next) && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return visited.size === openCells.size;
}

function obstacleCells(seed: number) {
  const town = gridPoint(TOWN_HALL_CELL);
  const protectedCells = new Set<number>([TOWN_HALL_CELL, HARBOUR_CELL]);
  for (let cellId = 0; cellId < MAP_CELL_COUNT; cellId += 1) {
    const cell = gridPoint(cellId);
    if (Math.abs(cell.row - town.row) + Math.abs(cell.column - town.column) <= 2) {
      protectedCells.add(cellId);
    }
  }
  for (const neighbour of neighbours(HARBOUR_CELL)) protectedCells.add(neighbour);

  const candidates = Array.from({ length: MAP_CELL_COUNT }, (_, cellId) => cellId).filter(
    (cellId) => !protectedCells.has(cellId),
  );
  for (let attempt = 0; attempt < 48; attempt += 1) {
    const shuffled = [...candidates].sort(
      (left, right) =>
        seededValue(seed + attempt * 101, left) - seededValue(seed + attempt * 101, right),
    );
    const obstacles = new Set(shuffled.slice(0, 18));
    const open = new Set(
      Array.from({ length: MAP_CELL_COUNT }, (_, cellId) => cellId).filter(
        (cellId) => !obstacles.has(cellId),
      ),
    );
    if (isConnected(open)) return obstacles;
  }

  return new Set([0, 1, 6, 7, 8, 15, 16, 21, 30, 35, 40, 47, 48, 49, 50, 54, 55, 23]);
}

function distanceTo(cellId: number, row: number, column: number) {
  const cell = gridPoint(cellId);
  return Math.abs(cell.row - row) + Math.abs(cell.column - column);
}

function takeNearest(cells: number[], count: number, row: number, column: number, seed: number) {
  return [...cells]
    .sort(
      (left, right) =>
        distanceTo(left, row, column) - distanceTo(right, row, column) ||
        seededValue(seed, left) - seededValue(seed, right),
    )
    .slice(0, count);
}

function takeConnected(
  cells: number[],
  count: number,
  anchors: Iterable<number>,
  targetRow: number,
  targetColumn: number,
  seed: number,
) {
  const available = new Set(cells);
  const connected = new Set(anchors);
  const selected: number[] = [];
  while (selected.length < count) {
    const frontier = [...available].filter((cellId) =>
      neighbours(cellId).some((neighbour) => connected.has(neighbour)),
    );
    const next = takeNearest(frontier, 1, targetRow, targetColumn, seed + selected.length)[0];
    if (next === undefined) {
      throw new Error("Could not create a connected city district.");
    }
    available.delete(next);
    connected.add(next);
    selected.push(next);
  }
  return selected;
}

function traitForCell(seed: number, cellId: number): PlotTrait {
  const { row, column } = gridPoint(cellId);
  if (row >= 5 || column === 0 || column === MAP_COLUMNS - 1) return "coastal";
  if (row <= 1 || column >= 6) return "hillside";
  if (row >= 2 && row <= 4 && seededValue(seed + 71, cellId) > 0.48) return "fertile";
  return "plain";
}

function baseCell(cellId: number): BaseMapCell {
  const { row, column } = gridPoint(cellId);
  return { cellId, row, column, position: mapPosition(row, column) };
}

export function getMapLayout(seed: number): CityMapLayout {
  const normalizedSeed = Math.trunc(seed) || 1;
  const cached = layoutCache.get(normalizedSeed);
  if (cached) return cached;

  const obstacles = obstacleCells(normalizedSeed);
  const buildable = Array.from({ length: MAP_CELL_COUNT }, (_, cellId) => cellId).filter(
    (cellId) => cellId !== TOWN_HALL_CELL && cellId !== HARBOUR_CELL && !obstacles.has(cellId),
  );
  const town = gridPoint(TOWN_HALL_CELL);
  const connectedCells = new Set([TOWN_HALL_CELL]);
  const initialCells = takeConnected(
    buildable,
    PLOT_DISTRICTS[0].length,
    connectedCells,
    town.row,
    town.column,
    normalizedSeed,
  );
  initialCells.forEach((cellId) => connectedCells.add(cellId));
  const initialCellSet = new Set(initialCells);
  let remaining = buildable.filter((cellId) => !initialCellSet.has(cellId));
  const ridgeCells = takeConnected(
    remaining,
    PLOT_DISTRICTS[1].length,
    connectedCells,
    1,
    5,
    normalizedSeed + 11,
  );
  ridgeCells.forEach((cellId) => connectedCells.add(cellId));
  const ridgeCellSet = new Set(ridgeCells);
  remaining = remaining.filter((cellId) => !ridgeCellSet.has(cellId));
  const harbourCells = takeConnected(
    remaining,
    PLOT_DISTRICTS[2].length,
    connectedCells,
    5,
    6,
    normalizedSeed + 23,
  );
  harbourCells.forEach((cellId) => connectedCells.add(cellId));
  const harbourCellSet = new Set(harbourCells);
  remaining = remaining.filter((cellId) => !harbourCellSet.has(cellId));
  const sunsetCells = remaining;
  const districtCells = [initialCells, ridgeCells, harbourCells, sunsetCells];
  const plotByCell = new Map<number, { plotId: number; district: number }>();

  districtCells.forEach((cellIds, district) => {
    const sortedCells = [...cellIds].sort((left, right) => left - right);
    PLOT_DISTRICTS[district].forEach((plotId, index) => {
      plotByCell.set(sortedCells[index], { plotId, district });
    });
  });

  const cells: MapCell[] = Array.from({ length: MAP_CELL_COUNT }, (_, cellId) => {
    const base = baseCell(cellId);
    if (cellId === TOWN_HALL_CELL) return { ...base, kind: "town-hall" };
    if (cellId === HARBOUR_CELL) return { ...base, kind: "harbour" };
    const plot = plotByCell.get(cellId);
    if (plot) {
      return {
        ...base,
        ...plot,
        kind: "plot",
        trait: traitForCell(normalizedSeed, cellId),
      };
    }
    const atlasIndex = Math.floor(seededValue(normalizedSeed + 37, cellId) * NATURE_KINDS.length);
    return {
      ...base,
      kind: "nature",
      nature: NATURE_KINDS[atlasIndex],
      atlasIndex,
      trait: traitForCell(normalizedSeed, cellId),
    };
  });

  const plotCells = new Map(
    cells
      .filter((cell): cell is PlotMapCell => cell.kind === "plot")
      .map((cell) => [cell.plotId, cell]),
  );
  const layout: CityMapLayout = {
    cells,
    plotCells,
    townHall: cells.find((cell): cell is LandmarkMapCell => cell.kind === "town-hall")!,
    harbour: cells.find((cell): cell is LandmarkMapCell => cell.kind === "harbour")!,
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
  return Math.abs(left.row - right.row) + Math.abs(left.column - right.column);
}

function findRoadPath(layout: CityMapLayout, fromCellId: number, passable: Set<number>) {
  const queue = [fromCellId];
  const previous = new Map<number, number | null>([[fromCellId, null]]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === layout.townHall.cellId) break;
    for (const next of neighbours(current)) {
      if (passable.has(next) && !previous.has(next)) {
        previous.set(next, current);
        queue.push(next);
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
  for (const cell of layout.plotCells.values()) {
    passable.add(cell.cellId);
  }
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

export function getRoadSegments(
  seed: number,
  occupiedPlotIds: number[],
  unlockedDistricts: number[],
): RoadSegment[] {
  const edges = getRoadEdges(seed, occupiedPlotIds, unlockedDistricts);
  return [...edges.entries()].map(([key, [fromId, toId]]) => {
    const from = baseCell(fromId);
    const to = baseCell(toId);
    const deltaX = to.position.x - from.position.x;
    const deltaY = to.position.y - from.position.y;
    return {
      key,
      x: from.position.x,
      y: from.position.y,
      width: Math.hypot(deltaX, deltaY),
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
      depth: Math.min(from.position.depth, to.position.depth),
    };
  });
}

export function getRoadTiles(
  seed: number,
  occupiedPlotIds: number[],
  unlockedDistricts: number[],
): RoadTile[] {
  const layout = getMapLayout(seed);
  const edges = getRoadEdges(seed, occupiedPlotIds, unlockedDistricts);
  const connections = new Map<number, number>();
  const connect = (cellId: number, direction: number) => {
    connections.set(cellId, (connections.get(cellId) ?? 0) | direction);
  };

  for (const [fromId, toId] of edges.values()) {
    if (toId - fromId === 1) {
      connect(fromId, 2);
      connect(toId, 8);
    } else {
      connect(fromId, 4);
      connect(toId, 1);
    }
  }

  return [...connections.entries()].map(([cellId, mask]) => {
    const position = baseCell(cellId).position;
    const cell = layout.cells[cellId];
    const hillside = cell && "trait" in cell && cell.trait === "hillside";
    const variant = getRoadTileVariant(mask, hillside);

    return {
      key: `road-${cellId}`,
      x: position.x,
      y: position.y,
      depth: position.depth,
      ...variant,
    };
  });
}

export function getRoadTileVariant(mask: number, hillside: boolean): RoadTileVariant {
  const branchCount = [1, 2, 4, 8].filter((direction) => (mask & direction) !== 0).length;
  if (mask < 1 || mask > 15 || branchCount === 0) {
    throw new Error(`Invalid road connection mask: ${mask}`);
  }
  if (branchCount === 1) {
    return {
      atlas: "connectors",
      atlasColumn: (mask & 5) !== 0 ? 0 : 1,
      orientation: mask === 4 || mask === 8 ? "flip-both" : "none",
    };
  }
  if (branchCount === 2 && (mask === 5 || mask === 10)) {
    return hillside
      ? {
          atlas: "connectors",
          atlasColumn: 4,
          orientation: mask === 10 ? "flip-x" : "none",
        }
      : { atlas: "roads", atlasColumn: mask === 5 ? 0 : 1, orientation: "none" };
  }
  if (branchCount === 2) {
    return mask === 9 || mask === 6
      ? {
          atlas: "connectors",
          atlasColumn: 2,
          orientation: mask === 6 ? "flip-both" : "none",
        }
      : {
          atlas: "roads",
          atlasColumn: 2,
          orientation: mask === 12 ? "flip-both" : "none",
        };
  }
  if (branchCount === 3) {
    return {
      atlas: "connectors",
      atlasColumn: 3,
      orientation:
        mask === 14 ? "none" : mask === 7 ? "flip-x" : mask === 13 ? "flip-y" : "flip-both",
    };
  }
  return { atlas: "roads", atlasColumn: 4, orientation: "none" };
}
