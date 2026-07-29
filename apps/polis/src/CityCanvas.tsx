import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  BUILDING_DEFINITIONS,
  DISTRICT_NAMES,
  isPlotUnlocked,
  type Building,
  type BuildingType,
  type CityState,
} from "./game";
import {
  HEX_DIRECTIONS,
  getRoadDirections,
  mapPosition,
  type CityMapLayout,
  type HexDirection,
  type PlotTrait,
  type RoadTile,
} from "./map";
import {
  CITY_WORLD_CENTER,
  HEX_HALF_HEIGHT,
  HEX_HALF_WIDTH,
  HEX_SIDE_HALF_HEIGHT,
  buildingSpriteRect,
  hitTestBuilding,
  hitTestMap,
  screenToWorld,
  worldToScreen,
  zoomCameraAt,
  type CanvasCamera,
  type Point,
  type ViewportSize,
} from "./canvasMap";

type CityCanvasProps = {
  city: CityState;
  layout: CityMapLayout;
  roadTiles: RoadTile[];
  camera: CanvasCamera;
  selectedBuildingId: string | null;
  placementActive: boolean;
  onCameraChange: (camera: CanvasCamera) => void;
  onPlot: (plotId: number) => void;
  onBuilding: (building: Building) => void;
  onLandmark: () => void;
};

type AtlasName =
  | "buildings1"
  | "buildings2"
  | "buildings3"
  | "environment"
  | "terrain"
  | "roads"
  | "ramps"
  | "rims"
  | "details";

const ATLAS_URLS: Record<AtlasName, string> = {
  buildings1: "/polis/assets/buildings-atlas.png",
  buildings2: "/polis/assets/buildings-atlas-level-2.png",
  buildings3: "/polis/assets/buildings-atlas-level-3.png",
  environment: "/polis/assets/environment-atlas.png",
  terrain: "/polis/assets/hex-terrain-atlas.png",
  roads: "/polis/assets/hex-roads-atlas.png",
  ramps: "/polis/assets/hex-road-ramps-atlas.png",
  rims: "/polis/assets/hex-rims-atlas.png",
  details: "/polis/assets/map-details-atlas.png",
};

const TERRAIN_COLORS: Record<PlotTrait | "coastal", [string, string]> = {
  plain: ["#cbaa61", "#9b783e"],
  fertile: ["#889a50", "#536b36"],
  hillside: ["#9a815c", "#66543d"],
  coastal: ["#c5aa70", "#8d7951"],
};

const ROAD_EDGE_CLIPS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [
    [0.47, 0.32],
    [1, 0.2],
    [1, 0.8],
    [0.47, 0.68],
  ],
  [
    [0.4, 0.58],
    [0.42, 0],
    [1, 0],
    [1, 0.42],
    [0.58, 0.54],
  ],
  [
    [0, 0],
    [0.58, 0],
    [0.6, 0.58],
    [0.42, 0.54],
    [0, 0.42],
  ],
  [
    [0, 0.2],
    [0.53, 0.32],
    [0.53, 0.68],
    [0, 0.8],
  ],
  [
    [0, 0.58],
    [0.42, 0.46],
    [0.6, 0.42],
    [0.58, 1],
    [0, 1],
  ],
  [
    [0.4, 0.42],
    [0.58, 0.46],
    [1, 0.58],
    [1, 1],
    [0.42, 1],
  ],
];

const RIM_EDGE_CLIPS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [
    [0.72, 0.24],
    [1, 0.26],
    [1, 0.74],
    [0.72, 0.76],
    [0.48, 0.5],
  ],
  [
    [0.47, 0],
    [1, 0.12],
    [1, 0.45],
    [0.5, 0.52],
    [0.38, 0.28],
  ],
  [
    [0, 0.12],
    [0.53, 0],
    [0.62, 0.28],
    [0.5, 0.52],
    [0, 0.45],
  ],
  [
    [0, 0.26],
    [0.28, 0.24],
    [0.52, 0.5],
    [0.28, 0.76],
    [0, 0.74],
  ],
  [
    [0, 0.55],
    [0.5, 0.48],
    [0.62, 0.72],
    [0.53, 1],
    [0, 0.88],
  ],
  [
    [0.5, 0.48],
    [1, 0.55],
    [1, 0.88],
    [0.47, 1],
    [0.38, 0.72],
  ],
];

