import type { FC } from "react";
import {
  Bench,
  Bistro,
  Box,
  C,
  Chimney,
  Cone,
  Cyl,
  Dome,
  Dots,
  FlowerBed,
  Hedge,
  Ivy,
  PlaneTree,
  RoundTree,
  FaceL,
  FaceR,
  Pot,
  Planter,
  Prism,
  Railing,
  RoundShadow,
  Shadow,
  Win,
  lattice,
  poly,
  pt,
  quad,
  sx,
  sy,
  type V,
} from "./iso";

/**
 * Contract: each building is an isometric SVG drawn in a 200-wide viewBox.
 * The plot footprint is a diamond 200 wide x 115.47 tall (true isometric, 30°)
 * whose CENTER sits at (100, VIEW_HEIGHT - 57.735) — i.e. the bottom vertex of
 * the footprint touches the bottom edge of the viewBox. Buildings rise upward
 * from that footprint and leave a ~20% margin inside it for the sidewalk.
 * All arts share the same viewBox height so they scale identically.
 * Each Art returns a single <g> to be placed inside the host's <svg>.
 */
export { VIEW_HEIGHT, VIEW_WIDTH } from "./iso";

export type ArtProps = { gilded?: boolean };
export type BuildingArt = { name: string; Art: FC<ArtProps> };

const range = (from: number, count: number, step: number) =>
  Array.from({ length: count }, (_, i) => from + i * step);

/* 2 — Street lamp: a tiny square with benches, a plane tree and flower beds. */
const StreetLamp: FC<ArtProps> = () => {
  const L = "#3b4258";
  const cx = sx(0, 0);
  return (
    <g>
      <PlaneTree x={-40} y={-10} s={1.4} />
      <RoundTree x={30} y={-30} s={0.9} box />
      <Bench x={0} y={-20} />
      <Bench x={-20} y={0} along="y" />
      <RoundShadow x={0} y={0} r={10} />
      <Cyl x={0} y={0} r={8.5} z0={0} z1={2.2} lit={C.stoneL} shade={C.stoneR} top="#e8dcc4" />
      <Cyl x={0} y={0} r={6.5} z0={2.2} z1={4.5} lit={C.stoneL} shade={C.stoneR} top={C.leafD} />
      <Dots
        pts={[
          [-4, 2, 5.2],
          [2, -5, 5.2],
          [-5, -3, 5.4],
          [4, 1, 5],
          [0, 5, 5],
          [-1, -6, 5.4],
        ]}
        color={C.leaf}
        r={1.9}
      />
      <Dots
        pts={[
          [-3, -3, 6.4],
          [3, 0, 6.2],
          [-2, 4, 6],
          [1, -5, 6.4],
        ]}
        color={C.red}
        r={0.95}
      />
      <Dots
        pts={[
          [0, 1, 6.2],
          [-5, 0, 6.2],
          [4, -3, 6.2],
        ]}
        color="#f2a7b4"
        r={0.9}
      />
      {/* fluted cast-iron base */}
      <Cyl x={0} y={0} r={2.8} z0={4.5} z1={7} lit={L} shade={C.iron} top="#4b5470" />
      <Cyl x={0} y={0} r={2} z0={7} z1={16} lit={L} shade={C.iron} top="#4b5470" />
      <path
        d={`M${cx - 1},${sy(0, 0, 8)} V${sy(0, 0, 15)} M${cx + 0.6},${sy(0, 0, 8) + 1} V${sy(0, 0, 15) + 1}`}
        stroke="#5b6584"
        strokeWidth={0.4}
      />
      <Cyl x={0} y={0} r={0.9} z0={16} z1={62} lit={L} shade={C.iron} />
      {[16, 24, 42].map((z) => (
        <Cyl key={z} x={0} y={0} r={1.5} z0={z} z1={z + 1.6} lit={L} shade={C.iron} />
      ))}
      {/* ladder rest crossbar + scrolls */}
      <path
        d={`M${pt(-5, 0, 53)} L${pt(5, 0, 53)}`}
        stroke={C.iron}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path
        d={`M${pt(-5, 0, 53)} q-1.5,-2.5 0.5,-3.5 M${pt(5, 0, 53)} q1.5,-2.5 -0.5,-3.5 M${cx},${sy(0, 0, 58)} q-3,0 -3,3 M${cx},${sy(0, 0, 58)} q3,0 3,3`}
        stroke={C.iron}
        strokeWidth={0.7}
        fill="none"
      />
      <ellipse cx={cx} cy={sy(0, 0, 67)} rx={15} ry={13} fill={C.glow} opacity={0.16} />
      <Prism
        b={quad(-2.2, 2.2, -2.2, 2.2, 62)}
        t={quad(-1.6, 1.6, -1.6, 1.6, 63.5)}
        l={L}
        r={C.iron}
        top="#4b5470"
      />
      <Prism
        b={quad(-1.8, 1.8, -1.8, 1.8, 63.5)}
        t={quad(-3.2, 3.2, -3.2, 3.2, 72)}
        l={C.glow}
        r="#e8b75e"
      />
      <path
        d={`M${pt(-3.2, 3.2, 72)} L${pt(-1.8, 1.8, 63.5)} M${pt(3.2, 3.2, 72)} L${pt(1.8, 1.8, 63.5)} M${pt(3.2, -3.2, 72)} L${pt(1.8, -1.8, 63.5)}`}
        stroke={C.iron}
        strokeWidth={0.6}
      />
      <Prism
        b={quad(-4, 4, -4, 4, 72)}
        t={quad(-1.2, 1.2, -1.2, 1.2, 77)}
        l={L}
        r={C.iron}
        top="#4b5470"
      />
      <Dots
        pts={[
          [-4, 4, 72.6],
          [4, 4, 72.6],
          [4, -4, 72.6],
        ]}
        color={C.iron}
        r={0.7}
      />
      <path d={`M${cx},${sy(0, 0, 77)} V${sy(0, 0, 81)}`} stroke={C.iron} strokeWidth={0.8} />
      <circle cx={cx} cy={sy(0, 0, 81.5)} r={1.1} fill={C.iron} />
      <Hedge x0={-38} x1={-12} y0={26} y1={30} h={4} />
      <FlowerBed x0={14} x1={30} y0={14} y1={26} seed={3} />
      <Pot x={28} y={-6} />
      <Pot x={-8} y={30} s={0.85} bloom="#f2a7b4" />
    </g>
  );
};

