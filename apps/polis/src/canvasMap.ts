import { axialKey, type CityMapLayout, type MapCell, type MapPosition } from "./map";
import type { Building } from "./game";
import {
  CITY_WORLD_CENTER,
  CITY_WORLD_HEIGHT,
  CITY_WORLD_WIDTH,
  HEX_SIZE,
  worldToAxial,
} from "./hexGeometry";

export { CITY_WORLD_CENTER, CITY_WORLD_HEIGHT, CITY_WORLD_WIDTH };

export type Point = {
  x: number;
  y: number;
};

export type ViewportSize = {
  width: number;
  height: number;
};

export type CanvasCamera = {
  x: number;
  y: number;
  zoom: number;
};

export function buildingSpriteRect(position: Point, level: number) {
  const size = 166 * (0.72 + level * 0.035);
  return {
    x: position.x - size / 2,
    y: position.y - size * 0.82,
    width: size,
    height: size,
  };
}

function viewportAnchor(viewport: ViewportSize) {
  return { x: viewport.width / 2, y: viewport.height * 0.53 };
}

export function worldToScreen(point: Point, camera: CanvasCamera, viewport: ViewportSize): Point {
  const anchor = viewportAnchor(viewport);
  return {
    x: anchor.x + camera.x + (point.x - CITY_WORLD_CENTER.x) * camera.zoom,
    y: anchor.y + camera.y + (point.y - CITY_WORLD_CENTER.y) * camera.zoom,
  };
}

export function screenToWorld(point: Point, camera: CanvasCamera, viewport: ViewportSize): Point {
  const anchor = viewportAnchor(viewport);
  return {
    x: CITY_WORLD_CENTER.x + (point.x - anchor.x - camera.x) / camera.zoom,
    y: CITY_WORLD_CENTER.y + (point.y - anchor.y - camera.y) / camera.zoom,
  };
}

export function zoomCameraAt(
  camera: CanvasCamera,
  viewport: ViewportSize,
  screenPoint: Point,
  zoom: number,
): CanvasCamera {
  const worldPoint = screenToWorld(screenPoint, camera, viewport);
  const anchor = viewportAnchor(viewport);
  return {
    x: screenPoint.x - anchor.x - (worldPoint.x - CITY_WORLD_CENTER.x) * zoom,
    y: screenPoint.y - anchor.y - (worldPoint.y - CITY_WORLD_CENTER.y) * zoom,
    zoom,
  };
}

export function pointInMapHex(point: Point, center: MapPosition) {
  const x = Math.abs(point.x - center.x);
  const y = Math.abs(point.y - center.y);
  if (x > (Math.sqrt(3) / 2) * HEX_SIZE || y > HEX_SIZE) return false;
  return Math.sqrt(3) * y + x <= Math.sqrt(3) * HEX_SIZE;
}

export function hitTestMap(
  screenPoint: Point,
  camera: CanvasCamera,
  viewport: ViewportSize,
  layout: CityMapLayout,
): MapCell | null {
  const worldPoint = screenToWorld(screenPoint, camera, viewport);
  return layout.cellByCoordinate.get(axialKey(worldToAxial(worldPoint))) ?? null;
}

export function hitTestBuilding(
  worldPoint: Point,
  buildings: Building[],
  layout: CityMapLayout,
): Building | null {
  const frontToBack = [...buildings].sort((left, right) => {
    const leftY = layout.plotCells.get(left.plotId)?.position.y ?? 0;
    const rightY = layout.plotCells.get(right.plotId)?.position.y ?? 0;
    return rightY - leftY;
  });
  for (const building of frontToBack) {
    const position = layout.plotCells.get(building.plotId)?.position;
    if (!position) continue;
    const bounds = buildingSpriteRect(position, building.level);
    if (
      worldPoint.x >= bounds.x &&
      worldPoint.x <= bounds.x + bounds.width &&
      worldPoint.y >= bounds.y &&
      worldPoint.y <= bounds.y + bounds.height
    ) {
      return building;
    }
  }
  return null;
}
