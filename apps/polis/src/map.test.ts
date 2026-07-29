/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  HEX_CELL_COUNT,
  PLOT_DISTRICTS,
  PLOT_TRAITS,
  axialDistance,
  axialNeighbours,
  exposedHexEdges,
  getMapLayout,
  getPlotDistance,
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

  test("each seeded island has 24 plots, 30 natural areas, two landmarks and five inlets", () => {
    for (const seed of [1, 42, 99, 12_345]) {
      const layout = getMapLayout(seed);

      expect(layout.cells).toHaveLength(HEX_CELL_COUNT);
      expect(layout.cells.filter((cell) => cell.kind === "plot")).toHaveLength(24);
      expect(layout.cells.filter((cell) => cell.kind === "nature")).toHaveLength(30);
      expect(layout.cells.filter((cell) => cell.kind === "town-hall")).toHaveLength(1);
      expect(layout.cells.filter((cell) => cell.kind === "harbour")).toHaveLength(1);
      expect(layout.cells.filter((cell) => cell.kind === "water")).toHaveLength(5);
      expect(new Set(layout.plotCells.keys()).size).toBe(24);
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

  test("authored plot traits stay stable across simulation seeds", () => {
    for (const seed of [1, 42, 99]) {
      const layout = getMapLayout(seed);
      for (const [plotId, expectedTrait] of PLOT_TRAITS.entries()) {
        expect(layout.plotCells.get(plotId)?.trait).toBe(expectedTrait);
      }
    }
  });

  test("neighbourhood distance follows the displayed seeded layout", () => {
    const layout = getMapLayout(42);
    const left = layout.plotCells.get(7)!;
    const right = layout.plotCells.get(8)!;

    expect(getPlotDistance(42, 7, 8)).toBe(axialDistance(left, right));
  });
});