/* 4 — Morris column, on a little square with benches */
const MorrisColumn: FC<ArtProps> = () => {
  const cx = sx(0, 0);
  const fy = (z: number) => sy(0, 0, z) + 6;
  return (
    <g>
      <PlaneTree x={-40} y={-12} s={1.4} />
      <RoundTree x={30} y={-30} s={0.9} box />
      <RoundTree x={-30} y={30} s={0.9} box />
      <Bench x={0} y={-22} />
      <Bench x={-22} y={0} along="y" />
      <RoundShadow x={0} y={0} r={14} />
      <Cyl x={0} y={0} r={11.5} z0={0} z1={5} lit="#3f6b55" shade="#2c4b40" top="#4d7c64" />
      <path
        d={[-12, -6, 0, 6, 12]
          .map((d) => `M${cx + d},${sy(0, 0, 0) + 9.4 - Math.abs(d) * 0.3} v-4`)
          .join("")}
        stroke="#24403a"
        strokeWidth={0.6}
      />
      <Cyl x={0} y={0} r={10} z0={5} z1={46} lit="#4f7d63" shade="#335646" />
      {/* posters */}
      <path
        d={`M${cx - 12},${fy(42) - 3} L${cx - 2},${fy(42) + 1} L${cx - 2},${fy(26) + 1} L${cx - 12},${fy(26) - 3} Z`}
        fill="#f3e3c0"
      />
      <path
        d={`M${cx - 10},${fy(40) - 2} L${cx - 4},${fy(40)} L${cx - 4},${fy(33)} L${cx - 10},${fy(33) - 2} Z`}
        fill={C.red}
      />
      <path
        d={`M${cx - 10},${fy(31)} L${cx - 4},${fy(31) + 2}`}
        stroke={C.iron}
        strokeWidth={0.7}
      />
      <path
        d={`M${cx},${fy(44) + 1} L${cx + 9},${fy(44) - 2} L${cx + 9},${fy(28) - 2} L${cx},${fy(28) + 1} Z`}
        fill="#e9b949"
      />
      <circle cx={cx + 4.5} cy={fy(38)} r={2.6} fill="#2f4f7a" />
      <path
        d={`M${cx + 1.5},${fy(31)} L${cx + 7.5},${fy(31) - 2}`}
        stroke={C.iron}
        strokeWidth={0.7}
      />
      <path
        d={`M${cx - 13},${fy(22) - 3.5} L${cx - 3},${fy(22) + 0.6} L${cx - 3},${fy(9) + 0.6} L${cx - 13},${fy(9) - 3.5} Z`}
        fill="#bcd3d6"
      />
      <path
        d={`M${cx - 11},${fy(19) - 2.4} L${cx - 5},${fy(19)} M${cx - 11},${fy(16) - 2.4} L${cx - 5},${fy(16)}`}
        stroke="#2f4f7a"
        strokeWidth={0.8}
      />
      <path
        d={`M${cx - 1},${fy(24) + 1} L${cx + 10},${fy(24) - 2.5} L${cx + 10},${fy(9) - 2.5} L${cx - 1},${fy(9) + 1} Z`}
        fill="#d78f7a"
        opacity={0.85}
      />
      <Cyl x={0} y={0} r={11.4} z0={46} z1={50} lit="#3f6b55" shade="#2c4b40" top="#4d7c64" />
      <Cyl x={0} y={0} r={9.5} z0={50} z1={53} lit="#e9dcc0" shade="#bba99c" top="#4d7c64" />
      <path
        d={[-10, -5, 0, 5, 10]
          .map((d) => `M${cx + d},${fy(51.6) - 6 + 6 - Math.abs(d) * 0.25 + 4} h-1.8 v-1.6 h1.8 Z`)
          .join("")}
        fill="#2f4f7a"
      />
      <Dome x={0} y={0} r={9.5} z={53} h={10} lit="#5d8c70" shade="#3c634f" />
      <Dots
        pts={Array.from({ length: 9 }, (_, i): V => {
          const t = Math.PI * (-0.2 + (i / 8) * 0.9);
          return [Math.cos(t) * 9.6, Math.sin(t) * 9.6, 53.6];
        })}
        color="#e9b949"
        r={0.8}
      />
      <Cyl x={0} y={0} r={1.4} z0={60} z1={66} lit="#4f7d63" shade="#335646" />
      <circle cx={cx} cy={sy(0, 0, 67)} r={1.8} fill="#e9b949" />
      <FlowerBed x0={16} x1={30} y0={12} y1={26} seed={7} />
      <Hedge x0={-38} x1={-14} y0={34} y1={38} h={4} />
      <Pot x={26} y={-6} />
    </g>
  );
};

/* 8 — Boulangerie */
const Boulangerie: FC<ArtProps> = () => {
  const blue = "#3b5f8f";
  const blueR = "#2d4870";
  return (
    <g>
      <Shadow x0={-26} x1={24} y0={-20} y1={20} />
      <PlaneTree x={-40} y={-12} s={1.3} />
      <RoundTree x={-8} y={-36} s={0.9} box />
      <PlaneTree x={20} y={-40} s={1.05} />
      <Box x0={-26} x1={24} y0={-20} y1={20} z1={30} l={C.stoneL} r={C.stoneR} />
      {/* blue shopfront on the left face */}
      <FaceL x={-26} y={20}>
        <rect x={3} y={-26} width={44} height={26} fill={blue} />
        <rect x={3} y={-26} width={44} height={6} fill="#2c4a73" />
        <path d="M8,-23 h34" stroke="#e9c46a" strokeWidth={1.4} strokeDasharray="2.2 1" />
        <rect x={6} y={-18} width={15} height={13} fill={C.glow} />
        <rect x={29} y={-18} width={15} height={13} fill={C.glow} />
        {[8, 31].map((u) => (
          <g key={u}>
            <path
              d={`M${u},-7 l10,-6 M${u + 1},-6 l10,-6 M${u + 2},-9 l9,-5.5`}
              stroke="#c8873f"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <circle cx={u + 4} cy={-14} r={1.6} fill="#d79a52" />
            <circle cx={u + 8} cy={-15} r={1.6} fill="#c8873f" />
          </g>
        ))}
        <rect x={22.5} y={-19} width={5} height={19} fill="#25395a" />
        <rect x={23.3} y={-18} width={3.4} height={11} fill={C.glowSoft} opacity={0.7} />
        <rect x={3} y={-1.5} width={44} height={1.5} fill="#253c5e" />
      </FaceL>
      <FaceR x={24} y={20}>
        <rect x={3} y={-26} width={34} height={26} fill={blueR} />
        <rect x={7} y={-18} width={12} height={13} fill="#e3b867" />
        <path
          d="M9,-7 l9,-6 M10,-6 l8,-5"
          stroke="#b07a3a"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <rect x={23} y={-18} width={10} height={13} fill={C.glassR} />
        <path d="M6,-23 h28" stroke="#d7b45a" strokeWidth={1.3} strokeDasharray="2.2 1" />
      </FaceR>
      {/* striped awning over the shopfront */}
      {range(-23, 11, 4).map((x, i) => (
        <polygon
          key={x}
          points={poly([x, 20, 20], [x + 4, 20, 20], [x + 4, 27, 15], [x, 27, 15])}
          fill={i % 2 ? "#f6efe0" : "#5e86b8"}
        />
      ))}
      <polygon
        points={poly([-23, 27, 15], [21, 27, 15], [21, 27, 13.6], [-23, 27, 13.6])}
        fill="#2c4a73"
      />
      {/* terracotta roof, ridge along x */}
      <polygon
        points={poly([-28, 22, 30], [26, 22, 30], [26, 0, 46], [-28, 0, 46])}
        fill={C.terraL}
      />
      {range(-24, 13, 4.2).map((x) => (
        <path
          key={x}
          d={`M${pt(x, 22, 30)} L${pt(x, 0, 46)}`}
          stroke={C.terraR}
          strokeOpacity={0.35}
          strokeWidth={0.6}
        />
      ))}
      <polygon points={poly([24, 20, 30], [24, -20, 30], [24, 0, 44.5])} fill={C.stoneR} />
      <polygon
        points={poly(
          [26, 22, 30],
          [26, 0, 46],
          [26, -22, 30],
          [26.5, -22, 29],
          [26.5, 0, 45],
          [26.5, 22, 29],
        )}
        fill="#8f4f42"
      />
      <path
        d={`M${pt(-28, 0, 46)} L${pt(26, 0, 46)}`}
        stroke={C.terraT}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <FaceR x={24} y={20} z={30}>
        <Win u={17} z={2} w={6} h={7} right arch />
      </FaceR>
      <Chimney x={-14} y={-4} z={36} h={14} />
      {/* bread sign */}
      <path d={`M${pt(-6, 20, 25)} L${pt(-6, 26, 25)}`} stroke={C.iron} strokeWidth={0.6} />
      <circle
        cx={sx(-6, 26)}
        cy={sy(-6, 26, 22)}
        r={3}
        fill="#e9c46a"
        stroke={C.iron}
        strokeWidth={0.5}
      />
      <Pot x={-30} y={28} />
      <Bench x={6} y={34} />
      <Hedge x0={-42} x1={-32} y0={26} y1={30} h={4} />
      <FlowerBed x0={30} x1={40} y0={-18} y1={2} seed={10} />
      <RoundTree x={34} y={22} s={0.8} box />
    </g>
  );
};

