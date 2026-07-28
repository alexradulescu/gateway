/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  HEX_CELL_COUNT,
  PLOT_DISTRICTS,
  axialDistance,
  axialNeighbours,
  exposedHexEdges,
  getMapLayout,
  getPlotDistance,
  getRoadDirections,
  getRoadTiles,
} from "./map";

describe("Aegean Polis map", () => {
  test("axial geometry has six neighbours and worked-example distances", () => {
    expect(axialNeighbours({ q: 0, r: 0 })).toEqual([
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ]);
    expect(axialDistance({ q: 0, r: 0 }, { q: 2, r: -3 })).toBe(3);
    expect(axialDistance({ q: -2, r: 1 }, { q: 3, r: -1 })).toBe(5);
  });

  test("exposed edges are derived from neighbouring land rather than a rectangular perimeter", () => {
    const land = new Set(["0,0", "1,0", "0,1"]);

    expect(exposedHexEdges(land, { q: 0, r: 0 })).toEqual([1, 2, 3, 4]);
    expect(exposedHexEdges(land, { q: 1, r: 0 })).toEqual([0, 1, 2, 5]);
  });

  test("each seeded island has 36 plots, 18 natural blockers, two landmarks and five inlets", () => {
    for (const seed of [1, 42, 99, 12_345]) {
      const layout = getMapLayout(seed);

      expect(layout.cells).toHaveLength(HEX_CELL_COUNT);
      expect(layout.cells.filter((cell) => cell.kind === "plot")).toHaveLength(36);
      expect(layout.cells.filter((cell) => cell.kind === "nature")).toHaveLength(18);
      expect(layout.cells.filter((cell) => cell.kind === "town-hall")).toHaveLength(1);
      expect(layout.cells.filter((cell) => cell.kind === "harbour")).toHaveLength(1);
      expect(layout.cells.filter((cell) => cell.kind === "water")).toHaveLength(5);
      expect(new Set(layout.plotCells.keys()).size).toBe(36);
      expect(new Set(layout.cells.map((cell) => `${cell.q},${cell.r}`)).size).toBe(HEX_CELL_COUNT);
      expect(
        layout.cells.every(
          (cell) => Math.max(Math.abs(cell.q), Math.abs(cell.r), Math.abs(-cell.q - cell.r)) <= 4,
        ),
      ).toBe(true);
      expect(layout.exposedEdges.get(layout.harbour.cellId)?.length).toBeGreaterThan(0);
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

  test("occupied plots automatically form reciprocal six-way routes to the town hall", () => {
    for (let seed = 1; seed <= 250; seed += 1) {
      for (const [district, plotIds] of PLOT_DISTRICTS.entries()) {
        for (const plotId of plotIds) {
          const layout = getMapLayout(seed);
          const roads = getRoadTiles(seed, [plotId], [0, district]);
          const roadByCell = new Map(roads.map((road) => [road.cellId, road]));
          const occupiedCell = layout.plotCells.get(plotId)!;
          expect(roadByCell.has(occupiedCell.cellId)).toBe(true);
          expect(roadByCell.has(layout.townHall.cellId)).toBe(true);

          for (const road of roads) {
            expect(road.mask).toBeGreaterThan(0);
            expect(road.mask).toBeLessThan(64);
            axialNeighbours(road).forEach((coordinate, direction) => {
              if ((road.mask & (1 << direction)) === 0) return;
              const neighbour = roads.find(
                (candidate) => candidate.q === coordinate.q && candidate.r === coordinate.r,
              );
              expect(neighbour).toBeDefined();
              expect(neighbour!.mask & (1 << ((direction + 3) % 6))).not.toBe(0);
            });
          }
        }
      }
    }
  });

  test("neighbourhood distance follows the displayed seeded layout", () => {
    const layout = getMapLayout(42);
    const left = layout.plotCells.get(7)!;
    const right = layout.plotCells.get(8)!;

    expect(getPlotDistance(42, 7, 8)).toBe(axialDistance(left, right));
  });

  test("the road mask supports every combination of six directions", () => {
    expect(getRoadDirections(1)).toEqual([0]);
    expect(getRoadDirections(21)).toEqual([0, 2, 4]);
    expect(getRoadDirections(42)).toEqual([1, 3, 5]);
    expect(getRoadDirections(63)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
