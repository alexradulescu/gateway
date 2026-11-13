import { useMutation, useQuery } from "convex/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Prose } from "./prose";

type BookId = Id<"libraryBooks">;
type ChapterId = Id<"libraryChapters">;
type House = Doc<"libraryBooks">["house"];

type Route =
  | { view: "shelves" }
  | { view: "book"; bookId: BookId }
  | { view: "read"; bookId: BookId; chapterId: ChapterId }
  | { view: "editBook"; bookId?: BookId }
  | { view: "editChapter"; bookId: BookId; chapterId?: ChapterId };

const BASE = "/library/";

function parseRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const book = params.get("book") as BookId | null;
  const chapter = params.get("ch") as ChapterId | null;
  const edit = params.get("edit");
  if (edit === "book") return { view: "editBook", bookId: book ?? undefined };
  if (edit === "chapter" && book)
    return { view: "editChapter", bookId: book, chapterId: chapter ?? undefined };
  if (book && chapter) return { view: "read", bookId: book, chapterId: chapter };
  if (book) return { view: "book", bookId: book };
  return { view: "shelves" };
}

function routeToUrl(route: Route) {
  const params = new URLSearchParams();
  if ("bookId" in route && route.bookId) params.set("book", route.bookId);
  if ("chapterId" in route && route.chapterId) params.set("ch", route.chapterId);
  if (route.view === "editBook") params.set("edit", "book");
  if (route.view === "editChapter") params.set("edit", "chapter");
  const query = params.toString();
  return query ? `${BASE}?${query}` : BASE;
}

