import { CITY_STAGE_CENTER } from "./cityStageLayout";

export type StagePoint = {
  x: number;
  y: number;
};

export type StageViewport = {
  width: number;
  height: number;
};

export type StageCamera = {
  x: number;
  y: number;
  zoom: number;
};

function viewportAnchor(viewport: StageViewport) {
  return { x: viewport.width / 2, y: viewport.height * 0.52 };
}

export function stageWorldToScreen(
  point: StagePoint,
  camera: StageCamera,
  viewport: StageViewport,
): StagePoint {
  const anchor = viewportAnchor(viewport);
  return {
    x: anchor.x + camera.x + (point.x - CITY_STAGE_CENTER.x) * camera.zoom,
    y: anchor.y + camera.y + (point.y - CITY_STAGE_CENTER.y) * camera.zoom,
  };
}

export function stageScreenToWorld(
  point: StagePoint,
  camera: StageCamera,
  viewport: StageViewport,
): StagePoint {
  const anchor = viewportAnchor(viewport);
  return {
    x: CITY_STAGE_CENTER.x + (point.x - anchor.x - camera.x) / camera.zoom,
    y: CITY_STAGE_CENTER.y + (point.y - anchor.y - camera.y) / camera.zoom,
  };
}

export function zoomStageCameraAt(
  camera: StageCamera,
  viewport: StageViewport,
  screenPoint: StagePoint,
  zoom: number,
): StageCamera {
  const worldPoint = stageScreenToWorld(screenPoint, camera, viewport);
  const anchor = viewportAnchor(viewport);
  return {
    x: screenPoint.x - anchor.x - (worldPoint.x - CITY_STAGE_CENTER.x) * zoom,
    y: screenPoint.y - anchor.y - (worldPoint.y - CITY_STAGE_CENTER.y) * zoom,
    zoom,
  };
}