/* 16 — Café */
const Cafe: FC<ArtProps> = () => {
  const wine = "#7b2e35";
  const wineR = "#5e2430";
  const x0 = -26;
  const x1 = 22;
  const y0 = -22;
  const y1 = 24;
  const floors = [20, 36];
  return (
    <g>
      <Shadow x0={x0} x1={x1} y0={y0} y1={y1} />
      <PlaneTree x={-40} y={-16} s={1.3} />
      <RoundTree x={26} y={-38} s={0.9} box />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={52} l={C.stoneL} r={C.stoneR} />
      <FaceL x={x0} y={y1}>
        <rect x={0} y={-18} width={48} height={18} fill={wine} />
        {[3, 15, 27, 39].map((u, i) => (
          <rect key={u} x={u} y={-14} width={7.5} height={13} fill={i === 1 ? "#3b2a33" : C.glow} />
        ))}
        <rect x={0} y={-18} width={48} height={1.4} fill="#e9c46a" />
        {floors.map((z) => (
          <g key={z}>
            {[4, 15, 26, 37].map((u, i) => (
              <Win key={u} u={u} z={z + 2} w={6} h={10} glow={z === 36 && i === 2} />
            ))}
            {z === 20 ? <Railing u0={2} u1={46} z={22} /> : null}
          </g>
        ))}
        <rect x={0} y={-51} width={48} height={1.6} fill={C.stoneLine} />
      </FaceL>
      <FaceR x={x1} y={y1}>
        <rect x={0} y={-18} width={46} height={18} fill={wineR} />
        {[4, 16, 28].map((u) => (
          <rect
            key={u}
            x={u}
            y={-14}
            width={8}
            height={13}
            fill={u === 16 ? "#e3b867" : C.glassR}
          />
        ))}
        <rect x={0} y={-18} width={46} height={1.4} fill="#c9a557" />
        {floors.map((z) => (
          <g key={z}>
            {[5, 18, 31].map((u) => (
              <Win key={u} u={u} z={z + 2} w={6} h={10} right flowers={z === 20} />
            ))}
          </g>
        ))}
        <rect x={0} y={-51} width={46} height={1.6} fill="#b8a99e" />
      </FaceR>
      {/* red awnings */}
      {range(x0 + 1, 12, 4).map((x, i) => (
        <polygon
          key={`l${x}`}
          points={poly([x, y1, 18.5], [x + 4, y1, 18.5], [x + 4, y1 + 7, 13.5], [x, y1 + 7, 13.5])}
          fill={i % 2 ? "#f6efe0" : C.red}
        />
      ))}
      {range(y1 - 1, 11, -4).map((y, i) => (
        <polygon
          key={`r${y}`}
          points={poly([x1, y, 18.5], [x1, y - 4, 18.5], [x1 + 7, y - 4, 13.5], [x1 + 7, y, 13.5])}
          fill={i % 2 ? "#e6dccb" : C.redD}
        />
      ))}
      {/* zinc mansard with dormers */}
      <Prism
        b={quad(x0 - 1, x1 + 1, y0 - 1, y1 + 1, 52)}
        t={quad(x0 + 6, x1 - 6, y0 + 6, y1 - 6, 66)}
        l={C.zincL}
        r={C.zincR}
        top={C.zincT}
      />
      {[-18, -4, 10].map((x) => (
        <g key={x}>
          <Box
            x0={x}
            x1={x + 6}
            y0={y1 - 4}
            y1={y1 - 1.5}
            z0={53}
            z1={61}
            l={C.stoneL}
            r={C.stoneR}
            rim={false}
          />
          <FaceL x={x} y={y1 - 1.5} z={53}>
            <Win u={1.4} z={1} w={3.2} h={5} arch glow={x === -4} />
          </FaceL>
          <polygon
            points={poly([x - 0.5, y1 - 1, 61], [x + 6.5, y1 - 1, 61], [x + 3, y1 - 1, 64])}
            fill={C.stoneL}
          />
          <polygon
            points={poly(
              [x + 6.5, y1 - 1, 61],
              [x + 6.5, y1 - 5, 61],
              [x + 3, y1 - 5, 64],
              [x + 3, y1 - 1, 64],
            )}
            fill={C.zincR}
          />
        </g>
      ))}
      <Chimney x={-10} y={-8} z={64} h={8} />
      <Chimney x={8} y={-8} z={64} h={6} />
      <Bistro x={-16} y={36} />
      <Bistro x={2} y={36} />
      <Bistro x={34} y={-6} />
      <Pot x={34} y={14} s={0.9} />
      <Hedge x0={34} x1={38} y0={-38} y1={-16} h={4} />
      <FlowerBed x0={-42} x1={-30} y0={30} y1={42} seed={13} />
    </g>
  );
};

/* 32 — Maison normande */
const MaisonNormande: FC<ArtProps> = () => {
  const x0 = -24;
  const x1 = 22;
  const y0 = -16;
  const y1 = 18;
  const H = 30;
  const timber = "#6b4a3a";
  const plaster = "#f5ecd8";
  const plasterR = "#d4c6bd";
  const beams = (w: number, right: boolean) => {
    const n = Math.floor(w / 6.5);
    const step = w / n;
    return (
      <g
        stroke={timber}
        strokeWidth={1.5}
        strokeLinecap="square"
        fill="none"
        opacity={right ? 0.85 : 1}
      >
        <path d={`M0,-1 H${w} M0,-14 H${w} M0,-${H - 0.8} H${w}`} strokeWidth={2} />
        {range(0, n + 1, step).map((u, i) => (
          <path
            key={u}
            d={`M${u},0 V-${H}${i % 2 && i < n ? ` M${u},-14 L${u + step},-${H}` : ""}`}
          />
        ))}
      </g>
    );
  };
  return (
    <g>
      <Shadow x0={x0} x1={x1} y0={y0} y1={y1} />
      <PlaneTree x={-40} y={-26} s={1.35} />
      <RoundTree x={-8} y={-34} s={1} />
      <PlaneTree x={24} y={-38} s={1.05} />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={H} l={plaster} r={plasterR} />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={3} l="#c9b49a" r="#a99790" rim={false} />
      <FaceL x={x0} y={y1}>
        {beams(x1 - x0, false)}
        <Ivy u={40} w={6} h={22} seed={3} />
        <Win u={5} z={17} w={5} h={7} shutters="#5f8a6a" flowers />
        <Win u={34} z={17} w={5} h={7} shutters="#5f8a6a" flowers glow />
        <Win u={6} z={4} w={5} h={7} shutters="#5f8a6a" />
        <rect x={20} y={-13} width={6} height={13} fill="#5f8a6a" />
        <circle cx={24.6} cy={-6} r={0.5} fill="#e9c46a" />
        <Win u={33} z={4} w={6} h={7} glow />
      </FaceL>
      {/* steep roof, ridge along x */}
      <polygon
        points={poly(
          [x0 - 2, y1 + 3, H - 1],
          [x1 + 2, y1 + 3, H - 1],
          [x1 + 2, 1, H + 28],
          [x0 - 2, 1, H + 28],
        )}
        fill="#b07a55"
      />
      {range(x0 + 1, 11, 4.4).map((x) => (
        <path
          key={x}
          d={`M${pt(x, y1 + 3, H - 1)} L${pt(x, 1, H + 28)}`}
          stroke="#8c5a43"
          strokeOpacity={0.35}
          strokeWidth={0.7}
        />
      ))}
      <path
        d={`M${pt(x0 - 2, y1 + 3, H - 1)} L${pt(x1 + 2, y1 + 3, H - 1)}`}
        stroke="#8c5a43"
        strokeWidth={1.2}
      />
      <polygon points={poly([x1, y1, H], [x1, y0, H], [x1, 1, H + 26])} fill={plasterR} />
      <FaceR x={x1} y={y1}>
        {beams(y1 - y0, true)}
        <g stroke={timber} strokeWidth={1.4} opacity={0.85}>
          <path
            d={`M17,-${H} V-${H + 26} M8,-${H} L17,-${H + 20} M26,-${H} L17,-${H + 20} M4,-${H + 6} H30`}
          />
        </g>
        <Win u={7} z={15} w={6} h={8} right flowers />
        <Win u={21} z={15} w={6} h={8} right flowers />
        <Win u={14} z={H + 7} w={6} h={7} right glow />
        <Win u={14} z={4} w={6} h={7} right />
      </FaceR>
      <polygon
        points={poly(
          [x1 + 2, y1 + 3, H - 1],
          [x1 + 2, 1, H + 28],
          [x1 + 2, y0 - 3, H - 1],
          [x1 + 3, y0 - 3, H - 2],
          [x1 + 3, 1, H + 27],
          [x1 + 3, y1 + 3, H - 2],
        )}
        fill="#7b4f3c"
      />
      <path
        d={`M${pt(x0 - 2, 1, H + 28)} L${pt(x1 + 2, 1, H + 28)}`}
        stroke="#5f8a6a"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      {range(x0 + 2, 8, 6).map((x) => (
        <circle key={x} cx={sx(x, 1)} cy={sy(x, 1, H + 29.5)} r={1.1} fill="#8a79c2" />
      ))}
      <Chimney x={-12} y={-4} z={H + 22} h={9} />
      <Pot x={-28} y={26} />
      <Planter x0={-14} x1={6} y={28} />
      <Hedge x0={32} x1={36} y0={-30} y1={10} h={5} />
      <FlowerBed x0={-42} x1={-32} y0={22} y1={38} seed={14} colors={["#8a79c2", "#f2a7b4"]} />
      <RoundTree x={34} y={24} s={0.8} />
    </g>
  );
};