/** Scroll back to `y` once the (live-loading) page is tall enough, giving up after ~1.5s. */
function restoreScroll(y: number) {
  let tries = 0;
  const tick = () => {
    window.scrollTo(0, y);
    if (Math.abs(window.scrollY - y) > 2 && tries++ < 90) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const onPop = (event: PopStateEvent) => {
      setRoute(parseRoute());
      restoreScroll((event.state as { scroll?: number } | null)?.scroll ?? 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = useCallback((next: Route, replace = false) => {
    const url = routeToUrl(next);
    if (replace) window.history.replaceState({ scroll: 0 }, "", url);
    else {
      // Remember where we were so Back lands on the same spot.
      window.history.replaceState({ scroll: window.scrollY }, "");
      window.history.pushState({ scroll: 0 }, "", url);
    }
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);
  return { route, go };
}

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode: preference just won't persist */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ── Reading history ── */

type ReadEntry = { chapterId: ChapterId; at: number };
/** Older builds stored a bare chapter id per book; read those as "long ago". */
type LastRead = Record<string, ReadEntry | string>;

function entryOf(value: ReadEntry | string | undefined): ReadEntry | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return { chapterId: value as ChapterId, at: 0 };
  return value;
}

const POS_KEY = "library:pos";

function readPos(chapterId: string): number {
  try {
    const map = JSON.parse(localStorage.getItem(POS_KEY) ?? "{}") as Record<string, number>;
    return typeof map[chapterId] === "number" ? map[chapterId] : 0;
  } catch {
    return 0;
  }
}

function writePos(chapterId: string, fraction: number) {
  try {
    const map = JSON.parse(localStorage.getItem(POS_KEY) ?? "{}") as Record<string, number>;
    map[chapterId] = Math.round(Math.min(1, Math.max(0, fraction)) * 10000) / 10000;
    localStorage.setItem(POS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Set when paging backwards into the previous chapter so it opens on its last page. */
let openAtEnd: string | null = null;

const HOUSES: Record<House, { label: string }> = {
  slytherin: { label: "Slytherin" },
  gryffindor: { label: "Gryffindor" },
  ravenclaw: { label: "Ravenclaw" },
  hufflepuff: { label: "Hufflepuff" },
};

function readingTime(words: number) {
  const minutes = Math.max(1, Math.round(words / 230));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

const isBookend = (title: string) => /^(prologue|epilogue)\b/i.test(title.trim());

/* ───────────────────────── App ───────────────────────── */

export function App() {
  const { route, go } = useRouter();
  const [scribe, setScribe] = useStored("library:scribe", false);
  const [lastRead, setLastRead] = useStored<LastRead>("library:lastRead", {});
  usePressEffects();

  return (
    <>
      <Sky />
      <div className="app">
        {route.view === "shelves" && (
          <Shelves go={go} scribe={scribe} setScribe={setScribe} lastRead={lastRead} />
        )}
        {route.view === "book" && (
          <BookPage bookId={route.bookId} go={go} scribe={scribe} lastRead={lastRead} />
        )}
        {route.view === "read" && (
          <Reader
            bookId={route.bookId}
            chapterId={route.chapterId}
            go={go}
            scribe={scribe}
            onRead={(chapterId) =>
              setLastRead((prev) => ({ ...prev, [route.bookId]: { chapterId, at: Date.now() } }))
            }
          />
        )}
        {route.view === "editBook" && <BookEditor bookId={route.bookId} go={go} />}
        {route.view === "editChapter" && (
          <ChapterEditor bookId={route.bookId} chapterId={route.chapterId} go={go} />
        )}
      </div>
    </>
  );
}

type Go = (route: Route, replace?: boolean) => void;

/** Real anchor (so long-press, new tab and status-bar previews work) with client-side routing. */
function Link({
  to,
  go,
  replace,
  className,
  children,
  onNavigate,
  ...rest
}: {
  to: Route;
  go: Go;
  replace?: boolean;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  "aria-label"?: string;
}) {
  return (
    <a
      href={routeToUrl(to)}
      className={className}
      onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onNavigate?.();
        go(to, replace);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ───────────────────────── Ambience ───────────────────────── */

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PRESSABLE = ".seg button, .quill, .house-chip, .chapter-row, .btn-primary";

/** Restart a one-shot CSS animation class on an element. */
function replay(element: HTMLElement, className: string) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  element.addEventListener("animationend", () => element.classList.remove(className), {
    once: true,
  });
}

/**
 * Press feedback that CSS alone can't time: :active ends the instant a quick tap lifts, so
 * press effects run as one-shot classes instead. Covers also release a small burst of motes,
 * and the gold button lights a "Lumos" ring from the tap point.
 */
function usePressEffects() {
  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || prefersReducedMotion()) return;
      const target = event.target instanceof Element ? event.target : null;
      const pressable = target?.closest<HTMLElement>(PRESSABLE);
      if (pressable && !pressable.matches(":disabled")) {
        if (pressable.matches(".btn-primary")) {
          const rect = pressable.getBoundingClientRect();
          pressable.style.setProperty("--px", `${event.clientX - rect.left}px`);
          pressable.style.setProperty("--py", `${event.clientY - rect.top}px`);
        }
        replay(pressable, "press");
      }
      const cover = target?.closest<HTMLElement>("a.tome");
      if (cover) {
        for (let index = 0; index < 6; index++) {
          const mote = document.createElement("span");
          mote.className = "burst-mote";
          mote.style.left = `${22 + index * 11 + Math.random() * 6}%`;
          mote.style.setProperty("--drift", `${(Math.random() - 0.5) * 24}px`);
          mote.style.animationDelay = `${index * 40}ms`;
          mote.addEventListener("animationend", () => mote.remove(), { once: true });
          cover.appendChild(mote);
        }
      }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
}

function Sky() {
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        left: (index * 41 + 7) % 100,
        delay: (index * 1.9) % 16,
        duration: 16 + ((index * 7) % 10),
        size: 2 + ((index * 3) % 3),
      })),
    [],
  );
  return (
    <div className="sky" aria-hidden="true">
      <div className="stars" />
      {motes.map((mote, index) => (
        <span
          key={index}
          className="mote"
          style={{
            left: `${mote.left}%`,
            width: mote.size,
            height: mote.size,
            animationDelay: `-${mote.delay}s`,
            animationDuration: `${mote.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Thin double-line frame with scooped corners and a diamond notch, top and bottom. */
function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frame framed ${className}`}>
      <span className="notch notch-top" aria-hidden="true" />
      <span className="notch notch-bottom" aria-hidden="true" />
      {children}
    </div>
  );
}

function Ornament() {
  return (
    <svg className="ornament" viewBox="0 0 160 14" aria-hidden="true">
      <path d="M0 7 H62 M98 7 H160" stroke="currentColor" strokeWidth="0.75" />
      <path d="M80 1 L86 7 L80 13 L74 7 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M80 4.5 L82.5 7 L80 9.5 L77.5 7 Z" fill="currentColor" />
      <circle cx="68" cy="7" r="1.2" fill="currentColor" />
      <circle cx="92" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Crest({ house }: { house: House }) {
  return (
    <svg className="crest" viewBox="0 0 40 46" aria-hidden="true">
      <path
        d="M20 2 L37 8 V22 C37 33 29 40 20 44 C11 40 3 33 3 22 V8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M20 6 L33.5 10.8 V22 C33.5 31 27 36.6 20 40 C13 36.6 6.5 31 6.5 22 V10.8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="15"
        fill="currentColor"
      >
        {HOUSES[house].label[0]}
      </text>
    </svg>
  );
}

function Loading({ label = "Summoning the pages…" }: { label?: string }) {
  return (
    <div className="state">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

function Missing({ go }: { go: Go }) {
  return (
    <div className="state">
      <p className="state-title">This tome has vanished.</p>
      <p>Perhaps it was never here, or someone cast a Disillusionment Charm on it.</p>
      <button className="btn" onClick={() => go({ view: "shelves" })}>
        Back to the shelves
      </button>
    </div>
  );
}

function TopBar({
  onBack,
  backLabel,
  title,
  titleClassName = "",
  actions,
}: {
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  titleClassName?: string;
  actions?: ReactNode;
}) {
  const scrolled = useScrolled();
  return (
    <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
      <div className="topbar-start">
        {onBack && (
          <button className="back" onClick={onBack}>
            <span aria-hidden="true">‹</span> {backLabel ?? "Back"}
          </button>
        )}
      </div>
      <span className={`topbar-title ${titleClassName}`} aria-live="polite">
        {title}
      </span>
      <div className="topbar-actions">{actions}</div>
    </header>
  );
}

/** Bottom drawer on phones, centred modal from 720px. Traps focus; Esc / backdrop close. */
function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="sheet-root">
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className="sheet framed"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="sheet-head">
          <h2 id="sheet-title">{title}</h2>
          <button className="link" onClick={onClose}>
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="sheet-row">
      <span className="sheet-label">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            className={value === option.value ? "active" : ""}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Shelves ───────────────────────── */

function Shelves({
  go,
  scribe,
  setScribe,
  lastRead,
}: {
  go: Go;
  scribe: boolean;
  setScribe: (value: boolean) => void;
  lastRead: LastRead;
}) {
  const books = useQuery(api.library.listBooks);
  const seed = useMutation(api.library.seedLibrary);
  const seeded = useRef(false);

  useEffect(() => {
    if (books && books.length === 0 && !seeded.current) {
      seeded.current = true;
      void seed();
    }
  }, [books, seed]);

  const visible = books?.filter((book) => scribe || book.chapterCount > 0) ?? [];
  const recent = (books ?? [])
    .map((book) => ({ book, entry: entryOf(lastRead[book._id]) }))
    .filter((item): item is { book: (typeof visible)[number]; entry: ReadEntry } => !!item.entry)
    .sort((a, b) => b.entry.at - a.entry.at)[0];

  return (
    <main className="shelves">
      <TopBar
        actions={
          <button
            className={`quill ${scribe ? "on" : ""}`}
            onClick={() => setScribe(!scribe)}
            aria-pressed={scribe}
            title={scribe ? "Leave scribe mode" : "Enter scribe mode"}
          >
            {scribe ? "Scribe" : "Reader"}
          </button>
        }
      />
      <Frame className="hero">
        <p className="hex-label">Hogwarts Library</p>
        <h1>
          The Restricted <span>Section</span>
        </h1>
        <Ornament />
        <p className="lede">Tales the Ministry would rather you didn’t read.</p>
      </Frame>

      {recent && (
        <Link
          go={go}
          className="continue glass framed"
          to={{ view: "read", bookId: recent.book._id, chapterId: recent.entry.chapterId }}
        >
          <span className="continue-label">Continue reading</span>
          <span className="continue-title">{recent.book.title}</span>
          <span className="continue-arrow" aria-hidden="true">
            ›
          </span>
        </Link>
      )}

      {books === undefined ? (
        <Loading label="Lumos…" />
      ) : (
        <div className="shelf">
          {visible.map((book) => (
            <Link key={book._id} go={go} className="tome" to={{ view: "book", bookId: book._id }}>
              <Cover book={book} />
              <span className="tome-meta">
                {book.chapterCount} {book.chapterCount === 1 ? "chapter" : "chapters"}
                {scribe && book.draftCount > 0 && ` · ${book.draftCount} draft`}
              </span>
            </Link>
          ))}
          {scribe && (
            <button className="tome tome-new" onClick={() => go({ view: "editBook" })}>
              <span className="cover cover-new">
                <span className="plus">+</span>
                <span>Bind a new book</span>
              </span>
            </button>
          )}
          {visible.length === 0 && !scribe && (
            <p className="empty">The shelves are bare. Tap the quill to start writing.</p>
          )}
        </div>
      )}
    </main>
  );
}

function Cover({
  book,
  large,
}: {
  book: Pick<Doc<"libraryBooks">, "title" | "subtitle" | "house" | "series">;
  large?: boolean;
}) {
  return (
    <span className={`cover house-${book.house} ${large ? "cover-large" : ""}`}>
      <span className="cover-frame framed">
        <span className="cover-series">{book.series}</span>
        <span className="cover-body">
          <Crest house={book.house} />
          <span className="cover-title">{book.title}</span>
          {book.subtitle && <span className="cover-subtitle">{book.subtitle}</span>}
        </span>
      </span>
    </span>
  );
}

/* ───────────────────────── Book ───────────────────────── */

function BookPage({
  bookId,
  go,
  scribe,
  lastRead,
}: {
  bookId: BookId;
  go: Go;
  scribe: boolean;
  lastRead: LastRead;
}) {
  const data = useQuery(api.library.getBook, { bookId });
  const move = useMutation(api.library.moveChapter);

  if (data === undefined) return <Loading />;
  if (data === null) return <Missing go={go} />;

  const { book, chapters } = data;
  const readable = chapters.filter((chapter) => scribe || chapter.published);
  const words = readable.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const current = entryOf(lastRead[bookId])?.chapterId;
  const resume = current && readable.find((chapter) => chapter._id === current);
  const start = resume || readable[0];

  return (
    <main className="book">
      <TopBar
        onBack={() => go({ view: "shelves" })}
        backLabel="Library"
        actions={
          scribe && (
            <button className="link" onClick={() => go({ view: "editBook", bookId })}>
              Edit
            </button>
          )
        }
      />
      <section className="book-hero">
        <Cover book={book} large />
        <div className="book-info">
          <p className="eyebrow">{HOUSES[book.house].label}</p>
          <h1>{book.title}</h1>
          {book.subtitle && <p className="book-subtitle">{book.subtitle}</p>}
          {book.narrator && <p className="narrator">As told by {book.narrator}</p>}
          <p className="stats">
            {readable.length} {readable.length === 1 ? "chapter" : "chapters"} ·{" "}
            {words.toLocaleString()} words · {readingTime(words)}
          </p>
          {start && (
            <Link
              go={go}
              className="btn btn-primary"
              to={{ view: "read", bookId, chapterId: start._id }}
            >
              {resume ? "Continue reading" : "Begin reading"}
            </Link>
          )}
        </div>
      </section>

      {book.blurb && <p className="blurb">{book.blurb}</p>}

      <section className="contents glass framed">
        <div className="contents-head">
          <h2>Contents</h2>
          {scribe && (
            <button className="link" onClick={() => go({ view: "editChapter", bookId })}>
              + New chapter
            </button>
          )}
        </div>
        {readable.length === 0 ? (
          <p className="empty">No chapters yet. The ink is still drying.</p>
        ) : (
          <ol>
            {readable.map((chapter, index) => (
              <li key={chapter._id} className={current === chapter._id ? "current" : ""}>
                <Link
                  go={go}
                  className="chapter-row"
                  to={{ view: "read", bookId, chapterId: chapter._id }}
                >
                  <span className="chapter-num">{toRoman(index + 1)}</span>
                  <span className="chapter-title">
                    {chapter.title}
                    {!chapter.published && <span className="badge">Draft</span>}
                  </span>
                  <span className="chapter-time">{readingTime(chapter.wordCount)}</span>
                </Link>
                {scribe && (
                  <span className="row-tools">
                    <button
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move({ chapterId: chapter._id, direction: -1 })}
                    >
                      ↑
                    </button>
                    <button
                      aria-label="Move down"
                      disabled={index === readable.length - 1}
                      onClick={() => move({ chapterId: chapter._id, direction: 1 })}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => go({ view: "editChapter", bookId, chapterId: chapter._id })}
                    >
                      Edit
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function toRoman(value: number) {
  const map: [number, string][] = [
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = value;
  let out = "";
  for (const [n, s] of map) {
    while (rest >= n) {
      out += s;
      rest -= n;
    }
  }
  return out;
}

/* ───────────────────────── Reader ───────────────────────── */

type Paper = "parchment" | "night";
type Align = "justify" | "left";
type Mode = "pages" | "scroll";
type PageState = { page: number; count: number; perView: number };

function Reader({
  bookId,
  chapterId,
  go,
  scribe,
  onRead,
}: {
  bookId: BookId;
  chapterId: ChapterId;
  go: Go;
  scribe: boolean;
  onRead: (chapterId: ChapterId) => void;
}) {
  const data = useQuery(api.library.getBook, { bookId });
  const chapter = useQuery(api.library.getChapter, { chapterId });
  const [size, setSize] = useStored("library:size", 19);
  const [paper, setPaper] = useStored<Paper>("library:paper", "parchment");
  const [align, setAlign] = useStored<Align>("library:align", "justify");
  const [mode, setMode] = useStored<Mode>("library:mode", "pages");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const [progress, setProgress] = useState(0);
  const [headingVisible, setHeadingVisible] = useState(true);

  useEffect(() => {
    if (chapter) onRead(chapter._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?._id]);

  const onPageState = useCallback((state: PageState) => {
    setProgress(Math.min(1, (state.page + state.perView) / state.count));
    setHeadingVisible(state.page === 0);
  }, []);

  if (data === undefined || chapter === undefined) return <Loading />;
  if (data === null || chapter === null) return <Missing go={go} />;

  const list = data.chapters.filter((item) => scribe || item.published);
  const index = list.findIndex((item) => item._id === chapterId);
  const prev = list[index - 1];
  const next = list[index + 1];
  const toChapter = (id: ChapterId): Route => ({ view: "read", bookId, chapterId: id });
  const number = list.slice(0, index + 1).filter((item) => !isBookend(item.title)).length;
  const bookend = isBookend(chapter.title);

  const content = (
    <>
      <header className="chapter-head">
        {!bookend && <p className="chapter-kicker">Chapter {toRoman(number)}</p>}
        <h1 className="chapter-heading">{chapter.title}</h1>
        {!chapter.published && <p className="draft-note">Draft — only visible in scribe mode</p>}
        <Ornament />
      </header>
      <div className="prose">
        <Prose body={chapter.body} />
      </div>
      <div className="chapter-end">
        <Ornament />
        <p className="fin">Mischief managed — for now.</p>
        <nav className="end-nav" aria-label="Chapters">
          {prev ? (
            <Link go={go} replace className="end-step" to={toChapter(prev._id)}>
              <span className="arrow" aria-hidden="true">‹</span> Previous
            </Link>
          ) : (
            <span className="end-step" aria-disabled="true">
              <span className="arrow" aria-hidden="true">‹</span> Previous
            </span>
          )}
          <span className="end-pos" aria-label={`Chapter ${index + 1} of ${list.length}`}>
            {toRoman(index + 1)} / {toRoman(list.length)}
          </span>
          {next ? (
            <Link go={go} replace className="end-step end-next" to={toChapter(next._id)}>
              Next <span className="arrow" aria-hidden="true">›</span>
            </Link>
          ) : (
            <span className="end-step end-next" aria-disabled="true">
              Next <span className="arrow" aria-hidden="true">›</span>
            </span>
          )}
        </nav>
      </div>
    </>
  );

  const showChapterTitle = !headingVisible;

  return (
    <main
      className={`reader paper-${paper} mode-${mode} align-${align}`}
      style={{ ["--reader-size" as string]: `${size}px` }}
    >
      <div className="progress-track" aria-hidden="true">
        <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <TopBar
        onBack={() => go({ view: "book", bookId })}
        backLabel="Contents"
        title={showChapterTitle ? chapter.title : data.book.title}
        titleClassName={showChapterTitle ? "" : "wide-only"}
        actions={
          <>
            {scribe && (
              <button
                className="link"
                onClick={() => go({ view: "editChapter", bookId, chapterId })}
              >
                Edit
              </button>
            )}
            <button
              className="icon-btn aa"
              aria-label="Reading settings"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            >
              Aa
            </button>
          </>
        }
      />

      {mode === "pages" ? (
        <PagedView
          key={chapterId}
          chapterId={chapterId}
          layoutKey={`${size}|${align}|${paper}`}
          active={!settingsOpen}
          bookTitle={data.book.title}
          chapterTitle={chapter.title}
          onState={onPageState}
          onBeforeFirst={
            prev
              ? () => {
                  openAtEnd = prev._id;
                  go(toChapter(prev._id), true);
                }
              : undefined
          }
          onAfterLast={next ? () => go(toChapter(next._id), true) : undefined}
        >
          {content}
        </PagedView>
      ) : (
        <ScrollView
          key={chapterId}
          chapterId={chapterId}
          onProgress={setProgress}
          onHeading={setHeadingVisible}
        >
          {content}
        </ScrollView>
      )}


      {settingsOpen && (
        <Sheet title="Reading" onClose={closeSettings}>
          <div className="sheet-row">
            <span className="sheet-label">Text size</span>
            <div className="seg" role="group" aria-label="Text size">
              <button aria-label="Smaller text" onClick={() => setSize(Math.max(15, size - 1))}>
                A−
              </button>
              <span className="seg-value" aria-live="polite">
                {size}
              </span>
              <button aria-label="Larger text" onClick={() => setSize(Math.min(26, size + 1))}>
                A+
              </button>
            </div>
          </div>
          <Choice
            label="Paper"
            value={paper}
            onChange={setPaper}
            options={[
              { value: "parchment", label: "Parchment" },
              { value: "night", label: "Nox" },
            ]}
          />
          <Choice
            label="Alignment"
            value={align}
            onChange={setAlign}
            options={[
              { value: "justify", label: "Justified" },
              { value: "left", label: "Left" },
            ]}
          />
          <Choice
            label="Layout"
            value={mode}
            onChange={setMode}
            options={[
              { value: "pages", label: "Pages" },
              { value: "scroll", label: "Scroll" },
            ]}
          />
        </Sheet>
      )}
    </main>
  );
}

/**
 * Paginates one chapter body with CSS multi-column inside a fixed-height viewport and moves
 * one page (or a two-page spread) at a time. Position is kept as a fraction of the chapter so
 * resizes, rotation and font changes land on the same passage.
 */
function PagedView({
  chapterId,
  layoutKey,
  active,
  bookTitle,
  chapterTitle,
  onState,
  onBeforeFirst,
  onAfterLast,
  children,
}: {
  chapterId: string;
  layoutKey: string;
  active: boolean;
  bookTitle: string;
  chapterTitle: string;
  onState: (state: PageState) => void;
  onBeforeFirst?: () => void;
  onAfterLast?: () => void;
  children: ReactNode;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState({ step: 0, count: 1, perView: 1, gap: 48 });
  const [view, setView] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  // Layout-driven jumps (open, resize, font change) snap; only reader-driven turns animate.
  const [instant, setInstant] = useState(true);
  const fraction = useRef(openAtEnd === chapterId ? 1 : readPos(chapterId));
  const geomRef = useRef(geom);
  const viewRef = useRef(view);
  geomRef.current = geom;
  viewRef.current = view;

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const cols = colsRef.current;
    if (!viewport || !cols) return;
    // The columns sit inside the viewport's fade padding; their box is the text width.
    const width = cols.clientWidth;
    // Spread when the stage (not the page, whose width follows this choice) has room for two.
    const stageWidth = viewport.closest(".stage")?.clientWidth ?? width;
    const perView = window.innerWidth >= 1000 && stageWidth >= 960 ? 2 : 1;
    const gap = perView === 2 ? 80 : 48;
    cols.style.columnCount = String(perView);
    cols.style.columnGap = `${gap}px`;
    const colWidth = (width - (perView - 1) * gap) / perView;
    // A chapter that ends on the left page of a spread moves its closing to the right page,
    // so the spread never shows a blank half. Decided with the closing in its natural place.
    const end = cols.querySelector<HTMLElement>(".chapter-end");
    if (end) {
      delete end.dataset.place;
      if (perView === 2) {
        const column = Math.round(end.offsetLeft / (colWidth + gap));
        if (column % 2 === 0) end.dataset.place = end.offsetTop > 4 ? "right" : "alone";
      } else if (end.offsetTop <= 4) end.dataset.place = "alone";
    }
    const count = Math.max(1, Math.round((cols.scrollWidth + gap) / (colWidth + gap)));
    const views = Math.ceil(count / perView);
    const target = Math.min(
      views - 1,
      Math.max(0, Math.floor((fraction.current * count) / perView + 1e-6)),
    );
    setGeom({ step: width + gap, count, perView, gap });
    setView(target);
    setInstant(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, layoutKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(viewport);
    void document.fonts?.ready.then(() => measure());
    if (openAtEnd === chapterId) openAtEnd = null;
    return () => observer.disconnect();
  }, [measure, chapterId]);

  useEffect(() => {
    onState({ page: view * geom.perView, count: geom.count, perView: geom.perView });
  }, [view, geom, onState]);

  const goTo = useCallback(
    (target: number) => {
      const { count, perView } = geomRef.current;
      const views = Math.ceil(count / perView);
      if (target < 0) return onBeforeFirst?.();
      if (target >= views) return onAfterLast?.();
      fraction.current = (target * perView) / count;
      writePos(chapterId, fraction.current);
      setView(target);
    },
    [chapterId, onAfterLast, onBeforeFirst],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const onControl = !!target?.closest("button, a");
      const forward =
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        (event.key === " " && !event.shiftKey && !onControl);
      const back =
        event.key === "ArrowLeft" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey && !onControl);
      if (!forward && !back) return;
      event.preventDefault();
      goTo(viewRef.current + (forward ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  const pointer = useRef<{ id: number; x: number; y: number; t: number; dragging: boolean } | null>(
    null,
  );

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      t: performance.now(),
      dragging: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId || event.pointerType === "mouse") return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      start.dragging = true;
      viewportRef.current?.setPointerCapture(event.pointerId);
    }
    const views = Math.ceil(geomRef.current.count / geomRef.current.perView);
    const atEdge = (viewRef.current === 0 && dx > 0) || (viewRef.current === views - 1 && dx < 0);
    setDrag(atEdge ? dx / 3 : dx);
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (start.dragging) {
      setDrag(null);
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.t);
      const far = Math.abs(dx) > geomRef.current.step * 0.18;
      if (far || (velocity > 0.35 && Math.abs(dx) > 24)) goTo(viewRef.current + (dx < 0 ? 1 : -1));
      return;
    }
    // A tap: edges turn the page, the middle is left alone for reading and selecting.
    if (Math.abs(dx) > 8 || Math.abs(event.clientY - start.y) > 8) return;
    if ((event.target as Element).closest("a, button")) return;
    if (window.getSelection()?.isCollapsed === false) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = (event.clientX - rect.left) / rect.width;
    if (rel < 0.3) goTo(viewRef.current - 1);
    else if (rel > 0.7) goTo(viewRef.current + 1);
  };

  const onPointerCancel = () => {
    pointer.current = null;
    setDrag(null);
  };

  const offset = -view * geom.step + (drag ?? 0);
  const animate = !instant && drag === null && !prefersReducedMotion();

  const lastView = Math.ceil(geom.count / geom.perView) - 1;
  const first = view * geom.perView;
  const folio = (page: number) =>
    page < geom.count ? (
      <span className="folio">
        {page + 1}
        {(geom.perView === 1 || page % 2 === 1) && <span className="folio-of"> / {geom.count}</span>}
      </span>
    ) : (
      <span />
    );

  return (
    <div className="stage">
      <article
        className={`page framed ${geom.perView === 2 ? "spread" : ""} ${view === lastView ? "last" : ""}`}
      >
        <div className="running" aria-hidden="true">
          {geom.perView === 2 ? (
            <>
              <span>{first === 0 ? "" : bookTitle}</span>
              <span>{chapterTitle}</span>
            </>
          ) : (
            <span>{first === 0 ? "" : chapterTitle}</span>
          )}
        </div>
        <div
          ref={viewportRef}
          className="page-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div
            ref={colsRef}
            className={`page-columns ${animate ? "animate" : ""}`}
            style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          >
            {children}
          </div>
        </div>
        <div className="folios" aria-live="polite">
          <span className="visually-hidden">Page </span>
          {folio(first)}
          {geom.perView === 2 && folio(first + 1)}
        </div>
        {geom.perView === 2 && (
          <span className="gutter" aria-hidden="true">
            <span className="gutter-diamond" />
          </span>
        )}
      </article>
    </div>
  );
}

function ScrollView({
  chapterId,
  onProgress,
  onHeading,
  children,
}: {
  chapterId: string;
  onProgress: (value: number) => void;
  onHeading: (visible: boolean) => void;
  children: ReactNode;
}) {
  const articleRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const start = openAtEnd === chapterId ? 1 : readPos(chapterId);
    if (openAtEnd === chapterId) openAtEnd = null;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (start > 0 && max > 0) window.scrollTo(0, start * max);
  }, [chapterId]);

  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      onProgress(value);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => writePos(chapterId, value), 250);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [chapterId, onProgress]);

  useEffect(() => {
    const heading = articleRef.current?.querySelector(".chapter-heading");
    if (!heading) return;
    onHeading(heading.getBoundingClientRect().bottom > 60);
    const observer = new IntersectionObserver(
      ([entry]) => onHeading(entry.isIntersecting),
      { rootMargin: "-60px 0px 0px 0px" },
    );
    observer.observe(heading);
    return () => observer.disconnect();
  }, [onHeading]);

  return (
    <article ref={articleRef} className="page framed">
      {children}
    </article>
  );
}

/* ───────────────────────── Editors ───────────────────────── */

function BookEditor({ bookId, go }: { bookId?: BookId; go: Go }) {
  const data = useQuery(api.library.getBook, bookId ? { bookId } : "skip");
  const save = useMutation(api.library.saveBook);
  const remove = useMutation(api.library.removeBook);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    blurb: "",
    narrator: "",
    series: "",
    house: "slytherin" as House,
  });
  const [loaded, setLoaded] = useState(!bookId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data && !loaded) {
      const { title, subtitle, blurb, narrator, series, house } = data.book;
      setForm({ title, subtitle, blurb, narrator, series: series ?? "", house });
      setLoaded(true);
    }
  }, [data, loaded]);

  if (bookId && data === undefined) return <Loading />;
  if (bookId && data === null) return <Missing go={go} />;

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await save({ bookId, ...form });
      go({ view: "book", bookId: id }, true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^.*Uncaught Error: /, "").split("\n")[0]
          : "Could not save.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="editor">
      <TopBar
        onBack={() => window.history.back()}
        backLabel="Cancel"
        title={bookId ? "Edit book" : "New book"}
      />
      <form onSubmit={submit} className="glass framed form">
        <div className="preview">
          <Cover book={form.title ? form : { ...form, title: "Untitled" }} />
        </div>
        <Field label="Title">
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="The Serpent's Daughter"
            required
          />
        </Field>
        <Field label="Subtitle">
          <input
            value={form.subtitle}
            onChange={set("subtitle")}
            placeholder="…and the Philosopher's Stone"
          />
        </Field>
        <Field label="Series">
          <input
            value={form.series}
            onChange={set("series")}
            placeholder="The Malfoy Heir · Year One"
          />
        </Field>
        <Field label="Narrator">
          <input value={form.narrator} onChange={set("narrator")} placeholder="Darecaena Malfoy" />
        </Field>
        <div className="field" role="group" aria-label="House binding">
          <span className="field-label">House binding</span>
          <div className="houses">
            {(Object.keys(HOUSES) as House[]).map((house) => (
              <button
                type="button"
                key={house}
                className={`house-chip house-${house} ${form.house === house ? "active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, house }))}
                aria-pressed={form.house === house}
              >
                {HOUSES[house].label}
              </button>
            ))}
          </div>
        </div>
        <Field label="Blurb">
          <textarea
            value={form.blurb}
            onChange={set("blurb")}
            rows={5}
            placeholder="What lies between these covers…"
          />
        </Field>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          {bookId && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (!confirm("Banish this book and all its chapters?")) return;
                await remove({ bookId });
                go({ view: "shelves" }, true);
              }}
            >
              Banish
            </button>
          )}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Binding…" : "Save book"}
          </button>
        </div>
      </form>
    </main>
  );
}

function ChapterEditor({
  bookId,
  chapterId,
  go,
}: {
  bookId: BookId;
  chapterId?: ChapterId;
  go: Go;
}) {
  const chapter = useQuery(api.library.getChapter, chapterId ? { chapterId } : "skip");
  const save = useMutation(api.library.saveChapter);
  const remove = useMutation(api.library.removeChapter);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(!chapterId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const draftKey = `library:draft:${bookId}:${chapterId ?? "new"}`;

  useEffect(() => {
    if (chapter && !loaded) {
      setTitle(chapter.title);
      setBody(chapter.body);
      setLoaded(true);
    }
  }, [chapter, loaded]);

  // Keep an unsaved copy locally so a closed tab never loses a chapter.
  useEffect(() => {
    if (!loaded) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as { title: string; body: string };
        if (draft.body && draft.body !== (chapter?.body ?? "")) {
          setTitle(draft.title);
          setBody(draft.body);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ title, body }));
    } catch {
      /* ignore */
    }
  }, [title, body, loaded, draftKey]);

  if (chapterId && chapter === undefined) return <Loading />;
  if (chapterId && chapter === null) return <Missing go={go} />;

  const words = body.trim().match(/\S+/g)?.length ?? 0;

  async function commit(published: boolean) {
    setBusy(true);
    setError(null);
    try {
      const id = await save({ bookId, chapterId, title, body, published });
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      go({ view: "read", bookId, chapterId: id }, true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^.*Uncaught Error: /, "").split("\n")[0]
          : "Could not save.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="editor editor-chapter">
      <TopBar
        onBack={() => window.history.back()}
        backLabel="Cancel"
        title={chapterId ? "Edit chapter" : "New chapter"}
        actions={
          <button className="link" onClick={() => setPreview(!preview)}>
            {preview ? "Write" : "Preview"}
          </button>
        }
      />
      <div className="glass framed form">
        <Field label="Chapter title">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The Sorting"
          />
        </Field>
        {preview ? (
          <div className="page framed preview-page">
            <h1 className="chapter-heading">{title || "Untitled"}</h1>
            <div className="prose">
              <Prose body={body} />
            </div>
          </div>
        ) : (
          <Field
            label="Text"
            hint="Blank line = new paragraph · *italic* · **bold** · *** = scene break"
          >
            <textarea
              className="manuscript"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="It began, as most terrible things in the Malfoy family did, with a letter…"
            />
          </Field>
        )}
        <p className="wordcount">
          {words.toLocaleString()} words · {readingTime(words)} read
        </p>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          {chapterId && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (!confirm("Tear this chapter from the book?")) return;
                await remove({ chapterId });
                go({ view: "book", bookId }, true);
              }}
            >
              Delete
            </button>
          )}
          <button className="btn" disabled={busy} onClick={() => commit(false)}>
            Save draft
          </button>
          <button className="btn btn-primary" disabled={busy} onClick={() => commit(true)}>
            {busy ? "Inking…" : "Publish"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-frame framed">{children}</span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
