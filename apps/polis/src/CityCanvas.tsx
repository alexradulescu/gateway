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
  type CityState,
} from "./game";
import type { CityMapLayout, RoadTile } from "./map";
import {
  hitTestBuilding,
  hitTestMap,
  screenToWorld,
  zoomCameraAt,
  type CanvasCamera,
  type Point,
  type ViewportSize,
} from "./canvasMap";
import { ATLAS_URLS, renderCityMap, type AtlasName, type CityAtlases } from "./cityRenderer";

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

function useAtlases() {
  const [atlases, setAtlases] = useState<CityAtlases | null>(null);
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
      if (!cancelled) setAtlases(Object.fromEntries(loaded) as CityAtlases);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return atlases;
}

function pointFromEvent(event: ReactPointerEvent<HTMLCanvasElement>): Point {
  const bounds = event.currentTarget.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
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
    renderCityMap({
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
    });
  }, [
    atlases,
    camera,
    city,
    hoveredCellId,
    layout,
    placementActive,
    roadTiles,
    selectedBuildingId,
    viewport,
  ]);

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
        aria-label="Interactive hexagonal city map. Drag to move, use the mouse wheel to zoom."
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
            0.48,
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
