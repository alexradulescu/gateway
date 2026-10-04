import type { ReactNode } from "react";

/**
 * Isometric drawing kit shared by every building.
 *
 * World units: the plot spans x, y ∈ [-50, 50] (x runs toward the screen
 * bottom-right, y toward the bottom-left) and z points up. One world unit is one
 * horizontal screen unit, so the plot diamond is exactly 200 × 115.47.
 */
export const VIEW_WIDTH = 200;
export const VIEW_HEIGHT = 320;

export const K = 0.57735;
const CX = 100;
const CY = VIEW_HEIGHT - 57.735;

export type V = [number, number, number];

const r2 = (n: number) => Math.round(n * 100) / 100;
export const sx = (x: number, y: number) => r2(CX + x - y);
export const sy = (x: number, y: number, z = 0) => r2(CY + (x + y) * K - z);
export const pt = (x: number, y: number, z = 0) => `${sx(x, y)},${sy(x, y, z)}`;
export const poly = (...vs: V[]) => vs.map((v) => pt(...v)).join(" ");

/* ---------- palette ---------- */
export const C = {
  stoneL: "#f1e6cd",
  stoneR: "#cbbcb6",
  stoneT: "#f8f0dc",
  stoneLine: "#d8c7a8",
  zincT: "#a9b9c9",
  zincL: "#8a9db3",
  zincR: "#6b7c95",
  slateL: "#6f7f99",
  slateR: "#56637d",
  terraL: "#d07a55",
  terraR: "#a65c4a",
  terraT: "#e0936b",
  iron: "#2a2f42",
  glass: "#4f5f7d",
  glassR: "#414f6b",
  glow: "#f7d07c",
  glowSoft: "#fbe3a6",
  frame: "#fbf6ea",
  leaf: "#7f9f6c",
  leafD: "#5f7f57",
  leafL: "#a8c48c",
  red: "#d9483f",
  redD: "#a8323a",
  wood: "#7a5543",
  woodD: "#5b3f35",
  shadow: "#3b3366",
  rim: "#fff8e6",
};

/* ---------- primitives ---------- */
type BoxOpts = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0?: number;
  z1: number;
  l: string;
  r: string;
  t?: string;
  rim?: boolean;
};