function terrainAtlasIndex(
  trait: PlotTrait,
  seed: number,
  cellId: number,
  kind: "plot" | "nature" | "town-hall" | "harbour",
) {
  const variation = Math.abs(Math.imul(seed + 17, 31) + Math.imul(cellId + 5, 13)) % 4;
  if (kind === "town-hall") return 14;
  if (kind === "harbour") return 12 + variation;
  if (trait === "hillside") return kind === "plot" ? 11 : 8 + variation;
  if (trait === "fertile") return 5 + (variation % 3);
  return variation;
}

function traceHex(context: CanvasRenderingContext2D, x: number, y: number, outset = 0) {
  const halfWidth = HEX_HALF_WIDTH + outset;
  const halfHeight = HEX_HALF_HEIGHT + outset * 0.8;
  const sideHalfHeight = HEX_SIDE_HALF_HEIGHT + outset * 0.2;
  context.beginPath();
  context.moveTo(x, y - halfHeight);
  context.lineTo(x + halfWidth, y - sideHalfHeight);
  context.lineTo(x + halfWidth, y + sideHalfHeight);
  context.lineTo(x, y + halfHeight);
  context.lineTo(x - halfWidth, y + sideHalfHeight);
  context.lineTo(x - halfWidth, y - sideHalfHeight);
  context.closePath();
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

function clipNormalizedPolygon(
  context: CanvasRenderingContext2D,
  points: ReadonlyArray<[number, number]>,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.beginPath();
  points.forEach(([pointX, pointY], index) => {
    const targetX = x + pointX * width;
    const targetY = y + pointY * height;
    if (index === 0) context.moveTo(targetX, targetY);
    else context.lineTo(targetX, targetY);
  });
  context.closePath();
  context.clip();
}

function roadAxisColumn(direction: HexDirection) {
  return direction === 0 || direction === 3 ? 0 : direction === 1 || direction === 4 ? 1 : 2;
}

function drawRoad(
  context: CanvasRenderingContext2D,
  atlases: Record<AtlasName, HTMLImageElement>,
  tile: RoadTile,
  level: number,
) {
  const x = tile.x - 102;
  const y = tile.y - 68;
  const atlasRow = Math.max(1, Math.min(4, level)) - 1;
  for (const direction of getRoadDirections(tile.mask)) {
    context.save();
    clipNormalizedPolygon(context, ROAD_EDGE_CLIPS[direction], x, y, 204, 136);
    const hillside = tile.hillside;
    drawAtlasCell(
      context,
      hillside ? atlases.ramps : atlases.roads,
      atlasRow * (hillside ? 3 : 4) + roadAxisColumn(direction),
      hillside ? 3 : 4,
      4,
      x,
      y,
      204,
      136,
    );
    context.restore();
  }
  context.save();
  context.beginPath();
  context.ellipse(tile.x, tile.y, 43, 38, 0, 0, Math.PI * 2);
  context.clip();
  drawAtlasCell(context, atlases.roads, atlasRow * 4 + 3, 4, 4, x, y, 204, 136);
  context.restore();
}

function drawRimEdge(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  center: Point,
  row: number,
  variation: number,
  direction: HexDirection,
) {
  const x = center.x - 102;
  const y = center.y - 68;
  context.save();
  clipNormalizedPolygon(context, RIM_EDGE_CLIPS[direction], x, y, 204, 136);
  drawAtlasCell(context, image, row * 4 + variation, 4, 4, x, y, 204, 136);
  context.restore();
}

function drawBuilding(
  context: CanvasRenderingContext2D,
  atlases: Record<AtlasName, HTMLImageElement>,
  type: BuildingType,
  level: number,
  position: Point,
  options: { selected?: boolean; damaged?: boolean; constructing?: boolean } = {},
) {
  const bounds = buildingSpriteRect(position, level);
  context.save();
  if (options.selected) {
    context.shadowColor = "#ffe49b";
    context.shadowBlur = 18;
    context.beginPath();
    context.ellipse(
      position.x,
      position.y - 7,
      bounds.width * 0.35,
      bounds.height * 0.13,
      0,
      0,
      Math.PI * 2,
    );
    context.fillStyle = "rgba(255, 225, 126, 0.42)";
    context.fill();
  }
  if (options.damaged) context.filter = "grayscale(.62) sepia(.2) brightness(.72)";
  if (options.constructing) context.globalAlpha = 0.62;
  context.shadowColor = "rgba(57, 38, 18, .35)";
  context.shadowBlur = 7;
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
    context.font = "700 10px Avenir Next, sans-serif";
    context.textAlign = "center";
    context.fillStyle = options.constructing ? "#8a5a2d" : "#a53f2d";
    context.fillRect(position.x - 27, position.y - 30, 54, 18);
    context.fillStyle = "#fff4df";
    context.fillText(label, position.x, position.y - 17);
    context.restore();
  }
}

