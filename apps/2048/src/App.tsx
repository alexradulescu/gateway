import { ArrowUp, RotateCcw } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { buildingFor, VIEW_HEIGHT, VIEW_WIDTH } from "./art/buildings";
import { move, newGame, type Direction, type GameState } from "./game";

const STORAGE_KEY = "gateway-2048:v1";
const SWIPE_MIN = 24;
/** cos of the board's rotateX tilt; screen-vertical swipes are foreshortened by this. */
const TILT = Math.cos((54.7 * Math.PI) / 180);

type Saved = { game: GameState; best: number };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Saved;
      // Saves from before the id fix may hold duplicate ids or stacked cells; renumber and dedupe.
      const seen = new Set<number>();
      const tiles = saved.game.tiles
        .filter((t) => !seen.has(t.row * 4 + t.col) && seen.add(t.row * 4 + t.col))
        .map((t, i) => ({ ...t, id: i + 1, isNew: false, merged: false }));
      return { ...saved, game: { ...saved.game, tiles } };
    }
  } catch {}
  return { game: newGame(), best: 0 };
}

/**
 * The board is rotated 45° then tilted, so a swipe's screen vector is
 * un-tilted and rotated back -45° before picking the dominant board axis.
 */
function swipeToDirection(dx: number, dy: number): Direction | null {
  if (Math.hypot(dx, dy) < SWIPE_MIN) return null;
  const y = dy / TILT;
  const bx = (dx + y) * Math.SQRT1_2;
  const by = (y - dx) * Math.SQRT1_2;
  if (Math.abs(bx) > Math.abs(by)) return bx > 0 ? "right" : "left";
  return by > 0 ? "down" : "up";
}

const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

// Pad layout mirrors the board on screen: board-up points up-right, etc.
const PAD: { direction: Direction; label: string; angle: number }[] = [
  { direction: "left", label: "Slide left", angle: -60 },
  { direction: "up", label: "Slide up", angle: 60 },
  { direction: "down", label: "Slide down", angle: -120 },
  { direction: "right", label: "Slide right", angle: 120 },
];

export function App() {
  const [{ game, best }, setSaved] = useState(load);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game, best }));
    } catch {}
  }, [game, best]);

  const play = useCallback((direction: Direction) => {
    setSaved((prev) => {
      const next = move(prev.game, direction);
      if (next === prev.game) return prev;
      return { game: next, best: Math.max(prev.best, next.score) };
    });
  }, []);

  const restart = () => setSaved((prev) => ({ game: newGame(), best: prev.best }));
  const keepGoing = () =>
    setSaved((prev) => ({ ...prev, game: { ...prev.game, continued: true } }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const direction = KEYS[e.key];
      if (!direction || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      play(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  const onPointerDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!start.current) return;
    const direction = swipeToDirection(e.clientX - start.current.x, e.clientY - start.current.y);
    start.current = null;
    if (direction) play(direction);
  };

  const showWin = game.won && !game.continued;
  const highest = game.tiles.reduce((m, t) => Math.max(m, t.value), 2);
  const landmark = buildingFor(2048).name;

  return (
    <main className="app">
      <div className="sky" aria-hidden="true">
        <span className="cloud c1" />
        <span className="cloud c2" />
        <span className="cloud c3" />
      </div>

      <header className="bar">
        <h1>2048</h1>
        <div className="scores">
          <Score label="Score" value={game.score} />
          <Score label="Best" value={best} />
        </div>
        <button type="button" className="icon-button" onClick={restart} aria-label="New game">
          <RotateCcw size={20} strokeWidth={2.2} />
        </button>
      </header>
      <p className="caption">
        Your town: <span>{buildingFor(highest).name}</span>
      </p>

      <section
        className="stage"
        aria-label="Game board. Swipe or use arrow keys to slide tiles."
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (start.current = null)}
      >
        <div className="board">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="cell"
              data-ground={(Math.floor(i / 4) + i) % 2 ? "lawn" : "gravel"}
              style={pos(Math.floor(i / 4), i % 4)}
            />
          ))}
          {game.tiles.map((t) => (
            <div
              key={t.id}
              className="tile"
              role="img"
              aria-label={`${buildingFor(t.value).name}, ${t.value}`}
              data-new={t.isNew || undefined}
              data-merged={t.merged || undefined}
              data-ground={Math.log2(t.value) % 2 ? "lawn" : "gravel"}
              style={pos(t.row, t.col)}
            >
              <div className="block">
                <div className="face south" />
                <div className="face east" />
                <div className="face top" />
                {t.merged && <div className="puff" />}
                <Building value={t.value} />
              </div>
            </div>
          ))}
        </div>

        {(showWin || game.over) && (
          <div className="overlay" role="status">
            <p className="overlay-title">
              {showWin ? `You built the ${landmark}` : "The town is full"}
            </p>
            <p className="overlay-sub">Score {game.score.toLocaleString()}</p>
            <div className="overlay-actions">
              {showWin && (
                <button type="button" className="pill secondary" onClick={keepGoing}>
                  Keep building
                </button>
              )}
              <button type="button" className="pill" onClick={restart}>
                New town
              </button>
            </div>
          </div>
        )}
      </section>

      <nav className="pad" aria-label="Slide controls">
        {PAD.map((b) => (
          <button
            key={b.direction}
            type="button"
            className="pad-button"
            aria-label={b.label}
            onClick={() => play(b.direction)}
          >
            <ArrowUp size={24} strokeWidth={2.2} style={{ rotate: `${b.angle}deg` }} />
          </button>
        ))}
      </nav>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="score">
      <span className="score-label">{label}</span>
      <span className="score-value">{value.toLocaleString()}</span>
    </div>
  );
}

function pos(row: number, col: number) {
  return { "--row": row, "--col": col } as CSSProperties;
}

/** Isometric building, billboarded so its footprint sits on the plot's top face. */
const Building = memo(function Building({ value }: { value: number }) {
  const { Art, gilded } = buildingFor(value);
  const Drawing = Art as (props: { gilded?: boolean }) => ReturnType<typeof Art>;
  return (
    <svg
      className="sprite"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={{ "--aspect": VIEW_HEIGHT / VIEW_WIDTH } as CSSProperties}
      aria-hidden="true"
    >
      <Drawing gilded={gilded} />
    </svg>
  );
});