/* 64 — Immeuble haussmannien */
const Haussmann: FC<ArtProps> = () => {
  const x0 = -28;
  const x1 = 26;
  const y0 = -24;
  const y1 = 24;
  const top = 90;
  const lw = x1 - x0;
  const rw = y1 - y0;
  const floorZ = [18, 32, 46, 60, 74];
  const lu = range(4, 6, 8.7);
  const ru = range(4, 5, 8.8);
  const glowL = new Set(["46-3", "74-1", "32-5"]);
  return (
    <g>
      <Shadow x0={x0} x1={x1} y0={y0} y1={y1} />
      <PlaneTree x={-42} y={-22} s={1.4} />
      <PlaneTree x={18} y={-42} s={1.2} />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={top} l={C.stoneL} r={C.stoneR} />
      <FaceL x={x0} y={y1}>
        {/* rusticated ground floor */}
        {range(3, 5, 3.4).map((z) => (
          <path key={z} d={`M0,-${z} H${lw}`} stroke={C.stoneLine} strokeWidth={0.5} />
        ))}
        {lu.map((u, i) => (
          <Win key={u} u={u} z={1} w={5.4} h={13} arch glow={i === 2} />
        ))}
        {floorZ.map((z) => (
          <g key={z}>
            <rect x={0} y={-z} width={lw} height={1} fill={C.stoneLine} />
            {lu.map((u, i) => (
              <Win
                key={u}
                u={u}
                z={z + 2.2}
                w={5.4}
                h={z === 74 ? 8.6 : 9.6}
                glow={glowL.has(`${z}-${i}`)}
                flowers={z === 46 && i % 2 === 0}
              />
            ))}
          </g>
        ))}
        <Railing u0={0.8} u1={lw - 0.8} z={34} />
        <Railing u0={0.8} u1={lw - 0.8} z={76} />
        {lu.map((u) => (
          <g key={u}>
            <Railing u0={u - 0.3} u1={u + 5.7} z={48.2} h={2.4} slab={false} />
            <Railing u0={u - 0.3} u1={u + 5.7} z={62.2} h={2.4} slab={false} />
          </g>
        ))}
        <rect x={0} y={-top} width={lw} height={2.2} fill={C.stoneLine} />
      </FaceL>
      <FaceR x={x1} y={y1}>
        {range(3, 5, 3.4).map((z) => (
          <path key={z} d={`M0,-${z} H${rw}`} stroke="#b4a39e" strokeWidth={0.5} />
        ))}
        {ru.map((u, i) => (
          <Win key={u} u={u} z={1} w={5.4} h={13} arch right glow={i === 3} />
        ))}
        {floorZ.map((z) => (
          <g key={z}>
            <rect x={0} y={-z} width={rw} height={1} fill="#b4a39e" />
            {ru.map((u, i) => (
              <Win
                key={u}
                u={u}
                z={z + 2.2}
                w={5.4}
                h={z === 74 ? 8.6 : 9.6}
                right
                glow={z === 60 && i === 1}
              />
            ))}
          </g>
        ))}
        <Railing u0={0.8} u1={rw - 0.8} z={34} />
        <Railing u0={0.8} u1={rw - 0.8} z={76} />
        <rect x={0} y={-top} width={rw} height={2.2} fill="#b4a39e" />
      </FaceR>
      {/* mansard */}
      <Prism
        b={quad(x0 - 1, x1 + 1, y0 - 1, y1 + 1, top)}
        t={quad(x0 + 6, x1 - 6, y0 + 6, y1 - 6, top + 16)}
        l={C.zincL}
        r={C.zincR}
        top={C.zincT}
      />
      {range(x0 + 4, 5, 10.6).map((x, i) => (
        <g key={x}>
          <Box
            x0={x}
            x1={x + 5}
            y0={y1 - 4}
            y1={y1 - 1.6}
            z0={top + 1}
            z1={top + 9}
            l={C.stoneL}
            r={C.stoneR}
            rim={false}
          />
          <FaceL x={x} y={y1 - 1.6} z={top + 1}>
            <Win u={1.1} z={1} w={2.8} h={5} arch glow={i === 3} />
          </FaceL>
          <Cone x={x + 2.5} y={y1 - 2.8} r={2.6} z={top + 9} h={3} lit={C.zincT} shade={C.zincR} />
        </g>
      ))}
      {range(y1 - 7, 4, -10.5).map((y) => (
        <g key={y}>
          <Box
            x0={x1 - 4}
            x1={x1 - 1.6}
            y0={y - 5}
            y1={y}
            z0={top + 1}
            z1={top + 9}
            l={C.stoneL}
            r={C.stoneR}
            rim={false}
          />
          <FaceR x={x1 - 1.6} y={y} z={top + 1}>
            <Win u={1.1} z={1} w={2.8} h={5} arch right />
          </FaceR>
        </g>
      ))}
      <Chimney x={-14} y={-6} z={top + 14} h={8} />
      <Chimney x={4} y={-6} z={top + 14} h={10} />
      <Chimney x={-4} y={8} z={top + 14} h={6} />
      <PlaneTree x={-42} y={32} s={1} />
      <Hedge x0={34} x1={38} y0={-22} y1={14} h={4} />
      <FlowerBed x0={-30} x1={-6} y0={32} y1={40} seed={12} />
      <RoundTree x={36} y={-34} s={0.85} box />
      <Pot x={34} y={22} />
    </g>
  );
};