function drawLabel(context: CanvasRenderingContext2D, label: string, x: number, y: number) {
  context.save();
  context.font = "700 13px Palatino, Georgia, serif";
  const width = context.measureText(label).width + 18;
  context.fillStyle = "rgba(248, 239, 214, .94)";
  context.strokeStyle = "rgba(80, 54, 28, .35)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(x - width / 2, y - 19, width, 25, 5);
  context.fill();
  context.stroke();
  context.fillStyle = "#43311d";
  context.textAlign = "center";
  context.fillText(label, x, y - 2);
  context.restore();
}

function drawLock(context: CanvasRenderingContext2D, x: number, y: number) {
  context.save();
  context.fillStyle = "rgba(40, 52, 36, .46)";
  context.beginPath();
  context.arc(x, y, 18, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#f0e6c9";
  context.lineWidth = 2;
  context.strokeRect(x - 6, y - 1, 12, 10);
  context.beginPath();
  context.arc(x, y - 1, 5, Math.PI, 0);
  context.stroke();
  context.restore();
}

function useAtlases() {
  const [atlases, setAtlases] = useState<Record<AtlasName, HTMLImageElement> | null>(null);
  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(ATLAS_URLS) as [AtlasName, string][];
    void Promise.all(
      entries.map(
        ([name, url]) =>
          new Promise<[AtlasName, HTMLImageElement]>((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve([name, image]);
            image.onerror = reject;
            image.src = url;
          }),
      ),
    ).then((loaded) => {
      if (!cancelled) setAtlases(Object.fromEntries(loaded) as Record<AtlasName, HTMLImageElement>);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return atlases;
}

export function CityCanvas({
  city,
  layout,
  roadTiles,
  camera,
  selectedBuildingId,
  placementActive,
  onCameraChange,
  onPlot,
  onBuilding,
  onLandmark,
}: CityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    pointerId: number;
    start: Point;
    camera: CanvasCamera;
    moved: boolean;
  } | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>({ width: 1, height: 1 });
  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null);
  const atlases = useAtlases();
  const buildingByPlot = useMemo(
    () => new Map(city.buildings.map((building) => [building.plotId, building])),
    [city.buildings],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const next = { width: Math.max(1, bounds.width), height: Math.max(1, bounds.height) };
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.round(next.width * dpr);
      canvas.height = Math.round(next.height * dpr);
      setViewport(next);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !atlases) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const dpr = canvas.width / viewport.width;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const anchor = worldToScreen(CITY_WORLD_CENTER, camera, viewport);
    context.save();
    context.translate(anchor.x, anchor.y);
    context.scale(camera.zoom, camera.zoom);
    context.translate(-CITY_WORLD_CENTER.x, -CITY_WORLD_CENTER.y);
    context.filter =
      city.doctrine === "industrial"
        ? "sepia(.14) contrast(1.04)"
        : city.doctrine === "scholarly"
          ? "hue-rotate(7deg) brightness(1.03)"
          : city.doctrine === "maritime"
            ? "saturate(.9) contrast(1.05)"
            : city.doctrine === "civic"
              ? "brightness(1.05) saturate(.85)"
              : city.doctrine === "cultural"
                ? "saturate(1.16) brightness(1.03)"
                : city.doctrine === "pastoral"
                  ? "saturate(1.12) hue-rotate(-8deg)"
                  : "none";

    context.save();
    context.filter = "blur(24px)";
    context.fillStyle = "rgba(24, 57, 50, .4)";
    context.beginPath();
    context.ellipse(660, 560, 600, 380, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    const landCells = [...layout.landCells].sort(
      (left, right) => left.position.depth - right.position.depth,
    );
    for (const cell of landCells) {
      const trait =
        cell.kind === "plot" || cell.kind === "nature"
          ? cell.trait
          : cell.kind === "harbour"
            ? "coastal"
            : "plain";
      const visualTrait = trait === "coastal" ? "plain" : trait;
      const colors = TERRAIN_COLORS[trait];
      const gradient = context.createLinearGradient(
        cell.position.x - 60,
        cell.position.y - 45,
        cell.position.x + 60,
        cell.position.y + 45,
      );
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      traceHex(context, cell.position.x, cell.position.y, 0.7);
      context.fillStyle = gradient;
      context.fill();

      context.save();
      traceHex(context, cell.position.x, cell.position.y, 0.6);
      context.clip();
      drawAtlasCell(
        context,
        atlases.terrain,
        terrainAtlasIndex(visualTrait, city.seed, cell.cellId, cell.kind),
        4,
        4,
        cell.position.x - 153,
        cell.position.y - 114.75,
        306,
        229.5,
      );
      context.restore();

      const usesRockyCoastRim =
        Math.abs(Math.imul(city.seed + 19, 17) + cell.cellId * 11) % 3 === 0;
      for (const direction of layout.exposedEdges.get(cell.cellId) ?? []) {
        drawRimEdge(
          context,
          atlases.rims,
          cell.position,
          usesRockyCoastRim ? 1 : 0,
          (cell.cellId + city.seed) % 4,
          direction,
        );
      }
    }

    for (const cell of layout.plotCells.values()) {
      const unlocked = isPlotUnlocked(city, cell.plotId);
      const occupied = buildingByPlot.has(cell.plotId);
      if (hoveredCellId === cell.cellId || (placementActive && unlocked && !occupied)) {
        context.save();
        traceHex(context, cell.position.x, cell.position.y, -3);
        context.fillStyle =
          placementActive && unlocked && !occupied
            ? "rgba(246, 224, 124, .28)"
            : "rgba(255, 249, 219, .12)";
        context.shadowColor = "#f6e07c";
        context.shadowBlur = placementActive ? 12 : 5;
        context.fill();
        context.restore();
      }
      if (!unlocked) {
        context.save();
        traceHex(context, cell.position.x, cell.position.y, -1);
        context.fillStyle = "rgba(35, 51, 36, .34)";
        context.fill();
        context.restore();
        drawLock(context, cell.position.x, cell.position.y);
      } else if (!occupied) {
        context.save();
        context.font = "800 9px Avenir Next Condensed, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "rgba(64, 51, 31, .72)";
        context.fillText(cell.trait.toUpperCase(), cell.position.x, cell.position.y + 20);
        context.restore();
      }
    }

    for (const road of [...roadTiles].sort((left, right) => left.depth - right.depth)) {
      drawRoad(context, atlases, road, city.roadLevel);
    }

    const drawables: Array<{ depth: number; draw: () => void }> = [];
    for (const cell of landCells) {
      if (cell.kind !== "nature") continue;
      if (city.wallLevel > 0 && (layout.exposedEdges.get(cell.cellId)?.length ?? 0) > 0) continue;
      drawables.push({
        depth: cell.position.y,
        draw: () => {
          if ((cell.cellId + city.seed) % 3 === 0) {
            const width = 147;
            const height = 123;
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
            const width = 146;
            const height = 185;
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

    if (city.wallLevel > 0) {
      const fortified = city.wallLevel >= 2;
      const gateDirection =
        layout.exposedEdges
          .get(layout.harbour.cellId)
          ?.find((direction) => direction === 4 || direction === 5) ??
        layout.exposedEdges.get(layout.harbour.cellId)?.[0];
      for (const cell of landCells) {
        for (const direction of layout.exposedEdges.get(cell.cellId) ?? []) {
          if (fortified && cell.cellId === layout.harbour.cellId && direction === gateDirection) {
            continue;
          }
          drawables.push({
            depth: cell.position.y + (direction === 4 || direction === 5 ? 45 : -45),
            draw: () =>
              drawRimEdge(
                context,
                atlases.rims,
                cell.position,
                fortified ? 3 : 2,
                (cell.cellId + city.wallLevel) % 4,
                direction,
              ),
          });
        }
        if (
          city.wallLevel >= 3 &&
          (layout.exposedEdges.get(cell.cellId)?.length ?? 0) >= 2 &&
          (cell.q - cell.r + 12) % 2 === 0
        ) {
          drawables.push({
            depth: cell.position.y + 2,
            draw: () =>
              drawAtlasCell(
                context,
                atlases.details,
                9,
                5,
                4,
                cell.position.x - 64,
                cell.position.y - 108,
                128,
                107,
              ),
          });
        }
      }
      if (fortified && gateDirection !== undefined) {
        const neighbour = HEX_DIRECTIONS[gateDirection];
        const outside = mapPosition(layout.harbour.q + neighbour.q, layout.harbour.r + neighbour.r);
        const gate = {
          x: layout.harbour.position.x + (outside.x - layout.harbour.position.x) * 0.48,
          y: layout.harbour.position.y + (outside.y - layout.harbour.position.y) * 0.48,
        };
        drawables.push({
          depth: gate.y + 46,
          draw: () => {
            context.save();
            context.translate(gate.x, gate.y);
            if (gateDirection === 4) context.scale(-1, 1);
            drawAtlasCell(context, atlases.details, 8, 5, 4, -74, -90, 147, 123);
            context.restore();
          },
        });
      }
    }

    drawables.push({
      depth: layout.harbour.position.y - 1,
      draw: () => {
        const { x, y } = layout.harbour.position;
        context.save();
        context.translate(x, y + 30);
        context.rotate(0.08);
        context.fillStyle = "#7d5735";
        context.fillRect(-66, 0, 132, 31);
        context.strokeStyle = "#b78a58";
        context.lineWidth = 4;
        for (let plank = -54; plank < 60; plank += 13) {
          context.beginPath();
          context.moveTo(plank, 1);
          context.lineTo(plank, 29);
          context.stroke();
        }
        context.restore();
      },
    });
    drawables.push({
      depth: layout.townHall.position.y,
      draw: () => {
        drawBuilding(context, atlases, "academy", 1, layout.townHall.position);
        drawLabel(
          context,
          `Town Hall · ${city.townHallLevel}`,
          layout.townHall.position.x,
          layout.townHall.position.y - 7,
        );
      },
    });
    drawables.push({
      depth: layout.harbour.position.y,
      draw: () => {
        drawBuilding(context, atlases, "warehouse", 1, layout.harbour.position);
        drawLabel(
          context,
          `Harbour · ${city.harbourLevel}`,
          layout.harbour.position.x,
          layout.harbour.position.y - 7,
        );
      },
    });

    for (const building of city.buildings) {
      const position = layout.plotCells.get(building.plotId)?.position;
      if (!position) continue;
      drawables.push({
        depth: position.y,
        draw: () =>
          drawBuilding(context, atlases, building.type, building.level, position, {
            selected: building.id === selectedBuildingId,
            damaged: building.condition < 100,
            constructing:
              city.construction?.targetBuildingId === building.id && building.status !== "active",
          }),
      });
    }
    drawables.sort((left, right) => left.depth - right.depth);
    drawables.forEach(({ draw }) => draw());
    context.restore();
  }, [
    atlases,
    buildingByPlot,
    camera,
    city,
    hoveredCellId,
    layout,
    placementActive,
    roadTiles,
    selectedBuildingId,
    viewport,
  ]);

  function pointFromEvent(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function updateHover(point: Point) {
    setHoveredCellId(hitTestMap(point, camera, viewport, layout)?.cellId ?? null);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) return;
    const point = pointFromEvent(event);
    drag.current = {
      pointerId: event.pointerId,
      start: point,
      camera,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = pointFromEvent(event);
    updateHover(point);
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const dx = point.x - drag.current.start.x;
    const dy = point.y - drag.current.start.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.current.moved = true;
    if (drag.current.moved) {
      onCameraChange({
        ...drag.current.camera,
        x: drag.current.camera.x + dx,
        y: drag.current.camera.y + dy,
      });
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const point = pointFromEvent(event);
    const moved = drag.current.moved;
    drag.current = null;
    if (moved) return;
    const worldPoint = screenToWorld(point, camera, viewport);
    if (!placementActive) {
      const building = hitTestBuilding(worldPoint, city.buildings, layout);
      if (building) {
        onBuilding(building);
        return;
      }
      for (const landmark of [layout.townHall, layout.harbour]) {
        if (
          worldPoint.x >= landmark.position.x - 64 &&
          worldPoint.x <= landmark.position.x + 64 &&
          worldPoint.y >= landmark.position.y - 112 &&
          worldPoint.y <= landmark.position.y + 8
        ) {
          onLandmark();
          return;
        }
      }
    }
    const hit = hitTestMap(point, camera, viewport, layout);
    if (!hit) return;
    if (hit.kind === "town-hall" || hit.kind === "harbour") {
      if (!placementActive) onLandmark();
      return;
    }
    if (hit.kind !== "plot") return;
    const building = buildingByPlot.get(hit.plotId);
    if (building && !placementActive) onBuilding(building);
    else onPlot(hit.plotId);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="city-canvas"
        aria-label="Interactive isometric city map. Drag to move, use the mouse wheel to zoom."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerLeave={() => setHoveredCellId(null)}
        onWheel={(event) => {
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
          const zoom = Math.max(
            0.55,
            Math.min(1.5, camera.zoom * Math.exp(-event.deltaY * 0.0015)),
          );
          onCameraChange(zoomCameraAt(camera, viewport, point, zoom));
        }}
      />
      <div className="map-a11y-actions" aria-label="City map locations">
        <button type="button" onClick={onLandmark}>
          Town Hall, level {city.townHallLevel}
        </button>
        <button type="button" onClick={onLandmark}>
          Harbour, level {city.harbourLevel}
        </button>
        {[...layout.plotCells.values()].map((cell) => {
          const building = buildingByPlot.get(cell.plotId);
          const unlocked = isPlotUnlocked(city, cell.plotId);
          return (
            <button
              type="button"
              key={cell.plotId}
              onClick={() =>
                building && !placementActive ? onBuilding(building) : onPlot(cell.plotId)
              }
            >
              {building
                ? `${BUILDING_DEFINITIONS[building.type].name}, level ${building.level}`
                : unlocked
                  ? `Open ${cell.trait} plot ${cell.plotId + 1}`
                  : `Locked ${cell.trait} plot in ${DISTRICT_NAMES[cell.district]}`}
            </button>
          );
        })}
      </div>
    </>
  );
}
