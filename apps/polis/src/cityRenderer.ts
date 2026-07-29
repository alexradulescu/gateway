import { BUILDING_DEFINITIONS, isPlotUnlocked, type BuildingType, type CityState } from "./game";
import {
  HEX_DIRECTIONS,
  getRoadDirections,
  mapPosition,
  type CityMapLayout,
  type HexDirection,
  type LandMapCell,
  type PlotTrait,
  type RoadTile,
} from "./map";
import {
  CITY_WORLD_CENTER,
  HEX_SIZE,
  hexCorners,
  hexEdge,
  hexEdgeMidpoint,
  type WorldPoint,
} from "./hexGeometry";
import {
  buildingSpriteRect,
  worldToScreen,
  type CanvasCamera,
  type ViewportSize,
} from "./canvasMap";

export type AtlasName = "buildings1" | "buildings2" | "buildings3" | "environment" | "details";

export type CityAtlases = Record<AtlasName, HTMLImageElement>;

export const ATLAS_URLS: Record<AtlasName, string> = {
  buildings1: "/polis/assets/buildings-atlas.png",
  buildings2: "/polis/assets/buildings-atlas-level-2.png",
  buildings3: "/polis/assets/buildings-atlas-level-3.png",
  environment: "/polis/assets/environment-atlas.png",
  details: "/polis/assets/map-details-atlas.png",
};

type RenderOptions = {
  context: CanvasRenderingContext2D;
  atlases: CityAtlases;
  city: CityState;
  layout: CityMapLayout;
  roadTiles: RoadTile[];
  camera: CanvasCamera;
  viewport: ViewportSize;
  hoveredCellId: number | null;
  selectedBuildingId: string | null;
  placementActive: boolean;
};

type Drawable = {
  anchorX: number;
  anchorY: number;
  layer: number;
  stableId: number;
  draw: () => void;
};

const TERRAIN_PALETTES: Record<PlotTrait, readonly [string, string, string]> = {
  plain: ["#d5ba75", "#b89452", "#8f703d"],
  fertile: ["#a9b66c", "#7f9451", "#556d3c"],
  hillside: ["#b59a70", "#897151", "#604e3b"],
  coastal: ["#dec98f", "#c2a76a", "#8d774d"],
};

const ROAD_STYLES = [
  { outer: "#7c5a32", inner: "#a8783c", width: 18 },
  { outer: "#6e5c45", inner: "#b8a783", width: 22 },
  { outer: "#594b3b", inner: "#d2c39c", width: 27 },
  { outer: "#4f4639", inner: "#dfd4b7", width: 31 },
] as const;