/* 128 — Église */
const Eglise: FC<ArtProps> = () => {
  const stone = "#ece0c6";
  const stoneR = "#c5b5af";
  return (
    <g>
      <Shadow x0={-32} x1={30} y0={-14} y1={14} />
      <PlaneTree x={-42} y={-26} s={1.3} />
      <RoundTree x={-4} y={-30} s={1} />
      <PlaneTree x={30} y={-36} s={1.05} />
      {/* nave */}
      <Box x0={-32} x1={12} y0={-13} y1={13} z1={34} l={stone} r={stoneR} />
      <FaceL x={-32} y={13}>
        <Ivy u={0} w={7} h={26} seed={5} />
        {range(5, 4, 10).map((u) => (
          <g key={u}>
            <Win u={u} z={10} w={5} h={16} arch glow={u === 25} />
            <rect x={u - 2.6} y={-34} width={1.8} height={34} fill="#dccfb3" />
          </g>
        ))}
      </FaceL>
      <polygon
        points={poly([-34, 15, 33], [12, 15, 33], [12, 0, 52], [-34, 0, 52])}
        fill={C.slateL}
      />
      <path d={`M${pt(-34, 15, 33)} L${pt(12, 15, 33)}`} stroke="#4c5873" strokeWidth={1} />
      <path
        d={`M${pt(-34, 0, 52)} L${pt(12, 0, 52)}`}
        stroke="#8fa0ba"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      {/* bell tower (façade, facing south-east) */}
      <Box x0={12} x1={30} y0={-10} y1={10} z1={78} l={stone} r={stoneR} />
      <Box x0={11} x1={31} y0={-11} y1={11} z0={50} z1={52} l="#dccfb3" r="#b3a39d" rim={false} />
      <FaceL x={12} y={10}>
        <Win u={6} z={56} w={6} h={14} arch />
        <path d="M7,-63 h4 M7,-66 h4 M7,-60 h4" stroke={C.frame} strokeWidth={0.6} />
        <Win u={7} z={30} w={4} h={10} arch />
      </FaceL>
      <FaceR x={30} y={10}>
        <path d="M5,0 V-20 A5,5 0 0 1 15,-20 V0 Z" fill="#e3d6bb" />
        <path d="M6.2,0 V-19.5 A3.8,3.8 0 0 1 13.8,-19.5 V0 Z" fill={C.wood} />
        <path d="M10,0 V-23" stroke={C.woodD} strokeWidth={0.6} />
        <circle cx={10} cy={-34} r={5} fill="#e3d6bb" />
        <circle cx={10} cy={-34} r={3.8} fill="#c7d3e8" />
        <path d="M10,-37.8 V-30.2 M6.2,-34 H13.8" stroke="#8c7d97" strokeWidth={0.5} />
        <Win u={7} z={56} w={6} h={14} arch right />
        <path d="M8,-63 h4 M8,-66 h4 M8,-60 h4" stroke="#c9bdb4" strokeWidth={0.6} />
        <circle cx={10} cy={-45} r={3.2} fill={C.frame} />
        <path d="M10,-45 v-2.2 M10,-45 l1.6,0.8" stroke={C.iron} strokeWidth={0.5} />
      </FaceR>
      <Box x0={11} x1={31} y0={-11} y1={11} z0={78} z1={80} l="#dccfb3" r="#b3a39d" />
      <Prism b={quad(12, 30, -10, 10, 80)} t={quad(21, 21, 0, 0, 132)} l={C.slateL} r={C.slateR} />
      <path d={`M${pt(30, 10, 80)} L${pt(21, 0, 132)}`} stroke="#9aaac2" strokeWidth={0.6} />
      <path
        d={`M${sx(21, 0)},${sy(21, 0, 132)} v-9 M${sx(21, 0) - 2.6},${sy(21, 0, 138)} h5.2`}
        stroke="#b08a3e"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Hedge x0={-34} x1={6} y0={30} y1={33} h={4} />
      <Bench x={-12} y={22} />
      <FlowerBed x0={34} x1={42} y0={8} y1={20} seed={2} />
      <FlowerBed x0={34} x1={42} y0={-22} y1={-10} seed={8} />
      <RoundTree x={-42} y={26} s={0.85} box />
    </g>
  );
};

/* 256 — Château */
const Chateau: FC<ArtProps> = () => {
  const stone = "#f3e9d3";
  const stoneR = "#cdbfb8";
  const tower = (x: number, y: number, r: number, h: number, roof: number) => (
    <g>
      <Cyl x={x} y={y} r={r} z0={0} z1={h} lit={stone} shade={stoneR} />
      <Cyl x={x} y={y} r={r + 0.8} z0={h - 3} z1={h} lit="#e4d6bc" shade="#b9aaa3" />
      <path
        d={`M${sx(x, y) - 2.2},${sy(x, y, h * 0.7)} v-6 a2.2,2.2 0 0 1 4.4,0 v6 Z M${sx(x, y) - 2.2},${sy(x, y, h * 0.35)} v-6 a2.2,2.2 0 0 1 4.4,0 v6 Z`}
        fill={C.glass}
      />
      <Cone x={x} y={y} r={r + 1.6} z={h} h={roof} lit="#8294b0" shade={C.slateR} rim />
      <path d={`M${sx(x, y)},${sy(x, y, h + roof)} v-5`} stroke="#b08a3e" strokeWidth={0.8} />
      <circle cx={sx(x, y)} cy={sy(x, y, h + roof + 5)} r={0.9} fill="#e9c46a" />
    </g>
  );
  return (
    <g>
      <Shadow x0={-30} x1={22} y0={-26} y1={22} />
      <PlaneTree x={-42} y={-34} s={1.3} />
      <PlaneTree x={-4} y={-42} s={1.1} />
      {tower(14, -20, 7, 40, 26)}
      {tower(-28, 12, 7, 40, 26)}
      <Box x0={-24} x1={12} y0={-18} y1={12} z1={40} l={stone} r={stoneR} />
      <FaceL x={-24} y={12}>
        <Ivy u={0} w={5} h={30} seed={8} />
        {range(5, 4, 8).map((u, i) => (
          <g key={u}>
            <Win u={u} z={22} w={4.4} h={10} glow={i === 1} flowers />
            <Win u={u} z={5} w={4.4} h={10} arch />
          </g>
        ))}
        <rect x={0} y={-19} width={36} height={1} fill="#dccfb3" />
        <rect x={0} y={-40} width={36} height={2} fill="#dccfb3" />
      </FaceL>
      <FaceR x={12} y={12}>
        {range(6, 3, 9).map((u) => (
          <g key={u}>
            <Win u={u} z={22} w={4.4} h={10} right />
            <Win u={u} z={5} w={4.4} h={10} right arch />
          </g>
        ))}
        <rect x={0} y={-40} width={30} height={2} fill="#b8a99e" />
      </FaceR>
      <Prism
        b={quad(-25, 13, -19, 13, 40)}
        t={[
          [-12, -3, 66],
          [0, -3, 66],
          [0, -3, 66],
          [-12, -3, 66],
        ]}
        l={C.zincL}
        r={C.zincR}
      />
      {[-18, -8, 2].map((x) => (
        <g key={x}>
          <Box
            x0={x}
            x1={x + 5}
            y0={9}
            y1={11.5}
            z0={40}
            z1={49}
            l={stone}
            r={stoneR}
            rim={false}
          />
          <FaceL x={x} y={11.5} z={40}>
            <Win u={1.1} z={1.2} w={2.8} h={5} glow={x === -8} />
          </FaceL>
          <polygon
            points={poly([x - 0.4, 11.8, 49], [x + 5.4, 11.8, 49], [x + 2.5, 11.8, 54])}
            fill={stone}
          />
          <polygon
            points={poly(
              [x + 5.4, 11.8, 49],
              [x + 5.4, 7, 49],
              [x + 2.5, 7, 54],
              [x + 2.5, 11.8, 54],
            )}
            fill={C.slateR}
          />
        </g>
      ))}
      <Chimney x={-15} y={-6} z={56} h={10} />
      <Chimney x={-1} y={-6} z={56} h={12} />
      {tower(14, 14, 9, 56, 34)}
      <path
        d={`M${sx(14, 14)},${sy(14, 14, 95)} l0,-6 l6,1.6 l-6,1.6`}
        fill={C.red}
        stroke="#b08a3e"
        strokeWidth={0.5}
      />
      <Hedge x0={-36} x1={-4} y0={30} y1={33} h={3.5} />
      <FlowerBed x0={-30} x1={-6} y0={35} y1={43} seed={6} />
      <RoundTree x={-40} y={30} s={0.85} box />
      <RoundTree x={36} y={-32} s={0.85} box />
      <RoundTree x={34} y={34} s={0.75} box />
      <Pot x={0} y={30} s={1.1} />
    </g>
  );
};

/* Face-space path helpers (one path for many arches keeps the shape count low). */
const archD = (u: number, w: number, z: number, h: number) =>
  `M${u},${-z} V${-(z + h - w / 2)} A${w / 2},${w / 2} 0 0 1 ${u + w},${-(z + h - w / 2)} V${-z} Z`;
const arches = (us: number[], w: number, z: number, h: number) =>
  us.map((u) => archD(u, w, z, h)).join("");
const faceDots = (ps: [number, number][]) => ps.map(([u, z]) => `M${u},${-z}h0`).join("");
/** A little relief: a row of standing figures (heads as dots) with gestures. */
const figures = (u: number, z: number, w: number, h: number, n: number) => {
  let body = "";
  const heads: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const fu = u + ((i + 0.5) * w) / n;
    body += `M${fu},${-z} l${i % 2 ? 0.8 : -0.8},${-h * 0.75} M${fu - 0.2},${-z - h * 0.45} l${i % 2 ? -2 : 2},${-h * (0.3 + (i % 3) * 0.12)}`;
    heads.push([fu + (i % 2 ? 0.8 : -0.8), z + h * 0.85]);
  }
  return { body, heads: faceDots(heads) };
};

