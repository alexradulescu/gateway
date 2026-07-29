/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  HEX_SIZE,
  axialToWorld,
  hexCorners,
  hexEdgeMidpoint,
  roundAxial,
  worldToFractionalAxial,
} from "./hexGeometry";

const origin = { x: 660, y: 660 };

function distance(left: { x: number; y: number }, right: { x: number; y: number }) {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

describe("regular pointy-top hex geometry", () => {
  test("all six screen-space sides have exactly the same length", () => {
    const corners = hexCorners(origin);
    const sideLengths = corners.map((corner, index) =>
      distance(corner, corners[(index + 1) % corners.length]),
    );

    expect(corners).toHaveLength(6);
    for (const sideLength of sideLengths) {
      expect(sideLength).toBeCloseTo(HEX_SIZE, 10);
    }
  });

  test("uses the standard pointy-top axial basis", () => {
    expect(axialToWorld({ q: 0, r: 0 })).toEqual(origin);
    expect(axialToWorld({ q: 1, r: 0 }).x - origin.x).toBeCloseTo(Math.sqrt(3) * HEX_SIZE, 10);
    expect(axialToWorld({ q: 1, r: 0 }).y).toBeCloseTo(origin.y, 10);
    expect(axialToWorld({ q: 0, r: 1 }).x - origin.x).toBeCloseTo(
      (Math.sqrt(3) / 2) * HEX_SIZE,
      10,
    );
    expect(axialToWorld({ q: 0, r: 1 }).y - origin.y).toBeCloseTo(1.5 * HEX_SIZE, 10);
  });

  test("neighbouring cells share an exact edge", () => {
    const center = hexCorners(axialToWorld({ q: 0, r: 0 }));
    const east = hexCorners(axialToWorld({ q: 1, r: 0 }));

    expect(center[1].x).toBeCloseTo(east[5].x, 10);
    expect(center[1].y).toBeCloseTo(east[5].y, 10);
    expect(center[2].x).toBeCloseTo(east[4].x, 10);
    expect(center[2].y).toBeCloseTo(east[4].y, 10);
  });

  test("road and coast anchors meet at the same shared-edge midpoint", () => {
    const center = axialToWorld({ q: 0, r: 0 });
    const east = axialToWorld({ q: 1, r: 0 });
    const fromCenter = hexEdgeMidpoint(center, 0);
    const fromEast = hexEdgeMidpoint(east, 3);

    expect(fromCenter.x).toBeCloseTo(fromEast.x, 10);
    expect(fromCenter.y).toBeCloseTo(fromEast.y, 10);
  });

  test("pixel conversion and cube rounding recover the owning cell", () => {
    for (const coordinate of [
      { q: 0, r: 0 },
      { q: 3, r: -2 },
      { q: -4, r: 1 },
      { q: 1, r: 3 },
    ]) {
      const center = axialToWorld(coordinate);
      expect(roundAxial(worldToFractionalAxial(center))).toEqual(coordinate);
      expect(
        roundAxial(
          worldToFractionalAxial({
            x: center.x + HEX_SIZE * 0.42,
            y: center.y - HEX_SIZE * 0.12,
          }),
        ),
      ).toEqual(coordinate);
    }
  });
});
