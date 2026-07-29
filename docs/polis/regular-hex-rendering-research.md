# Regular hex rendering for Polis

## Bottom line

Use one pointy-top axial layout with a single circumradius `R` for the ground grid. Do not use independently tuned half-width, half-height, side height, and row spacing values. That is the cause of the current distorted tiles and gaps.

For the existing `1320 × 1000` world and a radius-4 map, `R = 70` fits cleanly:

- hex width: `sqrt(3) × R = 121.2436`
- hex height: `2 × R = 140`
- adjacent-column pitch: `sqrt(3) × R = 121.2436`
- diagonal x offset: `sqrt(3) / 2 × R = 60.6218`
- row pitch: `3 / 2 × R = 105`

This places the outer top and bottom vertices at `y = 10` and `y = 990` when the origin is `(660, 500)`. The logical ground hexes stay regular in screen space. The 2.5D appearance should come from raised sprites, shadows, walls, and overhang—not from squashing the ground grid.

The authoritative basis is Amit Patel’s [Hexagonal Grids guide](https://www.redblobgames.com/grids/hexagons/) and its first-party [implementation guide](https://www.redblobgames.com/grids/hexagons/implementation.html).

## Canonical geometry

Store cells as axial `(q, r)` and derive `s = -q-r` when cube operations are needed. Red Blob recommends axial/cube for non-rectangular maps because the vector operations and algorithms remain simple.

For a pointy-top regular hex in a Canvas coordinate system where y grows downward:

```ts
const SQRT_3 = Math.sqrt(3);

function axialToPixel(q: number, r: number, R: number, origin: Point): Point {
  return {
    x: origin.x + R * SQRT_3 * (q + r / 2),
    y: origin.y + R * (3 / 2) * r,
  };
}
```

This is Red Blob’s pointy-top forward-orientation matrix: `(sqrt(3), sqrt(3)/2; 0, 3/2)`. Its six neighbour deltas therefore align exactly:

| Axial delta | Pixel-center delta     |
| ----------- | ---------------------- |
| `(1, 0)`    | `(sqrt(3)R, 0)`        |
| `(1, -1)`   | `(sqrt(3)R/2, -3R/2)`  |
| `(0, -1)`   | `(-sqrt(3)R/2, -3R/2)` |
| `(-1, 0)`   | `(-sqrt(3)R, 0)`       |
| `(-1, 1)`   | `(-sqrt(3)R/2, 3R/2)`  |
| `(0, 1)`    | `(sqrt(3)R/2, 3R/2)`   |

Generate vertices from the same `R`; never hand-tune them:

```ts
function pointyHexVertices(center: Point, R: number): Point[] {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((-90 + index * 60) * Math.PI) / 180;
    return {
      x: center.x + R * Math.cos(angle),
      y: center.y + R * Math.sin(angle),
    };
  });
}
```

The six vertices are top, upper-right, lower-right, bottom, lower-left, and upper-left. Every consecutive edge has length `R`. Red Blob derives the equivalent corner algorithm with a 30° pointy-top offset in the [drawing-a-hex section](https://www.redblobgames.com/grids/hexagons/implementation.html#layout).

With that vertex order, the current direction order maps to shared edges as follows:

```ts
const EDGE_BY_DIRECTION = [
  [1, 2], // east
  [0, 1], // north-east
  [5, 0], // north-west
  [4, 5], // west
  [3, 4], // south-west
  [2, 3], // south-east
] as const;
```

Road arms, walls, coast rims, gates, and neighbour tests should all use these exact direction/edge pairs. Do not maintain unrelated normalized clip polygons for the same edges.

## Pointer-to-hex conversion

Undo camera translation and scale first. Then subtract the grid origin and apply the inverse pointy-top matrix:

```ts
function pixelToAxial(point: Point, R: number, origin: Point) {
  const x = (point.x - origin.x) / R;
  const y = (point.y - origin.y) / R;
  const q = (SQRT_3 / 3) * x - (1 / 3) * y;
  const r = (2 / 3) * y;
  return { q, r, s: -q - r };
}
```

Round all three cube components, then repair the component with the largest rounding error so `q + r + s = 0`:

```ts
function cubeRound(frac: { q: number; r: number; s: number }) {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);

  const qError = Math.abs(q - frac.q);
  const rError = Math.abs(r - frac.r);
  const sError = Math.abs(s - frac.s);

  if (qError > rError && qError > sError) q = -r - s;
  else if (rError > sError) r = -q - s;
  else s = -q - r;

  return { q, r, s };
}
```

This is Red Blob’s [pixel-to-hex and cube-rounding algorithm](https://www.redblobgames.com/grids/hexagons/implementation.html#pixel-to-hex). It is more reliable and cheaper than scanning all cells with a separately defined hit polygon.

## Canvas rendering model

Use three conceptual passes:

1. **Ground:** fill every regular ground polygon, then clip its terrain texture to that exact polygon. Draw roads and flat markings here.
2. **Ground-edge details:** coast faces and other low edge treatments. Derive every edge from the canonical vertex list.
3. **Raised drawables:** shadows, buildings, trees, rocks, walls, gates, damage markers, and labels in painter order.

Keep a continuous island-coloured underlay behind the ground pass. It hides subpixel anti-aliasing hairlines without introducing fake gutters. The vertices and centres must still be mathematically shared; the underlay is not a substitute for correct geometry.

The existing terrain atlas can be used as a clipped texture, but its visible baked walls must not define the logical tile boundary. If those baked edges contradict the regular polygon, regenerate the terrain cells as edge-free fills and render coast/wall edges separately. No positioning algorithm can make incompatible baked boundaries tessellate.

For raised drawables, use a ground-contact anchor rather than an image rectangle:

```ts
type DepthKey = {
  anchorY: number;
  anchorX: number;
  layer: number;
  stableId: number;
};
```

Sort back-to-front by `anchorY`, then `anchorX`, then layer and stable id. A one-cell building uses its cell centre or an explicitly authored front-foot anchor. A multi-cell building uses the front-most projected footprint contact point. Put its shadow immediately before its body. Treat raised foreground walls as drawables with the wall-edge midpoint as their ground anchor, so they can cover buildings behind them.

This adapts the local Mykonos renderer’s sound pattern:

- [`IsoGrid.js`](/Users/alex/Funspace/mykonos-island-voxels/src/grid/IsoGrid.js) owns one forward matrix and its exact inverse.
- [`PlacedObject.js`](/Users/alex/Funspace/mykonos-island-voxels/src/building/PlacedObject.js) bases order on the front-most footprint cell.
- [`Renderer.js`](/Users/alex/Funspace/mykonos-island-voxels/src/core/Renderer.js) draws shadows first and then painter-sorted objects.

The square isometric renderer uses `x + y` because that is its screen-depth axis. Polis should not copy that key literally: in the regular pointy-top layout, projected `anchorY` is the relevant primary order.

## What is wrong in the current implementation

[`canvasMap.ts`](/Users/alex/Funspace/gateway/apps/polis/src/canvasMap.ts) currently defines:

```ts
HEX_HALF_WIDTH = 71;
HEX_HALF_HEIGHT = 73;
HEX_SIDE_HALF_HEIGHT = 17;
```

For a regular pointy-top hex with half-height `R = 73`, half-width must be `sqrt(3)/2 × R = 63.22` and the vertical half-length of each left/right edge must be `R/2 = 36.5`. Conversely, a width of `142` implies `R = 142/sqrt(3) = 81.98`, not `73`.

[`map.ts`](/Users/alex/Funspace/gateway/apps/polis/src/map.ts) independently uses centre pitches `(142, 90)`:

```ts
x = 660 + q * 142 + r * 71;
y = 500 + r * 90;
```

Those values cannot tessellate the polygon above. A regular pointy-top grid with horizontal pitch `142` would require diagonal x offset `71` and row pitch `122.98`; a grid with `R = 70` should instead use `(121.24, 60.62, 105)`.

The fix is architectural: make `R`, origin, forward transform, inverse transform, vertices, and direction edges one geometry module. Rendering and hit testing should consume that module rather than duplicating proportions.

## Acceptance tests

Automate these before visual tuning:

- Every polygon edge length equals `R` within a small epsilon.
- Each of the six neighbour centres is exactly the expected centre delta.
- Each neighbour pair’s shared edge endpoints are equal, allowing reversed order.
- `pixelToAxial(axialToPixel(q, r))` cube-rounds back to `(q, r)` over every map cell.
- Points just inside each edge hit the cell; points just across it round to the expected neighbour.
- Pan/zoom screen-to-world inversion does not change the chosen cell.
- Raised drawables with larger contact-anchor y render later; ties are deterministic.
- A radius-4 grid at `R = 70` stays inside the `1320 × 1000` logical world.

## Sources

- Amit Patel, [Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) — geometry, coordinate systems, spacing, conversion, and rounding.
- Amit Patel, [Implementation of Hex Grids](https://www.redblobgames.com/grids/hexagons/implementation.html) — authoritative orientation matrices, inverse conversion, corner generation, and executable recipes.