/* 512 — Arc de Triomphe */
const ArcDeTriomphe: FC<ArtProps> = () => {
  const x0 = -27;
  const x1 = 27;
  const y0 = -13;
  const y1 = 13;
  const H = 74;
  const stone = "#efe2c4";
  const stoneR = "#c9b8ae";
  const band = "#dccaa6";
  const bandR = "#b8a690";
  const relief = "#a89272";
  const reliefR = "#94806c";
  const rosettes = (cu: number, sz: number, r: number) =>
    faceDots(
      range(0, 7, 1).map((i): [number, number] => [
        cu - Math.cos((Math.PI * i) / 6) * r,
        sz + Math.sin((Math.PI * i) / 6) * r,
      ]),
    );
  const fL = [figures(3, 16, 11, 14, 5), figures(40, 16, 11, 14, 5)];
  const frieze = figures(1, 50.6, 52, 4.4, 14);
  const friezeR = figures(1, 50.6, 24, 4.4, 6);
  const fR = figures(3, 36, 20, 8, 6);
  return (
    <g>
      <Shadow x0={x0} x1={x1} y0={y0} y1={y1} />
      <PlaneTree x={-40} y={-30} s={1.25} />
      <PlaneTree x={30} y={-38} s={1.1} />
      <Box x0={x0} x1={x1} y0={y0} y1={y1} z1={H} l={stone} r={stoneR} t="#f6eedb" />
      <FaceL x={x0} y={y1}>
        <rect x={0} y={-3} width={54} height={3} fill={band} />
        {/* main arch with coffered vault and the side passage glimpsed inside */}
        <path d={archD(17, 20, 0, 48)} fill="#e6d6b4" />
        <path d={archD(18.5, 17, 0, 46)} fill="#5c4f74" />
        <path d={archD(30, 5.5, 0, 22)} fill="#8b7ea3" />
        <path
          d={rosettes(27, 37.5, 6.6)}
          stroke="#7a6d92"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <path d="M18.5,0 L35.5,0 L33.5,-5 L20.5,-5 Z" fill="#c9d8b4" opacity={0.45} />
        {/* imposts + spandrel victories */}
        <path d="M0,-37 H17 M37,-37 H54" stroke={band} strokeWidth={1.4} />
        <path
          d="M11,-46 q4,-1 7,-6 M43,-46 q-4,-1 -7,-6 M12,-42 q3,-4 6,-3 M42,-42 q-3,-4 -6,-3"
          stroke={relief}
          strokeWidth={0.9}
          fill="none"
          strokeLinecap="round"
        />
        {/* pier reliefs */}
        {[2, 39].map((u, i) => (
          <g key={u}>
            <rect x={u} y={-33} width={13} height={18} fill="#e6d7b8" />
            <rect
              x={u}
              y={-33}
              width={13}
              height={18}
              fill="none"
              stroke={band}
              strokeWidth={0.8}
            />
            <path
              d={fL[i].body}
              stroke={relief}
              strokeWidth={1.1}
              strokeLinecap="round"
              fill="none"
            />
            <path d={fL[i].heads} stroke={relief} strokeWidth={1.9} strokeLinecap="round" />
            <rect
              x={u + 1.5}
              y={-12}
              width={10}
              height={7}
              fill="#e6d7b8"
              stroke={band}
              strokeWidth={0.6}
            />
            <path d={`M${u + 6.5},-6 v-5 M${u + 4},-9 h5`} stroke={relief} strokeWidth={0.8} />
          </g>
        ))}
        {/* entablature, frieze, cornice with dentils */}
        <rect x={0} y={-50} width={54} height={1.8} fill={band} />
        <path d={frieze.body} stroke={relief} strokeWidth={0.7} strokeLinecap="round" fill="none" />
        <path d={frieze.heads} stroke={relief} strokeWidth={1.2} strokeLinecap="round" />
        <rect x={-0.5} y={-58} width={55} height={2.6} fill="#d6c39d" />
        <path d="M0,-55.2 H54" stroke="#c4ae86" strokeWidth={1.2} strokeDasharray="0.8 0.8" />
        {/* attic with shields */}
        <path d="M0,-62 H54 M0,-71 H54" stroke={band} strokeWidth={0.9} />
        <path d={arches(range(2.2, 10, 5.1), 2.8, 63.5, 5.5)} fill="#ddc9a2" />
        <rect x={-0.5} y={-74} width={55} height={2.2} fill={band} />
      </FaceL>
      <FaceR x={x1} y={y1}>
        <rect x={0} y={-3} width={26} height={3} fill={bandR} />
        <path d={archD(7.6, 10.8, 0, 32)} fill="#bfae9f" />
        <path d={archD(8.5, 9, 0, 30)} fill="#4b4062" />
        <path d="M8.5,0 L17.5,0 L16.5,-3 L9.5,-3 Z" fill="#a9b89c" opacity={0.45} />
        {[1.5, 19].map((u) => (
          <g key={u}>
            <rect
              x={u}
              y={-30}
              width={5.5}
              height={16}
              fill="#c4b3a6"
              stroke={bandR}
              strokeWidth={0.6}
            />
            <path
              d={`M${u + 2.75},-15 v-10 m-2,4 l2,-2 l2,2`}
              stroke={reliefR}
              strokeWidth={0.8}
              fill="none"
            />
          </g>
        ))}
        <rect
          x={2}
          y={-46}
          width={22}
          height={10}
          fill="#c4b3a6"
          stroke={bandR}
          strokeWidth={0.6}
        />
        <path d={fR.body} stroke={reliefR} strokeWidth={0.9} strokeLinecap="round" fill="none" />
        <path d={fR.heads} stroke={reliefR} strokeWidth={1.6} strokeLinecap="round" />
        <rect x={0} y={-50} width={26} height={1.8} fill={bandR} />
        <path
          d={friezeR.body}
          stroke={reliefR}
          strokeWidth={0.7}
          strokeLinecap="round"
          fill="none"
        />
        <path d={friezeR.heads} stroke={reliefR} strokeWidth={1.2} strokeLinecap="round" />
        <rect x={0} y={-58} width={26.5} height={2.6} fill="#b2a08a" />
        <path d="M0,-55.2 H26" stroke="#a4927e" strokeWidth={1.2} strokeDasharray="0.8 0.8" />
        <path d="M0,-62 H26 M0,-71 H26" stroke={bandR} strokeWidth={0.9} />
        <path d={arches(range(2.4, 5, 4.6), 2.8, 63.5, 5.5)} fill="#b9a795" />
        <rect x={0} y={-74} width={26.5} height={2.2} fill={bandR} />
      </FaceR>
      <path d={`M${sx(0, 0)},${sy(0, 0, H)} v-14`} stroke={C.iron} strokeWidth={0.6} />
      <rect x={sx(0, 0)} y={sy(0, 0, H + 14)} width={2.4} height={5} fill="#2f4f7a" />
      <rect x={sx(0, 0) + 2.4} y={sy(0, 0, H + 14)} width={2.4} height={5} fill="#fbf6ea" />
      <rect x={sx(0, 0) + 4.8} y={sy(0, 0, H + 14)} width={2.4} height={5} fill={C.red} />
      <Planter x0={-30} x1={-14} y={24} />
      <Planter x0={12} x1={28} y={24} />
      <RoundTree x={-40} y={26} s={0.85} box />
      <RoundTree x={38} y={30} s={0.8} box />
      <FlowerBed x0={34} x1={44} y0={-34} y1={-20} seed={4} />
      <Hedge x0={-44} x1={-34} y0={-8} y1={14} h={4} />
    </g>
  );
};

