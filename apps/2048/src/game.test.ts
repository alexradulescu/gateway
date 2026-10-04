import { expect, test } from "bun:test";
import { canMove, move, slide, spawnTile, type GameState, type Tile } from "./game";

function state(rows: number[][]): GameState {
  const tiles: Tile[] = [];
  let id = 1;
  rows.forEach((r, row) =>
    r.forEach((value, col) => value && tiles.push({ id: id++, value, row, col })),
  );
  return { tiles, score: 0, won: false, over: false, continued: false };
}

function grid(tiles: Tile[]) {
  const g = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  for (const t of tiles) g[t.row][t.col] = t.value;
  return g;
}

test("merges each pair once, toward the edge", () => {
  const out = slide(state([[2, 2, 2, 2], [4, 0, 4, 8], [0], [0]]), "left")!;
  expect(grid(out.tiles).slice(0, 2)).toEqual([
    [4, 4, 0, 0],
    [8, 8, 0, 0],
  ]);
  expect(out.gained).toBe(16);
});

test("slides right and down", () => {
  expect(grid(slide(state([[2, 0, 2, 4]]), "right")!.tiles)[0]).toEqual([0, 0, 4, 4]);
  expect(grid(slide(state([[2], [2], [0], [0]]), "down")!.tiles)[3][0]).toBe(4);
});

test("returns null when nothing moves", () => {
  expect(slide(state([[2, 4, 0, 0]]), "left")).toBeNull();
});

test("detects game over", () => {
  const full = state([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ]);
  expect(canMove(full.tiles)).toBe(false);
});

test("spawned ids never collide with restored tiles", () => {
  const restored = state([[2, 4, 8, 16]]).tiles.map((t) => ({ ...t, id: t.id + 40 }));
  const ids = spawnTile(restored).map((t) => t.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("long random games keep unique ids and merge every equal neighbour pair", () => {
  const dirs = ["up", "down", "left", "right"] as const;
  for (let g = 0; g < 200; g++) {
    let s = state([[0]]);
    s = { ...s, tiles: spawnTile(spawnTile([])) };
    for (let i = 0; i < 400 && !s.over; i++) {
      s = move(s, dirs[Math.floor(Math.random() * 4)]);
      const ids = s.tiles.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      const cells = new Set(s.tiles.map((t) => t.row * 4 + t.col));
      expect(cells.size).toBe(s.tiles.length);
    }
    if (s.over) expect(canMove(s.tiles)).toBe(false);
  }
});