export function Box({ x0, x1, y0, y1, z0 = 0, z1, l, r, t, rim = true }: BoxOpts) {
  return (
    <g>
      <polygon points={poly([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1])} fill={l} />
      <polygon points={poly([x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1])} fill={r} />
      {t ? (
        <polygon points={poly([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1])} fill={t} />
      ) : null}
      {rim ? (
        <polyline
          points={poly([x0, y1, z1], [x1, y1, z1], [x1, y0, z1])}
          fill="none"
          stroke={C.rim}
          strokeOpacity={0.6}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
}

/** General prism: b and t are quads ordered (x0y0, x1y0, x1y1, x0y1). */
export function Prism({ b, t, l, r, top }: { b: V[]; t: V[]; l: string; r: string; top?: string }) {
  return (
    <g>
      <polygon points={poly(b[3], b[2], t[2], t[3])} fill={l} />
      <polygon points={poly(b[2], b[1], t[1], t[2])} fill={r} />
      {top ? <polygon points={poly(...t)} fill={top} /> : null}
    </g>
  );
}

export const quad = (x0: number, x1: number, y0: number, y1: number, z: number): V[] => [
  [x0, y0, z],
  [x1, y0, z],
  [x1, y1, z],
  [x0, y1, z],
];

/** Draw children in the plane of a left (south-west) face. Local x = along +x, local y = -z. */
export function FaceL({
  x,
  y,
  z = 0,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  children: ReactNode;
}) {
  return <g transform={`matrix(1 ${K} 0 1 ${sx(x, y)} ${sy(x, y, z)})`}>{children}</g>;
}

/** Draw children in the plane of a right (south-east) face, origin at its front corner. */
export function FaceR({
  x,
  y,
  z = 0,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  children: ReactNode;
}) {
  return <g transform={`matrix(1 ${-K} 0 1 ${sx(x, y)} ${sy(x, y, z)})`}>{children}</g>;
}

/** Window drawn in face space. */
export function Win({
  u,
  z,
  w,
  h,
  glow = false,
  right = false,
  arch = false,
  flowers = false,
  shutters,
}: {
  u: number;
  z: number;
  w: number;
  h: number;
  glow?: boolean;
  right?: boolean;
  arch?: boolean;
  flowers?: boolean;
  shutters?: string;
}) {
  const fill = glow ? C.glow : right ? C.glassR : C.glass;
  const shape = (pad: number) =>
    arch
      ? `M${u - pad},${-z + pad} L${u - pad},${-(z + h - w / 2)} A${w / 2 + pad},${w / 2 + pad} 0 0 1 ${u + w + pad},${-(z + h - w / 2)} L${u + w + pad},${-z + pad} Z`
      : `M${u - pad},${-z + pad} h${w + 2 * pad} v${-(h + 2 * pad)} h${-(w + 2 * pad)} Z`;
  return (
    <g>
      {shutters ? (
        <>
          <rect x={u - w * 0.55 - 0.4} y={-(z + h)} width={w * 0.5} height={h} fill={shutters} />
          <rect
            x={u + w + 0.4 + w * 0.05}
            y={-(z + h)}
            width={w * 0.5}
            height={h}
            fill={shutters}
          />
        </>
      ) : null}
      <path d={shape(0.7)} fill={right ? "#e6dccb" : C.frame} />
      <path d={shape(0)} fill={fill} />
      {glow ? null : (
        <path
          d={`M${u + w * 0.15},${-z - h * 0.35} l${w * 0.35},${-h * 0.4}`}
          stroke="#fff"
          strokeOpacity={0.28}
          strokeWidth={0.6}
        />
      )}
      <path
        d={`M${u + w / 2},${-z} v${-h} M${u},${-(z + h * 0.62)} h${w}`}
        stroke={C.frame}
        strokeOpacity={0.75}
        strokeWidth={0.45}
      />
      {flowers ? (
        <g>
          <rect x={u - 0.8} y={-z} width={w + 1.6} height={1.6} fill={C.terraR} />
          <circle cx={u + w * 0.12} cy={-z - 0.4} r={0.9} fill={C.leaf} />
          <circle cx={u + w * 0.5} cy={-z - 0.5} r={1} fill={C.leafD} />
          <circle cx={u + w * 0.88} cy={-z - 0.4} r={0.9} fill={C.leaf} />
          <circle cx={u + w * 0.28} cy={-z - 0.9} r={0.75} fill={C.red} />
          <circle cx={u + w * 0.7} cy={-z - 1} r={0.75} fill={C.red} />
        </g>
      ) : null}
    </g>
  );
}

/** Wrought-iron railing in face space: from u0 to u1 at height z. */
export function Railing({
  u0,
  u1,
  z,
  h = 3,
  slab = true,
}: {
  u0: number;
  u1: number;
  z: number;
  h?: number;
  slab?: boolean;
}) {
  let bars = "";
  for (let u = u0 + 1; u < u1; u += 1.3) bars += `M${r2(u)},${-z} v${-h} `;
  return (
    <g>
      {slab ? (
        <rect x={u0 - 0.6} y={-z} width={u1 - u0 + 1.2} height={1.1} fill={C.stoneLine} />
      ) : null}
      <path d={bars} stroke={C.iron} strokeWidth={0.35} />
      <path
        d={`M${u0},${-z - h} H${u1} M${u0},${-z - 0.4} H${u1}`}
        stroke={C.iron}
        strokeWidth={0.7}
      />
    </g>
  );
}

/* ---------- round forms ---------- */
export function Cyl({
  x,
  y,
  r,
  z0,
  z1,
  lit,
  shade,
  top,
}: {
  x: number;
  y: number;
  r: number;
  z0: number;
  z1: number;
  lit: string;
  shade: string;
  top?: string;
}) {
  const cx = sx(x, y);
  const y0 = sy(x, y, z0);
  const y1 = sy(x, y, z1);
  const rx = r2(r * 1.4142);
  const ry = r2(r * 0.8165);
  const mx = r2(cx - rx * 0.25);
  const my = 0.968 * ry;
  return (
    <g>
      <path
        d={`M${cx - rx},${y1} L${cx - rx},${y0} A${rx},${ry} 0 0 0 ${cx + rx},${y0} L${cx + rx},${y1} Z`}
        fill={shade}
      />
      <path
        d={`M${cx - rx},${y1} L${cx - rx},${y0} A${rx},${ry} 0 0 0 ${mx},${r2(y0 + my)} L${mx},${r2(y1 + my)} A${rx},${ry} 0 0 1 ${cx - rx},${y1} Z`}
        fill={lit}
      />
      {top ? <ellipse cx={cx} cy={y1} rx={rx} ry={ry} fill={top} /> : null}
    </g>
  );
}

export function Cone({
  x,
  y,
  r,
  z,
  h,
  lit,
  shade,
  rim = false,
}: {
  x: number;
  y: number;
  r: number;
  z: number;
  h: number;
  lit: string;
  shade: string;
  rim?: boolean;
}) {
  const cx = sx(x, y);
  const by = sy(x, y, z);
  const ay = sy(x, y, z + h);
  const rx = r2(r * 1.4142);
  const ry = r2(r * 0.8165);
  return (
    <g>
      <path
        d={`M${cx - rx},${by} A${rx},${ry} 0 0 0 ${cx + rx},${by} L${cx},${ay} Z`}
        fill={shade}
      />
      <path
        d={`M${cx - rx},${by} A${rx},${ry} 0 0 0 ${r2(cx - rx * 0.2)},${r2(by + ry * 0.98)} L${cx},${ay} Z`}
        fill={lit}
      />
      {rim ? (
        <path
          d={`M${cx - rx},${by} A${rx},${ry} 0 0 0 ${cx + rx},${by}`}
          fill="none"
          stroke="#3f4a63"
          strokeWidth={1.1}
          strokeLinecap="round"
        />
      ) : null}
      {rim ? (
        <path
          d={`M${r2(cx - rx * 0.55)},${r2(by - (by - ay) * 0.12)} L${cx},${ay}`}
          stroke={C.rim}
          strokeOpacity={0.35}
          strokeWidth={0.6}
        />
      ) : null}
    </g>
  );
}

export function Dome({
  x,
  y,
  r,
  z,
  h,
  lit,
  shade,
}: {
  x: number;
  y: number;
  r: number;
  z: number;
  h: number;
  lit: string;
  shade: string;
}) {
  const cx = sx(x, y);
  const by = sy(x, y, z);
  const rx = r2(r * 1.4142);
  const ry = r2(r * 0.8165);
  return (
    <g>
      <path
        d={`M${cx - rx},${by} A${rx},${ry} 0 0 0 ${cx + rx},${by} A${rx},${h + ry} 0 0 0 ${cx - rx},${by} Z`}
        fill={shade}
      />
      <ellipse cx={cx - rx * 0.32} cy={by - h * 0.35} rx={rx * 0.55} ry={h * 0.55} fill={lit} />
    </g>
  );
}

/* ---------- ground dressing ---------- */
export function Shadow({
  x0,
  x1,
  y0,
  y1,
  o = 0.2,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  o?: number;
}) {
  const g = 3;
  const d = 5;
  return (
    <g>
      <polygon
        points={poly(
          [x0 - g + d, y0 - g - d, 0],
          [x1 + g + d, y0 - g - d, 0],
          [x1 + g + d, y1 + g - d, 0],
          [x0 - g + d, y1 + g - d, 0],
        )}
        fill={C.shadow}
        opacity={o * 0.6}
      />
      <polygon
        points={poly(
          [x0 - g, y0 - g, 0],
          [x1 + g, y0 - g, 0],
          [x1 + g, y1 + g, 0],
          [x0 - g, y1 + g, 0],
        )}
        fill={C.shadow}
        opacity={o}
      />
    </g>
  );
}

export function RoundShadow({
  x,
  y,
  r,
  o = 0.22,
}: {
  x: number;
  y: number;
  r: number;
  o?: number;
}) {
  return (
    <ellipse
      cx={sx(x, y) + r * 0.4}
      cy={sy(x, y)}
      rx={r * 1.6}
      ry={r * 0.9}
      fill={C.shadow}
      opacity={o}
    />
  );
}

export function Pot({
  x,
  y,
  s = 1,
  bloom = C.red,
}: {
  x: number;
  y: number;
  s?: number;
  bloom?: string;
}) {
  const cx = sx(x, y);
  const by = sy(x, y);
  return (
    <g>
      <ellipse cx={cx + 1.5 * s} cy={by} rx={3.6 * s} ry={1.7 * s} fill={C.shadow} opacity={0.2} />
      <path
        d={`M${cx - 2.4 * s},${by - 4 * s} L${cx - 1.8 * s},${by} L${cx + 1.8 * s},${by} L${cx + 2.4 * s},${by - 4 * s} Z`}
        fill={C.terraL}
      />
      <path
        d={`M${cx + 0.3 * s},${by - 4 * s} L${cx + 0.3 * s},${by} L${cx + 1.8 * s},${by} L${cx + 2.4 * s},${by - 4 * s} Z`}
        fill={C.terraR}
      />
      <circle cx={cx - 1.2 * s} cy={by - 5 * s} r={1.7 * s} fill={C.leafD} />
      <circle cx={cx + 1.2 * s} cy={by - 5.3 * s} r={1.7 * s} fill={C.leaf} />
      <circle cx={cx - 0.9 * s} cy={by - 6.2 * s} r={0.9 * s} fill={bloom} />
      <circle cx={cx + 1.1 * s} cy={by - 6.8 * s} r={0.9 * s} fill={bloom} />
      <circle cx={cx + 0.1 * s} cy={by - 5.4 * s} r={0.8 * s} fill={bloom} />
    </g>
  );
}

/** Parisian green bench. `along` sets the seat axis; it always faces the viewer (+y or +x). */
export function Bench({ x, y, along = "x" }: { x: number; y: number; along?: "x" | "y" }) {
  const m = (a: number, b: number, z: number): V =>
    along === "x" ? [x + a, y + b, z] : [x + b, y + a, z];
  const q = (a0: number, a1: number, b0: number, b1: number, z0: number, z1: number) =>
    poly(m(a0, b0, z0), m(a1, b0, z0), m(a1, b1, z1), m(a0, b1, z1));
  const front = (a0: number, a1: number, b: number, z0: number, z1: number) =>
    poly(m(a0, b, z0), m(a1, b, z0), m(a1, b, z1), m(a0, b, z1));
  return (
    <g>
      <polygon points={q(-6.5, 6.5, -1, 4, 0, 0)} fill={C.shadow} opacity={0.18} />
      <path
        d={`M${pt(...m(-5, 2.2, 0))} L${pt(...m(-5, 2.2, 3))} M${pt(...m(5, 2.2, 0))} L${pt(...m(5, 2.2, 3))} M${pt(...m(-5, 0, 0))} L${pt(...m(-5, 0, 7))} M${pt(...m(5, 0, 0))} L${pt(...m(5, 0, 7))}`}
        stroke={C.iron}
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      <polygon points={front(-6, 6, 0, 3.6, 7)} fill="#3f6b55" />
      <path
        d={`M${pt(...m(-6, 0, 5.3))} L${pt(...m(6, 0, 5.3))}`}
        stroke="#2c4b40"
        strokeWidth={0.45}
      />
      <polygon points={q(-6, 6, 0, 2.6, 3, 3)} fill="#4f7d63" />
      <polygon points={front(-6, 6, 2.6, 2.4, 3)} fill="#2c4b40" />
    </g>
  );
}

export function Bistro({ x, y, cloth = C.frame }: { x: number; y: number; cloth?: string }) {
  const cx = sx(x, y);
  const by = sy(x, y);
  return (
    <g>
      <ellipse cx={cx + 1} cy={by} rx={5.5} ry={2.4} fill={C.shadow} opacity={0.2} />
      {/* chairs */}
      <path
        d={`M${cx - 5},${by - 0.5} v-3.6 h2.6 v3.6 M${cx - 5},${by - 3.6} v-3.4`}
        stroke={C.redD}
        strokeWidth={0.7}
        fill="none"
      />
      <path
        d={`M${cx + 5},${by + 0.5} v-3.6 h-2.6 v3.6 M${cx + 5},${by - 2.6} v-3.4`}
        stroke={C.redD}
        strokeWidth={0.7}
        fill="none"
      />
      <path d={`M${cx},${by} v-5`} stroke={C.iron} strokeWidth={0.8} />
      <path d={`M${cx - 1.6},${by} h3.2`} stroke={C.iron} strokeWidth={0.7} />
      <ellipse cx={cx} cy={by - 5.2} rx={3.4} ry={1.5} fill={cloth} />
      <ellipse cx={cx} cy={by - 4.7} rx={3.4} ry={1.3} fill="#d9cdb8" opacity={0.6} />
      <rect x={cx - 0.5} y={by - 7.3} width={1} height={1.8} rx={0.4} fill={C.glowSoft} />
    </g>
  );
}

/** Low planter box with flowers, running along x on the ground. */
export function Planter({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const blooms = [];
  for (let x = x0 + 1.5; x < x1; x += 3) {
    blooms.push(
      <circle
        key={x}
        cx={sx(x, y + 1)}
        cy={sy(x, y + 1, 5.2)}
        r={0.95}
        fill={(x - x0) % 2 < 1 ? C.red : "#f2a7b4"}
      />,
    );
  }
  return (
    <g>
      <Box x0={x0} x1={x1} y0={y - 1} y1={y + 2.5} z1={3.5} l={C.stoneL} r={C.stoneR} t={C.leafD} />
      <polyline
        points={poly([x0, y + 1, 4.3], [x1, y + 1, 4.3])}
        stroke={C.leaf}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      {blooms}
    </g>
  );
}

/** Iso chimney with terracotta pots. */
export function Chimney({ x, y, z, h = 8 }: { x: number; y: number; z: number; h?: number }) {
  return (
    <g>
      <Box
        x0={x - 2.5}
        x1={x + 2.5}
        y0={y - 1.8}
        y1={y + 1.8}
        z0={z}
        z1={z + h}
        l="#d9b9a0"
        r="#b2918a"
        t="#e8cfb7"
      />
      <Box
        x0={x - 3}
        x1={x + 3}
        y0={y - 2.3}
        y1={y + 2.3}
        z0={z + h}
        z1={z + h + 1.2}
        l={C.stoneL}
        r={C.stoneR}
        t={C.stoneT}
        rim={false}
      />
      <Cyl
        x={x - 1}
        y={y}
        r={0.9}
        z0={z + h + 1.2}
        z1={z + h + 3.6}
        lit={C.terraL}
        shade={C.terraR}
        top="#5a3a35"
      />
      <Cyl
        x={x + 1.2}
        y={y}
        r={0.9}
        z0={z + h + 1.2}
        z1={z + h + 3}
        lit={C.terraL}
        shade={C.terraR}
        top="#5a3a35"
      />
    </g>
  );
}

/** Zig-zag lattice across a quad (bl, br, tr, tl) with n rows. */
export function lattice(q: V[], n: number) {
  const lerp = (a: V, b: V, t: number): V => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  let d = "";
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const l0 = lerp(q[0], q[3], t0);
    const l1 = lerp(q[0], q[3], t1);
    const r0 = lerp(q[1], q[2], t0);
    const rr = lerp(q[1], q[2], t1);
    d += `M${pt(...l0)} L${pt(...rr)} M${pt(...r0)} L${pt(...l1)} M${pt(...l1)} L${pt(...rr)} `;
  }
  return d;
}

/* ---------- greenery kit (few, large paths: many instances animate on phones) ---------- */
const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return v - Math.floor(v);
};

/** Many round dots in ONE path (round-capped zero-length strokes). */
export function Dots({ pts, color, r, o }: { pts: V[]; color: string; r: number; o?: number }) {
  return (
    <path
      d={pts.map((v) => `M${pt(...v)}h0`).join("")}
      stroke={color}
      strokeWidth={r * 2}
      strokeLinecap="round"
      opacity={o}
    />
  );
}

/** Clipped round tree (topiary ball on a slim trunk), optionally in a square planter. */
export function RoundTree({
  x,
  y,
  s = 1,
  box = false,
}: {
  x: number;
  y: number;
  s?: number;
  box?: boolean;
}) {
  const cx = sx(x, y);
  const base = box ? 4.5 : 0;
  const by = sy(x, y, base);
  return (
    <g>
      <ellipse
        cx={sx(x, y) + 3 * s}
        cy={sy(x, y)}
        rx={6 * s}
        ry={2.8 * s}
        fill={C.shadow}
        opacity={0.2}
      />
      {box ? (
        <Box
          x0={x - 3.2}
          x1={x + 3.2}
          y0={y - 3.2}
          y1={y + 3.2}
          z1={4.5}
          l={C.stoneL}
          r={C.stoneR}
          t="#6d5a4b"
        />
      ) : null}
      <path d={`M${cx},${by} V${by - 9 * s}`} stroke={C.woodD} strokeWidth={1.1 * s} />
      <circle cx={cx} cy={by - 13 * s} r={5.4 * s} fill={C.leafD} />
      <circle cx={cx - 1 * s} cy={by - 13.8 * s} r={4.5 * s} fill={C.leaf} />
      <circle cx={cx - 2 * s} cy={by - 15.4 * s} r={2 * s} fill={C.leafL} />
    </g>
  );
}

/** Big, airy plane tree (platane) with a mottled trunk. */
export function PlaneTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const cx = sx(x, y);
  const by = sy(x, y);
  const hi: V[] = [];
  for (let i = 0; i < 9; i++)
    hi.push([
      x - 6 * s + rnd(i + x) * 9 * s,
      y - 2 + rnd(i * 3 + y) * 4,
      (24 + rnd(i * 7) * 10) * s,
    ]);
  return (
    <g>
      <ellipse cx={cx + 6 * s} cy={by} rx={11 * s} ry={4.6 * s} fill={C.shadow} opacity={0.18} />
      <path
        d={`M${cx - 1.4 * s},${by} L${cx - 0.8 * s},${by - 16 * s} L${cx - 4 * s},${by - 22 * s} M${cx},${by - 14 * s} L${cx + 3.5 * s},${by - 22 * s}`}
        stroke="#b6a58a"
        strokeWidth={1.8 * s}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${cx - 1.1 * s},${by - 3 * s} v-3 M${cx - 0.9 * s},${by - 10 * s} v-2.4`}
        stroke="#8d7c69"
        strokeWidth={1 * s}
      />
      <path
        d="M-11,-24 a7,6.5 0 0 1 6,-9 a8,8 0 0 1 12,-2 a7,7 0 0 1 5,9 a5.5,5.5 0 0 1 -4,7.5 a7,5 0 0 1 -10,1 a6,5 0 0 1 -9,-6.5 Z"
        transform={`translate(${cx} ${by}) scale(${s})`}
        fill={C.leafD}
      />
      <path
        d="M-10,-26 a6.5,6 0 0 1 6,-8 a7,7 0 0 1 10,-1.5 a5,5 0 0 1 2,7 a6,5 0 0 1 -9,3 a5,5 0 0 1 -9,-0.5 Z"
        transform={`translate(${cx} ${by}) scale(${s})`}
        fill={C.leaf}
      />
      <Dots pts={hi} color={C.leafL} r={1.5 * s} o={0.9} />
    </g>
  );
}

/** Clipped hedge block between (x0,y0) and (x1,y1). */
export function Hedge({
  x0,
  x1,
  y0,
  y1,
  h = 5,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  h?: number;
}) {
  const tufts: V[] = [];
  const n = Math.max(2, Math.round((x1 - x0 + y1 - y0) / 3));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    tufts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, h + 0.2]);
  }
  return (
    <g>
      <polygon
        points={poly(
          [x0 + 2, y0 - 2, 0],
          [x1 + 3, y0 - 2, 0],
          [x1 + 3, y1 - 1, 0],
          [x0 + 2, y1 - 1, 0],
        )}
        fill={C.shadow}
        opacity={0.16}
      />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={h} l={C.leaf} r={C.leafD} t={C.leafL} rim={false} />
      <Dots pts={tufts} color="#b9d29b" r={1.1} o={0.8} />
    </g>
  );
}

/** Flat flower bed on the ground, edged in stone, blooms scattered in 2 paths. */
export function FlowerBed({
  x0,
  x1,
  y0,
  y1,
  seed = 1,
  colors = [C.red, "#f2a7b4"],
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  seed?: number;
  colors?: [string, string];
}) {
  const a: V[] = [];
  const b: V[] = [];
  const n = Math.round(((x1 - x0) * (y1 - y0)) / 7);
  for (let i = 0; i < n; i++) {
    const v: V = [
      x0 + 1 + rnd(i + seed) * (x1 - x0 - 2),
      y0 + 1 + rnd(i * 5 + seed * 3) * (y1 - y0 - 2),
      1.6,
    ];
    (i % 2 ? a : b).push(v);
  }
  return (
    <g>
      <Box
        x0={x0}
        x1={x1}
        y0={y0}
        y1={y1}
        z1={1}
        l={C.stoneL}
        r={C.stoneR}
        t="#6b8a59"
        rim={false}
      />
      <Dots pts={a.concat(b).map(([x, y]) => [x, y, 1.4])} color={C.leaf} r={1.4} />
      <Dots pts={a} color={colors[0]} r={0.8} />
      <Dots pts={b} color={colors[1]} r={0.8} />
    </g>
  );
}

/** Ivy patch drawn in face space (use inside FaceL / FaceR): one path of leaf dots. */
export function Ivy({ u, w, h, seed = 1 }: { u: number; w: number; h: number; seed?: number }) {
  let d = "";
  let d2 = "";
  const n = Math.round((w * h) / 5);
  for (let i = 0; i < n; i++) {
    const t = rnd(i + seed);
    const zz = rnd(i * 7 + seed) * h * (1 - Math.abs(t - 0.5) * 0.9);
    const seg = `M${(u + t * w).toFixed(1)},${(-zz).toFixed(1)}h0`;
    if (i % 3) d += seg;
    else d2 += seg;
  }
  return (
    <g strokeLinecap="round">
      <path d={d} stroke={C.leafD} strokeWidth={2.4} />
      <path d={d2} stroke={C.leaf} strokeWidth={1.8} />
    </g>
  );
}
