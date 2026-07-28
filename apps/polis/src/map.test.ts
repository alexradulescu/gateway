/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  MAP_CELL_COUNT,
  PLOT_DISTRICTS,
  getMapLayout,
  getPlotDistance,
  getRoadSegments,
  getRoadTileVariant,
} from "./map";

describe("Aegean Polis map", () => {
  test("each seeded island has 36 buildable plots and permanent natural blockers", () => {
    for (const seed of [1, 42, 99, 12_345]) {
      const layout = getMapLayout(seed);

      expect(layout.cells).toHaveLength(MAP_CELL_COUNT);
      expect(layout.cells.filter((cell) => cell.kind === "plot")).toHaveLength(36);
      expect(layout.cells.filter((cell) => cell.kind === "nature")).toHaveLength(18);
      expect(layout.cells.filter((cell) => cell.kind === "town-hall")).toHaveLength(1);
      expect(layout.cells.filter((cell) => cell.kind === "harbour")).toHaveLength(1);
      expect(new Set(layout.plotCells.keys()).size).toBe(36);
    }
  });

  test("districts retain their established plot counts on the larger grid", () => {
    const layout = getMapLayout(42);

    for (const [district, plotIds] of PLOT_DISTRICTS.entries()) {
      expect(
        [...layout.plotCells.values()].filter((cell) => cell.district === district),
      ).toHaveLength(plotIds.length);
    }
  });

  test("occupied plots automatically route visible roads toward the town hall", () => {
    for (let seed = 1; seed <= 1_000; seed += 1) {
      for (const [district, plotIds] of PLOT_DISTRICTS.entries()) {
        for (const plotId of plotIds) {
          const roads = getRoadSegments(seed, [plotId], [0, district]);
          expect(roads.length).toBeGreaterThan(0);
          expect(new Set(roads.map((road) => road.key)).size).toBe(roads.length);
          expect(roads.every((road) => road.width > 80)).toBe(true);
        }
      }
    }
  });

  test("neighbourhood distance follows the displayed seeded layout", () => {
    const layout = getMapLayout(42);
    const left = layout.plotCells.get(7)!;
    const right = layout.plotCells.get(8)!;

    expect(getPlotDistance(42, 7, 8)).toBe(
      Math.abs(left.row - right.row) + Math.abs(left.column - right.column),
    );
  });

  test("road topology selects every connector and intersection sprite explicitly", () => {
    const expected = [
      [1, false, "connectors", 0, "none"],
      [2, false, "connectors", 1, "none"],
      [3, false, "roads", 2, "none"],
      [4, false, "connectors", 0, "flip-both"],
      [5, false, "roads", 0, "none"],
      [6, false, "connectors", 2, "flip-both"],
      [7, false, "connectors", 3, "flip-x"],
      [8, false, "connectors", 1, "flip-both"],
      [9, false, "connectors", 2, "none"],
      [10, false, "roads", 1, "none"],
      [11, false, "connectors", 3, "flip-both"],
      [12, false, "roads", 2, "flip-both"],
      [13, false, "connectors", 3, "flip-y"],
      [14, false, "connectors", 3, "none"],
      [15, false, "roads", 4, "none"],
      [5, true, "connectors", 4, "none"],
      [10, true, "connectors", 4, "flip-x"],
    ] as const;

    for (const [mask, hillside, atlas, atlasColumn, orientation] of expected) {
      expect(getRoadTileVariant(mask, hillside)).toEqual({
        atlas,
        atlasColumn,
        orientation,
      });
    }
  });
});
