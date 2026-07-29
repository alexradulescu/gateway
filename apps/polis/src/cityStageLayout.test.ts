/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  CITY_STAGE_HEIGHT,
  CITY_STAGE_WIDTH,
  THALASSA_LAYOUT,
  getRoadBackground,
} from "./cityStageLayout";
import {
  stageScreenToWorld,
  stageWorldToScreen,
  zoomStageCameraAt,
  type StageCamera,
  type StageViewport,
} from "./cityStageCamera";

const viewport: StageViewport = { width: 1440, height: 900 };
const camera: StageCamera = { x: 18, y: 24, zoom: 0.82 };

describe("Thalassa fixed city stage", () => {
  test("defines one stable 1536 by 1024 layout with 36 unique building sites", () => {
    expect(THALASSA_LAYOUT.id).toBe("thalassa-01");
    expect(CITY_STAGE_WIDTH).toBe(1536);
    expect(CITY_STAGE_HEIGHT).toBe(1024);
    expect(THALASSA_LAYOUT.sites).toHaveLength(36);
    expect(new Set(THALASSA_LAYOUT.sites.map((site) => site.plotId)).size).toBe(36);
    expect(new Set(THALASSA_LAYOUT.sites.map((site) => site.district))).toEqual(
      new Set([0, 1, 2, 3]),
    );
  });

  test("selects a complete authored background for every supported road level", () => {
    expect(getRoadBackground(1)).toBe("/polis/assets/thalassa-01-road-1.avif");
    expect(getRoadBackground(2)).toBe("/polis/assets/thalassa-01-road-2.avif");
    expect(getRoadBackground(3)).toBe("/polis/assets/thalassa-01-road-3.avif");
    expect(getRoadBackground(4)).toBe("/polis/assets/thalassa-01-road-4.avif");
    expect(getRoadBackground(99)).toBe("/polis/assets/thalassa-01-road-4.avif");
    expect(getRoadBackground(-3)).toBe("/polis/assets/thalassa-01-road-1.avif");
  });

  test("keeps landmarks distinct from normal building sites", () => {
    expect(THALASSA_LAYOUT.townHall.kind).toBe("town-hall");
    expect(THALASSA_LAYOUT.harbour.kind).toBe("harbour");
    expect(THALASSA_LAYOUT.townHall.position).not.toEqual(THALASSA_LAYOUT.harbour.position);
    expect(
      THALASSA_LAYOUT.sites.every(
        (site) =>
          site.position.x !== THALASSA_LAYOUT.townHall.position.x ||
          site.position.y !== THALASSA_LAYOUT.townHall.position.y,
      ),
    ).toBe(true);
  });

  test("keeps authored coordinates stable through pan and zoom", () => {
    const world = { x: 975, y: 603 };
    const screen = stageWorldToScreen(world, camera, viewport);
    const restored = stageScreenToWorld(screen, camera, viewport);
    expect(restored.x).toBeCloseTo(world.x, 8);
    expect(restored.y).toBeCloseTo(world.y, 8);

    const pointer = { x: 910, y: 330 };
    const before = stageScreenToWorld(pointer, camera, viewport);
    const zoomed = zoomStageCameraAt(camera, viewport, pointer, 1.15);
    const after = stageScreenToWorld(pointer, zoomed, viewport);
    expect(after.x).toBeCloseTo(before.x, 8);
    expect(after.y).toBeCloseTo(before.y, 8);
  });
});
