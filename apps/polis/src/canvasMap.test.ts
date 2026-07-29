/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { getMapLayout } from "./map";
import {
  hitTestBuilding,
  hitTestMap,
  screenToWorld,
  worldToScreen,
  zoomCameraAt,
  type CanvasCamera,
  type ViewportSize,
} from "./canvasMap";

const viewport: ViewportSize = { width: 1440, height: 900 };
const camera: CanvasCamera = { x: 32, y: -18, zoom: 1.2 };

describe("city canvas map", () => {
  test("screen and world projection are inverse at the camera seam", () => {
    const world = { x: 802, y: 420 };
    const screen = worldToScreen(world, camera, viewport);

    expect(screenToWorld(screen, camera, viewport).x).toBeCloseTo(world.x, 8);
    expect(screenToWorld(screen, camera, viewport).y).toBeCloseTo(world.y, 8);
  });

  test("cursor-anchored zoom keeps the same city point under the cursor", () => {
    const cursor = { x: 930, y: 310 };
    const before = screenToWorld(cursor, camera, viewport);
    const zoomed = zoomCameraAt(camera, viewport, cursor, 1.45);
    const after = screenToWorld(cursor, zoomed, viewport);

    expect(after.x).toBeCloseTo(before.x, 8);
    expect(after.y).toBeCloseTo(before.y, 8);
    expect(zoomed.zoom).toBe(1.45);
  });

  test("hit testing selects the displayed hex after pan and zoom", () => {
    const layout = getMapLayout(42);
    const plot = layout.plotCells.get(7)!;
    const screen = worldToScreen(plot.position, camera, viewport);

    expect(hitTestMap(screen, camera, viewport, layout)?.cellId).toBe(plot.cellId);
    expect(
      hitTestMap({ x: screen.x + 69, y: screen.y + 27 }, camera, viewport, layout)?.cellId,
    ).toBe(plot.cellId);
    expect(hitTestMap({ x: -500, y: -500 }, camera, viewport, layout)).toBeNull();
  });

  test("building hit testing includes the raised sprite above its ground hex", () => {
    const layout = getMapLayout(42);
    const plot = layout.plotCells.get(7)!;
    const building = {
      id: "building-roof",
      type: "house" as const,
      plotId: 7,
      level: 1,
      condition: 100,
      staffing: 1 as const,
      status: "active" as const,
    };

    expect(
      hitTestBuilding({ x: plot.position.x, y: plot.position.y - 72 }, [building], layout),
    ).toBe(building);
    expect(
      hitTestBuilding({ x: plot.position.x + 90, y: plot.position.y - 72 }, [building], layout),
    ).toBeNull();
  });
});
