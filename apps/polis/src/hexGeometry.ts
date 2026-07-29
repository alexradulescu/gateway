export type AxialPoint = {
  q: number;
  r: number;
};

export type WorldPoint = {
  x: number;
  y: number;
};

export const HEX_SIZE = 82;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = HEX_SIZE * 2;
export const HEX_VERTICAL_SPACING = HEX_SIZE * 1.5;

export const CITY_WORLD_WIDTH = 1320;
export const CITY_WORLD_HEIGHT = 1320;
export const CITY_WORLD_CENTER: WorldPoint = {
  x: CITY_WORLD_WIDTH / 2,
  y: CITY_WORLD_HEIGHT / 2,
};

export function axialToWorld(coordinate: AxialPoint): WorldPoint {
  return {
    x:
      CITY_WORLD_CENTER.x +
      HEX_SIZE * (Math.sqrt(3) * coordinate.q + (Math.sqrt(3) / 2) * coordinate.r),
    y: CITY_WORLD_CENTER.y + HEX_SIZE * 1.5 * coordinate.r,
  };
}

export function worldToFractionalAxial(point: WorldPoint): AxialPoint {
  const x = (point.x - CITY_WORLD_CENTER.x) / HEX_SIZE;
  const y = (point.y - CITY_WORLD_CENTER.y) / HEX_SIZE;
  return {
    q: (Math.sqrt(3) / 3) * x - y / 3,
    r: (2 / 3) * y,
  };
}

export function roundAxial(coordinate: AxialPoint): AxialPoint {
  const cube = { x: coordinate.q, z: coordinate.r, y: -coordinate.q - coordinate.r };
  let x = Math.round(cube.x);
  let y = Math.round(cube.y);
  let z = Math.round(cube.z);
  const xDifference = Math.abs(x - cube.x);
  const yDifference = Math.abs(y - cube.y);
  const zDifference = Math.abs(z - cube.z);

  if (xDifference > yDifference && xDifference > zDifference) x = -y - z;
  else if (yDifference > zDifference) y = -x - z;
  else z = -x - y;

  return { q: x === 0 ? 0 : x, r: z === 0 ? 0 : z };
}

export function worldToAxial(point: WorldPoint): AxialPoint {
  return roundAxial(worldToFractionalAxial(point));
}

export function hexCorners(center: WorldPoint, inset = 0): WorldPoint[] {
  const radius = HEX_SIZE - inset;
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((-90 + index * 60) * Math.PI) / 180;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

const EDGE_CORNERS = [
  [1, 2],
  [0, 1],
  [5, 0],
  [4, 5],
  [3, 4],
  [2, 3],
] as const;

export function hexEdge(
  center: WorldPoint,
  direction: 0 | 1 | 2 | 3 | 4 | 5,
  inset = 0,
): readonly [WorldPoint, WorldPoint] {
  const corners = hexCorners(center, inset);
  const [first, second] = EDGE_CORNERS[direction];
  return [corners[first], corners[second]];
}

export function hexEdgeMidpoint(
  center: WorldPoint,
  direction: 0 | 1 | 2 | 3 | 4 | 5,
  inset = 0,
): WorldPoint {
  const [first, second] = hexEdge(center, direction, inset);
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}