/* 1024 — Notre-Dame */
const NotreDame: FC<ArtProps> = () => {
  const stone = "#eadcbf";
  const stoneR = "#c3b2aa";
  const pier = "#d8c7a7";
  const dark = "#57506e";
  const fx0 = 10;
  const fx1 = 28;
  const kings = range(0.6, 24, 2);
  const portal = (cu: number, w: number, h: number) => (
    <g key={cu}>
      <path d={archD(cu - w / 2 - 1.6, w + 3.2, 0, h + 2.4)} fill="#d3c09c" />
      <path d={archD(cu - w / 2 - 0.8, w + 1.6, 0, h + 1.2)} fill="#e6d7b8" />
      <path d={archD(cu - w / 2, w, 0, h)} fill="#cdb995" />
      <path d={`M${cu - w / 2 + 0.8},${-h * 0.55} h${w - 1.6} V0 h${-(w - 1.6)} Z`} fill={C.wood} />
      <path d={`M${cu},0 V${-h * 0.55}`} stroke="#e6d7b8" strokeWidth={0.8} />
      <path
        d={faceDots([
          [cu - 1.6, h * 0.68],
          [cu, h * 0.74],
          [cu + 1.6, h * 0.68],
        ])}
        stroke="#a28d6c"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </g>
  );
  const louvres = (us: number[]) =>
    us.map((u) => `M${u + 0.4},-90 h2.6 M${u + 0.4},-93 h2.6 M${u + 0.4},-96 h2.6`).join("");
  const spokes = range(0, 12, 1)
    .map((i) => {
      const a = (Math.PI * i) / 6;
      return `M${24 + Math.cos(a) * 2},${-56 + Math.sin(a) * 2} L${24 + Math.cos(a) * 6.4},${-56 + Math.sin(a) * 6.4}`;
    })
    .join("");
  const petals = faceDots(
    range(0, 12, 1).map((i): [number, number] => [
      24 + Math.cos((Math.PI * (i + 0.5)) / 6) * 4.8,
      56 + Math.sin((Math.PI * (i + 0.5)) / 6) * 4.8,
    ]),
  );
  return (
    <g>
      <Shadow x0={-34} x1={fx1} y0={-24} y1={24} />
      <PlaneTree x={-44} y={-30} s={1.3} />
      <PlaneTree x={-10} y={-42} s={1.15} />
      <Box x0={-34} x1={fx0} y0={-12} y1={12} z1={44} l={stone} r={stoneR} />
      <FaceL x={-34} y={12}>
        <path d={arches(range(3, 5, 8.6), 4, 4, 12)} fill={C.glass} />
        <path d={arches(range(3.4, 5, 8.6), 3.2, 22, 16)} fill={C.glass} />
        <path d={arches([3.4 + 8.6 * 2], 3.2, 22, 16)} fill={C.glow} />
        <path
          d={faceDots(range(5, 5, 8.6).map((u): [number, number] => [u, 18.5]))}
          stroke="#7d8db0"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <path d="M0,-19 H44 M0,-42 H44" stroke={pier} strokeWidth={1} />
      </FaceL>
      {range(-32, 5, 8.6).map((x) => (
        <g key={x}>
          <polygon
            points={poly([x, 20, 0], [x + 2, 20, 0], [x + 2, 20, 30], [x, 20, 30])}
            fill="#e1d2b3"
          />
          <polygon
            points={poly([x + 2, 20, 0], [x + 2, 18, 0], [x + 2, 18, 30], [x + 2, 20, 30])}
            fill={stoneR}
          />
          <path
            d={`M${pt(x + 1, 19, 30)} Q${pt(x + 1, 15, 41)} ${pt(x + 1, 12, 41)} M${pt(x + 1, 19, 22)} Q${pt(x + 1, 15, 28)} ${pt(x + 1, 12, 28)}`}
            stroke="#d6c6a6"
            strokeWidth={1.4}
            fill="none"
          />
          <Cone x={x + 1} y={19} r={1.4} z={30} h={6} lit="#e1d2b3" shade={stoneR} />
        </g>
      ))}
      <polygon
        points={poly([-36, 14, 43], [fx0, 14, 43], [fx0, 0, 66], [-36, 0, 66])}
        fill={C.slateL}
      />
      <path d={`M${pt(-36, 0, 66)} L${pt(fx0, 0, 66)}`} stroke="#9aaac2" strokeWidth={1.2} />
      <Prism b={quad(-15, -9, -3, 3, 62)} t={quad(-14, -10, -2, 2, 76)} l="#8a9db3" r="#6b7c95" />
      <path
        d={`M${pt(-15, 3, 70)} L${pt(-9, 3, 70)} L${pt(-9, -3, 70)}`}
        stroke="#c9d3e0"
        strokeWidth={0.6}
        fill="none"
      />
      <Prism b={quad(-14, -10, -2, 2, 76)} t={quad(-12, -12, 0, 0, 136)} l="#7d90a8" r="#5d6c86" />
      <path d={`M${pt(-12, 0, 136)} v-6`} stroke="#b08a3e" strokeWidth={0.9} />
      <Box x0={fx0} x1={fx1} y0={-24} y1={-8} z1={104} l={stone} r={stoneR} t="#d9caa9" />
      <Box x0={fx0} x1={fx1} y0={-8} y1={8} z1={84} l={stone} r={stoneR} />
      <Box x0={fx0} x1={fx1} y0={8} y1={24} z1={104} l={stone} r={stoneR} t="#d9caa9" />
      {/* the whole west façade is one plane: draw its storeys once across 48 units */}
      <FaceR x={fx1} y={24}>
        <path
          d="M0,0 h1.6 V-104 H0 Z M15,0 h2 V-104 h-2 Z M31,0 h2 V-104 h-2 Z M46.4,0 H48 V-104 h-1.6 Z"
          fill={pier}
        />
        {portal(8, 7.6, 15)}
        {portal(24, 9, 18)}
        {portal(40, 7.6, 15)}
        <rect x={0} y={-42} width={48} height={7} fill="#d8c6a4" />
        <path d={arches(kings, 1.5, 35.8, 5)} fill={dark} />
        <path
          d={faceDots(kings.map((u): [number, number] => [u + 0.75, 39.4]))}
          stroke="#e9dcc0"
          strokeWidth={1.1}
          strokeLinecap="round"
        />
        <path d={arches([3, 9.6, 35, 41.6], 3.4, 46, 22)} fill={C.glassR} />
        <path d={arches([5.6, 37.6], 1, 46, 21)} fill="#d8c6a4" />
        <circle cx={24} cy={-56} r={8.4} fill="#e4d4b3" />
        <circle cx={24} cy={-56} r={7.2} fill="#55669a" />
        <circle cx={24} cy={-56} r={2.8} fill="#c96d72" />
        <path d={petals} stroke="#d28a8f" strokeWidth={1.7} strokeLinecap="round" />
        <path d={spokes} stroke="#e4d4b3" strokeWidth={0.55} />
        <circle cx={24} cy={-56} r={1.2} fill={C.glow} />
        <rect x={0} y={-74.5} width={48} height={1.6} fill="#d8c6a4" />
        <path d={arches(range(0.8, 16, 3), 1.6, 75, 8)} fill={dark} />
        <Railing u0={0} u1={48} z={84} h={2} slab={false} />
        <path d={arches([3, 9.6, 35, 41.6], 3.4, 86, 16)} fill={C.glassR} />
        <path d={louvres([3, 9.6, 35, 41.6])} stroke="#a89a8e" strokeWidth={0.6} />
      </FaceR>
      <FaceL x={fx0} y={24}>
        <path d="M0,0 h1.6 V-104 H0 Z M16.4,0 H18 V-104 h-1.6 Z" fill="#e4d5b6" />
        <path d={arches([3, 11.6], 3.4, 86, 16)} fill={C.glass} />
        <path d={louvres([3, 11.6])} stroke="#c9b9a0" strokeWidth={0.6} />
        <rect x={0} y={-42} width={18} height={7} fill="#e1d0ae" />
        <path d={arches(range(0.6, 9, 2), 1.5, 35.8, 5)} fill={dark} />
        <path d={arches([3, 11.6], 3.4, 46, 22)} fill={C.glass} />
        <path d={arches([6.5], 5, 8, 16)} fill={C.glass} />
        <path d={arches(range(0.8, 6, 3), 1.6, 75, 8)} fill={dark} />
      </FaceL>
      {[-8, 24].map((y) => (
        <g key={y}>
          <polyline
            points={poly([fx0, y, 107], [fx1, y, 107], [fx1, y - 16, 107])}
            fill="none"
            stroke="#d5c4a3"
            strokeWidth={1}
          />
          <path
            d={`M${pt(fx0, y, 104)} L${pt(fx0, y, 107)} M${pt(fx1, y, 104)} L${pt(fx1, y, 107)} M${pt(fx1, y - 16, 104)} L${pt(fx1, y - 16, 107)}`}
            stroke="#d5c4a3"
            strokeWidth={1}
          />
        </g>
      ))}
      <PlaneTree x={-42} y={32} s={1} />
      <Hedge x0={-30} x1={4} y0={30} y1={33} h={4} />
      <FlowerBed x0={34} x1={44} y0={-22} y1={-6} seed={5} />
      <FlowerBed x0={34} x1={44} y0={6} y1={22} seed={9} />
      <RoundTree x={38} y={-34} s={0.85} box />
    </g>
  );
};

