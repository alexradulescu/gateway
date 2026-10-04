export const SIZE = 4;
export const WIN_VALUE = 2048;

export type Direction = "up" | "down" | "left" | "right";

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  /** Set on the turn a tile appears, for the pop-in animation. */
  isNew?: boolean;
  /** Set on the turn two tiles combine, for the bump animation. */
  merged?: boolean;
};

export type GameState = {
  tiles: Tile[];
  score: number;
  won: boolean;
  over: boolean;
  /** Player chose to keep going after reaching 2048. */
  continued: boolean;
};

type Random = () => number;

let nextId = 1;

function emptyCells(tiles: Tile[]) {
  const taken = new Set(tiles.map((t) => t.row * SIZE + t.col));
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (!taken.has(i)) cells.push({ row: Math.floor(i / SIZE), col: i % SIZE });
  }
  return cells;
}

export function spawnTile(tiles: Tile[], random: Random = Math.random): Tile[] {
  const cells = emptyCells(tiles);
  if (cells.length === 0) return tiles;
  const cell = cells[Math.floor(random() * cells.length)];
  const value = random() < 0.9 ? 2 : 4;
  // Never below the board's highest id, so a reloaded saved game can't produce duplicate keys.
  nextId = Math.max(nextId, ...tiles.map((t) => t.id + 1));
  return [...tiles, { id: nextId++, value, ...cell, isNew: true }];
}

export function newGame(random: Random = Math.random): GameState {
  return {
    tiles: spawnTile(spawnTile([], random), random),
    score: 0,
    won: false,
    over: false,
    continued: false,
  };
}

/** Returns cell coordinates for one line, ordered from the edge tiles slide toward. */
function line(direction: Direction, index: number) {
  return Array.from({ length: SIZE }, (_, i) => {
    switch (direction) {
      case "left":
        return { row: index, col: i };
      case "right":
        return { row: index, col: SIZE - 1 - i };
      case "up":
        return { row: i, col: index };
      case "down":
        return { row: SIZE - 1 - i, col: index };
    }
  });
}

/** Slides every tile; returns null when nothing moved. Does not spawn. */
export function slide(state: GameState, direction: Direction) {
  const byCell = new Map(state.tiles.map((t) => [t.row * SIZE + t.col, t]));
  const result: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let index = 0; index < SIZE; index++) {
    const cells = line(direction, index);
    const lineTiles = cells.flatMap((c) => byCell.get(c.row * SIZE + c.col) ?? []);
    let target = 0;
    let last: Tile | undefined;

    for (const tile of lineTiles) {
      if (last && !last.merged && last.value === tile.value) {
        last.value *= 2;
        last.merged = true;
        gained += last.value;
        moved = true;
        continue;
      }
      const cell = cells[target++];
      if (cell.row !== tile.row || cell.col !== tile.col) moved = true;
      last = { id: tile.id, value: tile.value, row: cell.row, col: cell.col };
      result.push(last);
    }
  }

  if (!moved) return null;
  return { tiles: result, gained };
}

export function canMove(tiles: Tile[]) {
  if (tiles.length < SIZE * SIZE) return true;
  const byCell = new Map(tiles.map((t) => [t.row * SIZE + t.col, t.value]));
  return tiles.some(
    (t) =>
      (t.col < SIZE - 1 && byCell.get(t.row * SIZE + t.col + 1) === t.value) ||
      (t.row < SIZE - 1 && byCell.get((t.row + 1) * SIZE + t.col) === t.value),
  );
}

export function move(state: GameState, direction: Direction, random: Random = Math.random) {
  if (state.over || (state.won && !state.continued)) return state;
  const slid = slide(state, direction);
  if (!slid) return state;
  const tiles = spawnTile(slid.tiles, random);
  const won = state.won || tiles.some((t) => t.value >= WIN_VALUE);
  return {
    ...state,
    tiles,
    score: state.score + slid.gained,
    won,
    over: !canMove(tiles),
  };
}