function seeded(seed: number, salt: number) {
  let value = (seed ^ Math.imul(salt + 1, 0x45d9f3b)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296;
}

function tracePolygon(context: CanvasRenderingContext2D, points: WorldPoint[]) {
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
}

function traceHex(context: CanvasRenderingContext2D, center: WorldPoint, inset = 0) {
  tracePolygon(context, hexCorners(center, inset));
}

function drawAtlasCell(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  index: number,
  columns: number,
  rows: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceWidth = image.naturalWidth / columns;
  const sourceHeight = image.naturalHeight / rows;
  const column = index % columns;
  const row = Math.floor(index / columns);
  context.drawImage(
    image,
    column * sourceWidth,
    row * sourceHeight,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function drawTerrainTexture(
  context: CanvasRenderingContext2D,
  cell: LandMapCell,
  trait: PlotTrait,
  seed: number,
) {
  const { x, y } = cell.position;
  context.save();
  traceHex(context, cell.position, 1);
  context.clip();

  if (trait === "fertile") {
    context.strokeStyle = "rgba(70, 91, 43, .30)";
    context.lineWidth = 2;
    for (let line = -4; line <= 4; line += 1) {
      context.beginPath();
      context.moveTo(x - 72, y + line * 12 - 12);
      context.bezierCurveTo(
        x - 25,
        y + line * 12 - 20,
        x + 25,
        y + line * 12 + 4,
        x + 72,
        y + line * 12 - 5,
      );
      context.stroke();
    }
  } else if (trait === "hillside") {
    context.strokeStyle = "rgba(79, 59, 40, .28)";
    context.lineWidth = 2.2;
    for (let line = -2; line <= 2; line += 1) {
      context.beginPath();
      context.ellipse(
        x + line * 4,
        y + line * 13,
        62 - Math.abs(line) * 5,
        24,
        -0.12,
        0.15,
        Math.PI * 0.86,
      );
      context.stroke();
    }
  } else if (trait === "coastal") {
    context.strokeStyle = "rgba(255, 244, 190, .30)";
    context.lineWidth = 3;
    context.setLineDash([2, 8]);
    context.beginPath();
    context.arc(x, y + 10, 60, 0.2, Math.PI - 0.2);
    context.stroke();
  }

  const markCount = trait === "plain" ? 15 : 10;
  for (let mark = 0; mark < markCount; mark += 1) {
    const angle = seeded(seed + cell.cellId * 31, mark * 2) * Math.PI * 2;
    const radius = Math.sqrt(seeded(seed + cell.cellId * 47, mark * 2 + 1)) * HEX_SIZE * 0.72;
    const markX = x + Math.cos(angle) * radius;
    const markY = y + Math.sin(angle) * radius;
    const size = 1.2 + seeded(seed + 211, cell.cellId * 17 + mark) * 2.3;
    context.fillStyle = mark % 3 === 0 ? "rgba(71, 73, 39, .27)" : "rgba(255, 237, 172, .23)";
    context.beginPath();
    context.ellipse(markX, markY, size * 1.5, size, angle, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawGroundCell(
  context: CanvasRenderingContext2D,
  cell: LandMapCell,
  trait: PlotTrait,
  seed: number,
) {
  const palette = TERRAIN_PALETTES[trait];
  const gradient = context.createLinearGradient(
    cell.position.x - HEX_SIZE,
    cell.position.y - HEX_SIZE,
    cell.position.x + HEX_SIZE,
    cell.position.y + HEX_SIZE,
  );
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.6, palette[1]);
  gradient.addColorStop(1, palette[2]);
  traceHex(context, cell.position);
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = palette[1];
  context.lineWidth = 1.4;
  context.stroke();
  drawTerrainTexture(context, cell, trait, seed);
  traceHex(context, cell.position, 2.5);
  context.strokeStyle = "rgba(255, 239, 188, .17)";
  context.lineWidth = 1;
  context.stroke();
}

function drawCliffFace(
  context: CanvasRenderingContext2D,
  center: WorldPoint,
  direction: HexDirection,
  variation: number,
) {
  const [start, end] = hexEdge(center, direction);
  const drop = 14 + variation * 2;
  tracePolygon(context, [
    start,
    end,
    { x: end.x, y: end.y + drop },
    { x: start.x, y: start.y + drop },
  ]);
  const gradient = context.createLinearGradient(
    0,
    Math.min(start.y, end.y),
    0,
    Math.max(start.y, end.y) + drop,
  );
  gradient.addColorStop(0, "#8d764f");
  gradient.addColorStop(1, "#4b493d");
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = "rgba(49, 42, 31, .32)";
  context.lineWidth = 1;
  context.stroke();
}

function drawCoastEdge(
  context: CanvasRenderingContext2D,
  center: WorldPoint,
  direction: HexDirection,
  variation: number,
) {
  const [start, end] = hexEdge(center, direction, 0.4);
  context.save();
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = "rgba(29, 92, 103, .72)";
  context.lineWidth = 8;
  context.stroke();
  context.strokeStyle = "#d8c28c";
  context.lineWidth = 5.5;
  context.stroke();
  context.strokeStyle = "rgba(225, 249, 226, .78)";
  context.lineWidth = 1.5;
  context.setLineDash([5 + variation, 4]);
  context.stroke();
  context.restore();
}

function strokeRoadArm(
  context: CanvasRenderingContext2D,
  center: WorldPoint,
  end: WorldPoint,
  level: number,
) {
  const style = ROAD_STYLES[Math.max(0, Math.min(3, level - 1))];
  context.save();
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(center.x, center.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = style.outer;
  context.lineWidth = style.width + 5;
  context.stroke();
  context.strokeStyle = style.inner;
  context.lineWidth = style.width;
  context.stroke();
  if (level >= 2) {
    context.strokeStyle = level >= 3 ? "rgba(91, 78, 58, .48)" : "rgba(86, 71, 48, .30)";
    context.lineWidth = 1.5;
    context.setLineDash(level >= 3 ? [3, 6] : [2, 9]);
    context.stroke();
  }
  context.restore();
}

function drawRoad(context: CanvasRenderingContext2D, tile: RoadTile, level: number) {
  const center = { x: tile.x, y: tile.y };
  const directions = getRoadDirections(tile.mask);
  for (const direction of directions) {
    strokeRoadArm(context, center, hexEdgeMidpoint(center, direction, 1), level);
  }
  const style = ROAD_STYLES[Math.max(0, Math.min(3, level - 1))];
  context.beginPath();
  context.arc(tile.x, tile.y, style.width * 0.62, 0, Math.PI * 2);
  context.fillStyle = style.inner;
  context.fill();
  if (level >= 3 && directions.length >= 3) {
    context.beginPath();
    context.arc(tile.x, tile.y, style.width * 0.35, 0, Math.PI * 2);
    context.strokeStyle = "rgba(83, 70, 52, .48)";
    context.lineWidth = 2;
    context.stroke();
  }
  if (level >= 4) {
    for (const direction of directions) {
      const end = hexEdgeMidpoint(center, direction, 18);
      const dx = end.x - center.x;
      const dy = end.y - center.y;
      const length = Math.hypot(dx, dy);
      const normal = { x: -dy / length, y: dx / length };
      for (const side of [-1, 1]) {
        const treeX = center.x + dx * 0.64 + normal.x * side * (style.width / 2 + 8);
        const treeY = center.y + dy * 0.64 + normal.y * side * (style.width / 2 + 8);
        context.beginPath();
        context.arc(treeX, treeY, 4.5, 0, Math.PI * 2);
        context.fillStyle = "#46633b";
        context.fill();
        context.beginPath();
        context.arc(treeX - 1, treeY - 1.5, 2.2, 0, Math.PI * 2);
        context.fillStyle = "#809450";
        context.fill();
      }
    }
  }
}

function drawBuilding(
  context: CanvasRenderingContext2D,
  atlases: CityAtlases,
  type: BuildingType,
  level: number,
  position: WorldPoint,
  options: { selected?: boolean; damaged?: boolean; constructing?: boolean } = {},
) {
  const bounds = buildingSpriteRect(position, level);
  context.save();
  if (options.selected) {
    context.beginPath();
    context.ellipse(
      position.x,
      position.y - 5,
      HEX_SIZE * 0.53,
      HEX_SIZE * 0.19,
      0,
      0,
      Math.PI * 2,
    );
    context.fillStyle = "rgba(255, 229, 137, .38)";
    context.shadowColor = "#ffe49b";
    context.shadowBlur = 18;
    context.fill();
  }
  if (options.damaged) context.filter = "grayscale(.62) sepia(.2) brightness(.72)";
  if (options.constructing) context.globalAlpha = 0.62;
  context.shadowColor = "rgba(45, 31, 17, .42)";
  context.shadowBlur = 8;
  context.shadowOffsetY = 7;
  const atlas = atlases[`buildings${Math.min(3, Math.max(1, level))}` as AtlasName];
  drawAtlasCell(
    context,
    atlas,
    BUILDING_DEFINITIONS[type].atlasIndex,
    4,
    3,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
  );
  context.restore();

  if (options.damaged || options.constructing) {
    const label = options.constructing ? "BUILDING" : "REPAIR";
    context.save();
    context.font = "700 9px Avenir Next, sans-serif";
    context.textAlign = "center";
    context.fillStyle = options.constructing ? "#8a5a2d" : "#a53f2d";
    context.fillRect(position.x - 26, position.y - 27, 52, 16);
    context.fillStyle = "#fff4df";
    context.fillText(label, position.x, position.y - 15);
    context.restore();
  }
}

function drawLabel(context: CanvasRenderingContext2D, label: string, x: number, y: number) {
  context.save();
  context.font = "700 12px Palatino, Georgia, serif";
  const width = context.measureText(label).width + 16;
  context.fillStyle = "rgba(248, 239, 214, .95)";
  context.strokeStyle = "rgba(80, 54, 28, .36)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(x - width / 2, y - 15, width, 22, 5);
  context.fill();
  context.stroke();
  context.fillStyle = "#43311d";
  context.textAlign = "center";
  context.fillText(label, x, y + 1);
  context.restore();
}

function drawLock(context: CanvasRenderingContext2D, x: number, y: number) {
  context.save();
  context.fillStyle = "rgba(35, 48, 34, .58)";
  context.beginPath();
  context.arc(x, y, 17, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#f0e6c9";
  context.lineWidth = 2;
  context.strokeRect(x - 6, y - 1, 12, 10);
  context.beginPath();
  context.arc(x, y - 1, 5, Math.PI, 0);
  context.stroke();
  context.restore();
}

function drawWallSegment(
  context: CanvasRenderingContext2D,
  center: WorldPoint,
  direction: HexDirection,
  wallLevel: number,
) {
  const [start, end] = hexEdge(center, direction, 3);
  const rise = 7 + wallLevel * 2;
  context.save();
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(start.x, start.y + 4);
  context.lineTo(end.x, end.y + 4);
  context.strokeStyle = "rgba(49, 39, 27, .48)";
  context.lineWidth = 12 + wallLevel;
  context.stroke();
  context.beginPath();
  context.moveTo(start.x, start.y - rise);
  context.lineTo(end.x, end.y - rise);
  context.strokeStyle = wallLevel >= 2 ? "#c8b690" : "#ad9a75";
  context.lineWidth = 10 + wallLevel;
  context.stroke();
  context.strokeStyle = "#ece0bd";
  context.lineWidth = 2.5;
  context.stroke();
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const count = Math.max(3, Math.round(length / 17));
  context.strokeStyle = "rgba(89, 72, 50, .42)";
  context.lineWidth = 1;
  for (let index = 1; index < count; index += 1) {
    const x = start.x + (dx * index) / count;
    const y = start.y + (dy * index) / count - rise;
    context.beginPath();
    context.moveTo(x - (dy / length) * 5, y + (dx / length) * 5);
    context.lineTo(x + (dy / length) * 5, y - (dx / length) * 5);
    context.stroke();
  }
  context.restore();
}

function drawHarbourPier(context: CanvasRenderingContext2D, layout: CityMapLayout) {
  const directions = layout.exposedEdges.get(layout.harbour.cellId) ?? [];
  const direction =
    directions.find((candidate) => candidate === 4 || candidate === 5) ?? directions[0];
  if (direction === undefined) return;
  const start = layout.harbour.position;
  const edge = hexEdgeMidpoint(start, direction);
  const dx = edge.x - start.x;
  const dy = edge.y - start.y;
  const length = Math.hypot(dx, dy);
  const unit = { x: dx / length, y: dy / length };
  context.save();
  context.lineCap = "butt";
  context.beginPath();
  context.moveTo(edge.x - unit.x * 7, edge.y - unit.y * 7);
  context.lineTo(edge.x + unit.x * 54, edge.y + unit.y * 54);
  context.strokeStyle = "#4b3625";
  context.lineWidth = 30;
  context.stroke();
  context.strokeStyle = "#91663d";
  context.lineWidth = 25;
  context.stroke();
  context.strokeStyle = "rgba(227, 180, 112, .45)";
  context.lineWidth = 2;
  context.setLineDash([3, 9]);
  context.stroke();
  context.restore();
}

function drawableSort(left: Drawable, right: Drawable) {
  return (
    left.anchorY - right.anchorY ||
    left.anchorX - right.anchorX ||
    left.layer - right.layer ||
    left.stableId - right.stableId
  );
}

function traitFor(cell: LandMapCell): PlotTrait {
  if (cell.kind === "plot" || cell.kind === "nature") return cell.trait;
  return cell.kind === "harbour" ? "coastal" : "plain";
}

export function renderCityMap({
  context,
  atlases,
  city,
  layout,
  roadTiles,
  camera,
  viewport,
  hoveredCellId,
  selectedBuildingId,
  placementActive,
}: RenderOptions) {
  const anchor = worldToScreen(CITY_WORLD_CENTER, camera, viewport);
  context.save();
  context.translate(anchor.x, anchor.y);
  context.scale(camera.zoom, camera.zoom);
  context.translate(-CITY_WORLD_CENTER.x, -CITY_WORLD_CENTER.y);
  context.filter =
    city.doctrine === "industrial"
      ? "sepia(.12) contrast(1.03)"
      : city.doctrine === "scholarly"
        ? "hue-rotate(7deg) brightness(1.03)"
        : city.doctrine === "maritime"
          ? "saturate(.92) contrast(1.04)"
          : city.doctrine === "civic"
            ? "brightness(1.04) saturate(.88)"
            : city.doctrine === "cultural"
              ? "saturate(1.12) brightness(1.02)"
              : city.doctrine === "pastoral"
                ? "saturate(1.1) hue-rotate(-7deg)"
                : "none";

  const landCells = [...layout.landCells].sort(
    (left, right) => left.position.y - right.position.y || left.position.x - right.position.x,
  );

  context.save();
  context.filter = "blur(18px)";
  context.fillStyle = "rgba(20, 47, 44, .52)";
  context.beginPath();
  context.ellipse(CITY_WORLD_CENTER.x, CITY_WORLD_CENTER.y + 24, 590, 555, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  for (const cell of landCells) {
    for (const direction of layout.exposedEdges.get(cell.cellId) ?? []) {
      if (direction === 0 || direction >= 3) {
        drawCliffFace(context, cell.position, direction, (cell.cellId + city.seed) % 3);
      }
    }
  }

  for (const cell of landCells) drawGroundCell(context, cell, traitFor(cell), city.seed);

  for (const cell of landCells) {
    for (const direction of layout.exposedEdges.get(cell.cellId) ?? []) {
      drawCoastEdge(context, cell.position, direction, (cell.cellId + city.seed) % 3);
    }
  }

  for (const road of [...roadTiles].sort((left, right) => left.depth - right.depth)) {
    drawRoad(context, road, city.roadLevel);
  }

  const buildingByPlot = new Map(city.buildings.map((building) => [building.plotId, building]));
  for (const cell of layout.plotCells.values()) {
    const unlocked = isPlotUnlocked(city, cell.plotId);
    const occupied = buildingByPlot.has(cell.plotId);
    if (hoveredCellId === cell.cellId || (placementActive && unlocked && !occupied)) {
      context.save();
      traceHex(context, cell.position, 5);
      context.fillStyle =
        placementActive && unlocked && !occupied
          ? "rgba(248, 224, 119, .30)"
          : "rgba(255, 250, 222, .15)";
      context.shadowColor = "#f6e07c";
      context.shadowBlur = placementActive ? 12 : 5;
      context.fill();
      context.restore();
    }
    if (!unlocked) {
      context.save();
      traceHex(context, cell.position, 2);
      context.fillStyle = "rgba(35, 51, 36, .28)";
      context.fill();
      context.restore();
      drawLock(context, cell.position.x, cell.position.y);
    } else if (!occupied) {
      context.save();
      context.font = "800 9px Avenir Next Condensed, sans-serif";
      context.textAlign = "center";
      context.fillStyle = "rgba(61, 49, 31, .64)";
      context.fillText(cell.trait.toUpperCase(), cell.position.x, cell.position.y + 24);
      context.restore();
    }
  }

  drawHarbourPier(context, layout);

  const drawables: Drawable[] = [];
  for (const cell of landCells) {
    if (cell.kind !== "nature") continue;
    drawables.push({
      anchorX: cell.position.x,
      anchorY: cell.position.y,
      layer: 1,
      stableId: cell.cellId,
      draw: () => {
        if ((cell.cellId + city.seed) % 3 === 0) {
          const width = 130;
          const height = 109;
          drawAtlasCell(
            context,
            atlases.details,
            15 + ((cell.atlasIndex + cell.cellId) % 5),
            5,
            4,
            cell.position.x - width / 2,
            cell.position.y - height * 0.76,
            width,
            height,
          );
        } else {
          const width = 132;
          const height = 167;
          drawAtlasCell(
            context,
            atlases.environment,
            cell.atlasIndex,
            4,
            2,
            cell.position.x - width / 2,
            cell.position.y - height * 0.76,
            width,
            height,
          );
        }
      },
    });
  }

  drawables.push({
    anchorX: layout.townHall.position.x,
    anchorY: layout.townHall.position.y,
    layer: 2,
    stableId: layout.townHall.cellId,
    draw: () => {
      drawBuilding(context, atlases, "academy", 1, layout.townHall.position);
      drawLabel(
        context,
        `Town Hall · ${city.townHallLevel}`,
        layout.townHall.position.x,
        layout.townHall.position.y + 42,
      );
    },
  });
  drawables.push({
    anchorX: layout.harbour.position.x,
    anchorY: layout.harbour.position.y,
    layer: 2,
    stableId: layout.harbour.cellId,
    draw: () => {
      drawBuilding(context, atlases, "warehouse", 1, layout.harbour.position);
      drawLabel(
        context,
        `Harbour · ${city.harbourLevel}`,
        layout.harbour.position.x,
        layout.harbour.position.y + 42,
      );
    },
  });

  for (const building of city.buildings) {
    const position = layout.plotCells.get(building.plotId)?.position;
    if (!position) continue;
    drawables.push({
      anchorX: position.x,
      anchorY: position.y,
      layer: 2,
      stableId: 100 + building.plotId,
      draw: () =>
        drawBuilding(context, atlases, building.type, building.level, position, {
          selected: building.id === selectedBuildingId,
          damaged: building.condition < 100,
          constructing:
            city.construction?.targetBuildingId === building.id && building.status !== "active",
        }),
    });
  }

  if (city.wallLevel > 0) {
    const gateDirection =
      layout.exposedEdges
        .get(layout.harbour.cellId)
        ?.find((direction) => direction === 4 || direction === 5) ??
      layout.exposedEdges.get(layout.harbour.cellId)?.[0];
    for (const cell of landCells) {
      for (const direction of layout.exposedEdges.get(cell.cellId) ?? []) {
        if (
          city.wallLevel >= 2 &&
          cell.cellId === layout.harbour.cellId &&
          direction === gateDirection
        ) {
          continue;
        }
        const midpoint = hexEdgeMidpoint(cell.position, direction);
        drawables.push({
          anchorX: midpoint.x,
          anchorY: midpoint.y,
          layer: direction >= 3 ? 3 : 0,
          stableId: 500 + cell.cellId * 6 + direction,
          draw: () => drawWallSegment(context, cell.position, direction, city.wallLevel),
        });
      }
    }
    if (city.wallLevel >= 2 && gateDirection !== undefined) {
      const neighbour = HEX_DIRECTIONS[gateDirection];
      const outside = mapPosition(layout.harbour.q + neighbour.q, layout.harbour.r + neighbour.r);
      const gate = {
        x: layout.harbour.position.x + (outside.x - layout.harbour.position.x) * 0.48,
        y: layout.harbour.position.y + (outside.y - layout.harbour.position.y) * 0.48,
      };
      drawables.push({
        anchorX: gate.x,
        anchorY: gate.y,
        layer: 3,
        stableId: 999,
        draw: () => {
          context.save();
          context.translate(gate.x, gate.y);
          if (gateDirection === 4) context.scale(-1, 1);
          drawAtlasCell(context, atlases.details, 8, 5, 4, -69, -84, 138, 115);
          context.restore();
        },
      });
    }
  }

  drawables.sort(drawableSort);
  drawables.forEach(({ draw }) => draw());
  context.restore();
}