/* 2048 — Tour Eiffel */
const TourEiffel: FC<ArtProps> = ({ gilded = false }) => {
  const P = gilded
    ? { l: "#f0cb64", r: "#c3922f", line: "#8a6418", plat: "#f6dc8a", glow: "#fff2b8" }
    : { l: "#a07a5e", r: "#77594a", line: "#5a4136", plat: "#b38c6b", glow: C.glow };
  const leg = (dx: number, dy: number) => {
    const b = quad(dx * 30 - 5, dx * 30 + 5, dy * 30 - 5, dy * 30 + 5, 0);
    const t = quad(dx * 12 - 3, dx * 12 + 3, dy * 12 - 3, dy * 12 + 3, 58);
    return (
      <g>
        <Prism b={b} t={t} l={P.l} r={P.r} />
        <path
          d={lattice([b[3], b[2], t[2], t[3]], 6) + lattice([b[2], b[1], t[1], t[2]], 6)}
          stroke={P.line}
          strokeWidth={0.45}
          opacity={0.75}
          fill="none"
        />
        <Box
          x0={dx * 30 - 6}
          x1={dx * 30 + 6}
          y0={dy * 30 - 6}
          y1={dy * 30 + 6}
          z1={3}
          l="#e6dccb"
          r="#bfb2a8"
          t="#efe6d3"
          rim={false}
        />
      </g>
    );
  };
  const arch = (a: V, m: V, b: V) => (
    <path d={`M${pt(...a)} Q${pt(...m)} ${pt(...b)}`} stroke={P.l} strokeWidth={2} fill="none" />
  );
  const mid = quad(-10, 10, -10, 10, 63);
  const midT = quad(-5.5, 5.5, -5.5, 5.5, 120);
  const up = quad(-5, 5, -5, 5, 124);
  const upT = quad(-1.6, 1.6, -1.6, 1.6, 214);
  const railing = range(1, 16, 2.1)
    .map((u) => `M${u},-1 v-5`)
    .join(" ");
  return (
    <g>
      {gilded ? (
        <ellipse cx={100} cy={sy(0, 0, 110)} rx={70} ry={120} fill={P.glow} opacity={0.22} />
      ) : null}
      <Shadow x0={-34} x1={34} y0={-34} y1={34} o={0.05} />
      <PlaneTree x={-44} y={4} s={1.15} />
      <PlaneTree x={2} y={-44} s={1.1} />
      {[-30, 30].flatMap((x) =>
        [-30, 30].map((y) => <RoundShadow key={`${x}${y}`} x={x} y={y} r={7} o={0.16} />),
      )}
      {leg(-1, -1)}
      {arch([-20, -20, 22], [0, -20, 62], [20, -20, 22])}
      {arch([-20, -20, 22], [-20, 0, 62], [-20, 20, 22])}
      {leg(-1, 1)}
      {leg(1, -1)}
      <Box x0={-17} x1={17} y0={-17} y1={17} z0={56} z1={63} l={P.plat} r={P.r} t={P.l} />
      <FaceL x={-17} y={17} z={56}>
        <path d={railing} stroke={P.line} strokeWidth={0.5} />
      </FaceL>
      <FaceR x={17} y={17} z={56}>
        <path d={railing} stroke={P.line} strokeWidth={0.5} />
      </FaceR>
      {arch([-20, 20, 22], [0, 20, 62], [20, 20, 22])}
      {arch([20, -20, 22], [20, 0, 62], [20, 20, 22])}
      {leg(1, 1)}
      <Prism b={mid} t={midT} l={P.l} r={P.r} />
      <path
        d={
          lattice([mid[3], mid[2], midT[2], midT[3]], 7) +
          lattice([mid[2], mid[1], midT[1], midT[2]], 7)
        }
        stroke={P.line}
        strokeWidth={0.45}
        fill="none"
        opacity={0.8}
      />
      <Box x0={-8.5} x1={8.5} y0={-8.5} y1={8.5} z0={119} z1={124} l={P.plat} r={P.r} t={P.l} />
      <Prism b={up} t={upT} l={P.l} r={P.r} />
      <path
        d={
          lattice([up[3], up[2], upT[2], upT[3]], 12) + lattice([up[2], up[1], upT[1], upT[2]], 12)
        }
        stroke={P.line}
        strokeWidth={0.4}
        fill="none"
        opacity={0.8}
      />
      <Box x0={-3.2} x1={3.2} y0={-3.2} y1={3.2} z0={212} z1={218} l={P.plat} r={P.r} t={P.l} />
      <ellipse cx={sx(0, 0)} cy={sy(0, 0, 221)} rx={7} ry={6} fill={P.glow} opacity={0.35} />
      <Prism
        b={quad(-2.2, 2.2, -2.2, 2.2, 218)}
        t={quad(-1.4, 1.4, -1.4, 1.4, 226)}
        l={P.glow}
        r="#e8b75e"
      />
      <path d={`M${sx(0, 0)},${sy(0, 0, 226)} V${sy(0, 0, 246)}`} stroke={P.line} strokeWidth={1} />
      <circle cx={sx(0, 0)} cy={sy(0, 0, 246)} r={0.9} fill={C.red} />
      {gilded
        ? [
            [40, 120],
            [158, 90],
            [62, 60],
            [140, 170],
          ].map(([x, y]) => (
            <path
              key={x}
              d={`M${x},${y - 4} L${x + 1},${y - 1} L${x + 4},${y} L${x + 1},${y + 1} L${x},${y + 4} L${x - 1},${y + 1} L${x - 4},${y} L${x - 1},${y - 1} Z`}
              fill="#fff6c8"
            />
          ))
        : null}
      <FlowerBed x0={-9} x1={9} y0={-9} y1={9} seed={11} />
      <Hedge x0={-4} x1={22} y0={40} y1={43} h={3.5} />
      <Hedge x0={40} x1={43} y0={-22} y1={4} h={3.5} />
      <Bench x={-16} y={39} />
      <RoundTree x={42} y={18} s={0.8} box />
    </g>
  );
};

export const BUILDINGS: BuildingArt[] = [
  { name: "Street lamp", Art: StreetLamp },
  { name: "Morris column", Art: MorrisColumn },
  { name: "Boulangerie", Art: Boulangerie },
  { name: "Café", Art: Cafe },
  { name: "Maison normande", Art: MaisonNormande },
  { name: "Immeuble haussmannien", Art: Haussmann },
  { name: "Église", Art: Eglise },
  { name: "Château", Art: Chateau },
  { name: "Arc de Triomphe", Art: ArcDeTriomphe },
  { name: "Notre-Dame", Art: NotreDame },
  { name: "Tour Eiffel", Art: TourEiffel },
];

export function buildingFor(value: number) {
  const index = Math.min(Math.log2(value) - 1, BUILDINGS.length - 1);
  return { ...BUILDINGS[index], gilded: Math.log2(value) - 1 >= BUILDINGS.length };
}
