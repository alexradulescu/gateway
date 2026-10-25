import { useMutation, useQuery } from "convex/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
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

function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);
  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = useCallback((next: Route, replace = false) => {
    const url = routeToUrl(next);
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
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

/* ───────────────────────── App ───────────────────────── */

export function App() {
  const { route, go } = useRouter();
  const [scribe, setScribe] = useStored("library:scribe", false);
  const [lastRead, setLastRead] = useStored<Record<string, string>>("library:lastRead", {});

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
            onRead={(chapterId) => setLastRead((prev) => ({ ...prev, [route.bookId]: chapterId }))}
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

/* ───────────────────────── Ambience ───────────────────────── */

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

/** Thin double-line frame with scooped corners and a chevron notch, top and bottom. */
function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frame ${className}`}>
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
  actions,
}: {
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="back" onClick={onBack}>
          <span aria-hidden="true">‹</span> {backLabel ?? "Back"}
        </button>
      ) : (
        <span />
      )}
      {title && <span className="topbar-title">{title}</span>}
      <div className="topbar-actions">{actions}</div>
    </header>
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
  lastRead: Record<string, string>;
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
  const continueBook = books?.find((book) => lastRead[book._id]);

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
        <p className="lede">Tales the Ministry would rather you didn't read.</p>
      </Frame>

      {continueBook && (
        <button
          className="continue glass"
          onClick={() =>
            go({
              view: "read",
              bookId: continueBook._id,
              chapterId: lastRead[continueBook._id] as ChapterId,
            })
          }
        >
          <span className="continue-label">Continue reading</span>
          <span className="continue-title">{continueBook.title}</span>
          <span className="continue-arrow" aria-hidden="true">
            ›
          </span>
        </button>
      )}

      {books === undefined ? (
        <Loading label="Lumos…" />
      ) : (
        <div className="shelf">
          {visible.map((book) => (
            <button
              key={book._id}
              className="tome"
              onClick={() => go({ view: "book", bookId: book._id })}
            >
              <Cover book={book} />
              <span className="tome-meta">
                {book.chapterCount} {book.chapterCount === 1 ? "chapter" : "chapters"}
                {scribe && book.draftCount > 0 && ` · ${book.draftCount} draft`}
              </span>
            </button>
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
      <span className="cover-frame">
        {book.series && <span className="cover-series">{book.series}</span>}
        <Crest house={book.house} />
        <span className="cover-title">{book.title}</span>
        {book.subtitle && <span className="cover-subtitle">{book.subtitle}</span>}
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
  lastRead: Record<string, string>;
}) {
  const data = useQuery(api.library.getBook, { bookId });
  const move = useMutation(api.library.moveChapter);

  if (data === undefined) return <Loading />;
  if (data === null) return <Missing go={go} />;

  const { book, chapters } = data;
  const readable = chapters.filter((chapter) => scribe || chapter.published);
  const words = readable.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const resume = lastRead[bookId] && readable.find((chapter) => chapter._id === lastRead[bookId]);
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
            <button
              className="btn btn-primary"
              onClick={() => go({ view: "read", bookId, chapterId: start._id })}
            >
              {resume ? "Continue reading" : "Begin reading"}
            </button>
          )}
        </div>
      </section>

      {book.blurb && <p className="blurb">{book.blurb}</p>}

      <section className="contents glass">
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
              <li key={chapter._id} className={lastRead[bookId] === chapter._id ? "current" : ""}>
                <button
                  className="chapter-row"
                  onClick={() => go({ view: "read", bookId, chapterId: chapter._id })}
                >
                  <span className="chapter-num">{toRoman(index + 1)}</span>
                  <span className="chapter-title">
                    {chapter.title}
                    {!chapter.published && <span className="badge">Draft</span>}
                  </span>
                  <span className="chapter-time">{readingTime(chapter.wordCount)}</span>
                </button>
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
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (chapter) onRead(chapter._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?._id]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter?._id]);

  if (data === undefined || chapter === undefined) return <Loading />;
  if (data === null || chapter === null) return <Missing go={go} />;

  const list = data.chapters.filter((item) => scribe || item.published);
  const index = list.findIndex((item) => item._id === chapterId);
  const prev = list[index - 1];
  const next = list[index + 1];

  return (
    <main className={`reader paper-${paper}`} style={{ ["--reader-size" as string]: `${size}px` }}>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      <TopBar
        onBack={() => go({ view: "book", bookId })}
        backLabel="Contents"
        title={data.book.title}
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
              className="icon-btn"
              aria-label="Reading settings"
              aria-expanded={showSettings}
              onClick={() => setShowSettings(!showSettings)}
            >
              Aa
            </button>
          </>
        }
      />
      {showSettings && (
        <div className="settings glass" role="dialog" aria-label="Reading settings">
          <div className="seg">
            <button aria-label="Smaller text" onClick={() => setSize(Math.max(15, size - 1))}>
              A−
            </button>
            <span>{size}</span>
            <button aria-label="Larger text" onClick={() => setSize(Math.min(26, size + 1))}>
              A+
            </button>
          </div>
          <div className="seg">
            <button
              className={paper === "parchment" ? "active" : ""}
              onClick={() => setPaper("parchment")}
            >
              Parchment
            </button>
            <button className={paper === "night" ? "active" : ""} onClick={() => setPaper("night")}>
              Lumos
            </button>
          </div>
        </div>
      )}

      <article className="page">
        <p className="chapter-kicker">Chapter {toRoman(index + 1)}</p>
        <h1 className="chapter-heading">{chapter.title}</h1>
        {!chapter.published && <p className="draft-note">Draft — only visible in scribe mode</p>}
        <Ornament />
        <div className="prose">
          <Prose body={chapter.body} />
        </div>
        <Ornament />
      </article>

      <nav className="pager">
        {prev ? (
          <button
            className="btn"
            onClick={() => go({ view: "read", bookId, chapterId: prev._id }, true)}
          >
            ‹ {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            className="btn btn-primary"
            onClick={() => go({ view: "read", bookId, chapterId: next._id }, true)}
          >
            {next.title} ›
          </button>
        ) : (
          <p className="fin">Mischief managed — for now.</p>
        )}
      </nav>
    </main>
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
      <form onSubmit={submit} className="glass form">
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
      <div className="glass form">
        <Field label="Chapter title">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The Sorting"
          />
        </Field>
        {preview ? (
          <div className="page preview-page">
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
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
