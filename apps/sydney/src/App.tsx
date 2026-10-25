import {
  ChevronLeft,
  Dumbbell,
  Hospital,
  Info,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Route,
  Star,
  TrainFront,
  Trees,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { suburbs, type AmenityKind, type Suburb } from "./data";
import {
  defaultPrefs,
  essentialsWalk,
  fitScore,
  fmtK,
  largestOtherGroup,
  passes,
  priceFor,
  rentFor,
  type Prefs,
} from "./fit";
import { MapView } from "./MapView";
import { lines } from "./transit";
import { distanceKm, nearestStudio } from "./pilates";
import { schoolTier, TIER_HINT, TIER_LABEL } from "./schools";

const STORE = "gateway-sydney:v1";

type Saved = { prefs: Prefs; shortlist: string[]; transit: boolean };

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Saved>;
      return {
        prefs: { ...defaultPrefs, ...s.prefs },
        shortlist: s.shortlist ?? [],
        transit: s.transit ?? true,
      };
    }
  } catch {}
  return { prefs: defaultPrefs, shortlist: [], transit: true };
}

function useDark() {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return dark;
}

function useWide() {
  const query = "(min-width: 900px)";
  const [wide, setWide] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

type Tab = "all" | "saved";

export function App() {
  const [{ prefs, shortlist, transit }, setSaved] = useState(load);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const dark = useDark();
  const wide = useWide();

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ prefs, shortlist, transit }));
    } catch {}
  }, [prefs, shortlist, transit]);

  const ranked = useMemo(
    () =>
      suburbs
        .map((suburb) => ({ suburb, score: fitScore(suburb, prefs), ok: passes(suburb, prefs) }))
        .sort((a, b) => Number(b.ok) - Number(a.ok) || b.score - a.score),
    [prefs],
  );

  const pins = useMemo(
    () =>
      ranked.map((r) => ({
        suburb: r.suburb,
        score: r.score,
        dim: !r.ok || (tab === "saved" && !shortlist.includes(r.suburb.id)),
        saved: shortlist.includes(r.suburb.id),
      })),
    [ranked, shortlist, tab],
  );

  const list = tab === "saved" ? ranked.filter((r) => shortlist.includes(r.suburb.id)) : ranked;
  const selected = ranked.find((r) => r.suburb.id === selectedId) ?? null;
  const matching = ranked.filter((r) => r.ok).length;

  const setPrefs = (next: Partial<Prefs>) =>
    setSaved((s) => ({ ...s, prefs: { ...s.prefs, ...next } }));
  const toggleSaved = (id: string) =>
    setSaved((s) => ({
      ...s,
      shortlist: s.shortlist.includes(id)
        ? s.shortlist.filter((x) => x !== id)
        : [...s.shortlist, id],
    }));

  const open = (id: string) => {
    setSelectedId(id);
    setExpanded(true);
  };

  // Sheet covers ~half the screen when expanded on phones; side panel on desktop covers nothing below.
  const bottomInset = wide ? 0 : expanded ? window.innerHeight * 0.55 : window.innerHeight * 0.3;

  return (
    <div className="app">
      <MapView
        pins={pins}
        selectedId={selectedId}
        bottomInset={bottomInset}
        dark={dark}
        showTransit={transit}
        onSelect={open}
      />

      <header className="topbar glass">
        <div>
          <h1>Sydney</h1>
          <p>
            {matching} areas · {prefs.beds}bd · {fmtK(prefs.budget)} · {prefs.maxCommute}′
          </p>
        </div>
        <div className="topbar__actions">
          <button
            className="icon-btn"
            onClick={() => setAboutOpen(true)}
            aria-label="About the data"
          >
            <Info size={20} />
          </button>
          <button
            className={`icon-btn ${transit ? "icon-btn--active" : ""}`}
            onClick={() => setSaved((s) => ({ ...s, transit: !s.transit }))}
            aria-pressed={transit}
            aria-label="Show train, metro and light rail lines"
          >
            <Route size={20} />
          </button>
          <button className="icon-btn" onClick={() => setFiltersOpen(true)} aria-label="Filters">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      <section
        className={`sheet glass ${expanded ? "sheet--expanded" : ""}`}
        aria-label="Neighbourhoods"
      >
        <button
          className="sheet__grabber"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Collapse panel" : "Expand panel"}
        >
          <span />
        </button>

        {selected ? (
          <Detail
            suburb={selected.suburb}
            score={selected.score}
            ok={selected.ok}
            prefs={prefs}
            saved={shortlist.includes(selected.suburb.id)}
            onToggleSaved={() => toggleSaved(selected.suburb.id)}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <>
            <div className="segmented" role="tablist">
              <button role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")}>
                Ranked
              </button>
              <button role="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")}>
                Shortlist{shortlist.length ? ` (${shortlist.length})` : ""}
              </button>
            </div>
            {list.length === 0 ? (
              <div className="empty">
                <Star size={28} />
                <p>No shortlisted areas yet.</p>
                <span>Open an area and tap the star to keep it here.</span>
              </div>
            ) : (
              <ul className="list" onScroll={() => !expanded && setExpanded(true)}>
                {list.map((r) => (
                  <li key={r.suburb.id}>
                    <button
                      className={`row ${r.ok ? "" : "row--dim"}`}
                      onClick={() => open(r.suburb.id)}
                    >
                      <Score value={r.score} />
                      <span className="row__main">
                        <span className="row__title">
                          {r.suburb.name}
                          {shortlist.includes(r.suburb.id) && (
                            <Star size={13} className="star-inline" />
                          )}
                        </span>
                        <span className="row__sub">
                          {r.suburb.region} · {r.suburb.commute} min · {essentialsWalk(r.suburb)}{" "}
                          min to essentials
                        </span>
                      </span>
                      <span className="row__price">
                        {fmtK(priceFor(r.suburb, prefs.beds)[0])}
                        <small>{prefs.beds} bed from</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {filtersOpen && (
        <Filters prefs={prefs} onChange={setPrefs} onClose={() => setFiltersOpen(false)} />
      )}
      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function Score({ value }: { value: number }) {
  const tone = value >= 70 ? "great" : value >= 55 ? "good" : "fair";
  return (
    <span className={`score score--${tone}`} aria-label={`Fit ${value} of 100`}>
      {value}
    </span>
  );
}

const AMENITY_ICON: Record<AmenityKind, ReactNode> = {
  supermarket: <ShoppingCart size={16} />,
  food: <UtensilsCrossed size={16} />,
  mall: <ShoppingBag size={16} />,
  hospital: <Hospital size={16} />,
  park: <Trees size={16} />,
  station: <TrainFront size={16} />,
};

function Detail({
  suburb: s,
  score,
  ok,
  prefs,
  saved,
  onToggleSaved,
  onBack,
}: {
  suburb: Suburb;
  score: number;
  ok: boolean;
  prefs: Prefs;
  saved: boolean;
  onToggleSaved: () => void;
  onBack: () => void;
}) {
  const other = largestOtherGroup(s);
  const maxAncestry = Math.max(...s.ancestry.map(([, n]) => n));
  return (
    <article className="detail">
      <div className="detail__nav">
        <button className="text-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Areas
        </button>
        <button
          className={`icon-btn icon-btn--sm ${saved ? "icon-btn--on" : ""}`}
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={saved ? "Remove from shortlist" : "Add to shortlist"}
        >
          <Star size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="detail__scroll">
        <header className="detail__head">
          <Score value={score} />
          <div>
            <h2>{s.name}</h2>
            <p>
              {s.region} · NSW {s.postcode}
            </p>
          </div>
        </header>
        {!ok && <p className="notice">Outside your current filters.</p>}

        <div className="tiles">
          <Tile label="To CBD" value={`${s.commute} min`} sub={s.modes.join(" · ")} />
          <Tile
            label="Safety"
            value={`${s.safety}/5`}
            sub={["", "Low", "Below avg", "Average", "Good", "Very good"][s.safety]}
          />
          <Tile label="Essentials" value={`${essentialsWalk(s)} min`} sub="avg walk" />
        </div>

        <NearbyLines suburb={s} />
        <PilatesCard suburb={s} />

        <Section title="Apartment prices">
          <table className="prices">
            <thead>
              <tr>
                <td />
                <th>Buy</th>
                <th>Rent / week</th>
              </tr>
            </thead>
            <tbody>
              {([2, 3] as const).map((b) => {
                const [lo, hi] = priceFor(s, b);
                const [rlo, rhi] = rentFor(s, b);
                return (
                  <tr key={b} className={b === prefs.beds ? "is-current" : ""}>
                    <th>{b} bed</th>
                    <td className={lo > prefs.budget ? "over" : ""}>
                      {fmtK(lo)}–{fmtK(hi)}
                    </td>
                    <td>
                      ${rlo}–{rhi}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        <Section title="Safety">
          <p>{s.safetyNote}</p>
        </Section>

        <Section title="Schools">
          <p className="hint">
            Kindy starts Jan 2028. Public primaries go by home address — check the exact flat.
          </p>
          <ul className="schools">
            {[...s.schools]
              .sort((a, b) => schoolTier(a.name) - schoolTier(b.name))
              .map((sc) => {
                const tier = schoolTier(sc.name);
                return (
                  <li key={sc.name}>
                    <span className={`chip chip--${sc.sector.toLowerCase()}`}>{sc.sector}</span>
                    <span className="school__main">
                      <strong>{sc.name}</strong>
                      <small>
                        {sc.level}
                        {sc.note ? ` · ${sc.note}` : ""}
                      </small>
                    </span>
                    <span className={`tier tier--${tier}`} title={TIER_HINT[tier]}>
                      {TIER_LABEL[tier]}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Section>

        <p className="hint">
          Tiers are rough (NAPLAN, HSC). Verify on{" "}
          <a href="https://www.myschool.edu.au/" target="_blank" rel="noreferrer">
            My School
          </a>
          .
        </p>

        <Section title="Nearby, on foot">
          <ul className="amenities">
            {[...s.amenities]
              .sort((a, b) => a.walk - b.walk)
              .map((a) => (
                <li key={a.kind + a.name}>
                  <span className="amenity__icon">{AMENITY_ICON[a.kind]}</span>
                  <span className="amenity__name">{a.name}</span>
                  <span
                    className={`amenity__walk ${a.walk <= 8 ? "near" : a.walk > 20 ? "far" : ""}`}
                  >
                    {a.walk} min
                  </span>
                </li>
              ))}
          </ul>
        </Section>

        <Section title="Character">
          <p>{s.character}</p>
        </Section>

        <Section title="Community (Census 2021)">
          <ul className="bars">
            {s.ancestry.map(([name, pct]) => (
              <li key={name}>
                <span>{name}</span>
                <span className="bar">
                  <span style={{ width: `${(pct / maxAncestry) * 100}%` }} />
                </span>
                <span>{pct}%</span>
              </li>
            ))}
          </ul>
          <p className="hint">
            {s.bornOverseas}% born overseas.
            {other ? ` Biggest non-Anglo group: ${other[0]} ${other[1]}%.` : ""}
          </p>
        </Section>

        <div className="links">
          <a
            href={`https://www.domain.com.au/suburb-profile/${s.id}-nsw-${s.postcode}`}
            target="_blank"
            rel="noreferrer"
          >
            Domain suburb profile
          </a>
          <a
            href="https://www.abs.gov.au/census/find-census-data/search-by-area"
            target="_blank"
            rel="noreferrer"
          >
            ABS QuickStats
          </a>
          <a href="https://www.bocsar.nsw.gov.au/" target="_blank" rel="noreferrer">
            BOCSAR crime data
          </a>
          <a href="https://schoolfinder.education.nsw.gov.au/" target="_blank" rel="noreferrer">
            NSW School Finder
          </a>
        </div>
      </div>
    </article>
  );
}

/** Lines with a stop within ~1.3 km of the suburb centre. */
function NearbyLines({ suburb }: { suburb: Suburb }) {
  const near = lines.filter((line) =>
    line.stops.some(([, lat, lng]) => distanceKm(suburb.lat, suburb.lng, lat, lng) < 1.3),
  );
  if (near.length === 0) return null;
  return (
    <div className="line-chips" aria-label="Lines nearby">
      {near.map((line) => (
        <span key={line.id} className="line-chip">
          <span style={{ background: line.color }} />
          {line.name}
        </span>
      ))}
    </div>
  );
}

function PilatesCard({ suburb }: { suburb: Suburb }) {
  const { studio, km } = nearestStudio(suburb.lat, suburb.lng);
  // ~12 min per km on foot; beyond 2 km assume a short bus or drive.
  const how = km <= 2 ? `${Math.max(1, Math.round(km * 12))} min walk` : `${km.toFixed(1)} km away`;
  return (
    <div className={`pilates ${km <= 2 ? "pilates--near" : ""}`}>
      <span className="pilates__icon">
        <Dumbbell size={16} />
      </span>
      <span className="pilates__main">
        <strong>STRONG · {studio.name}</strong>
        <small>{studio.address}</small>
      </span>
      <span className="pilates__dist">{how}</span>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal" role="presentation" onClick={onClose}>
      <div
        className="modal__card glass"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Segment<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Filters({
  prefs,
  onChange,
  onClose,
}: {
  prefs: Prefs;
  onChange: (p: Partial<Prefs>) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Filters" onClose={onClose}>
      <div className="field">
        <span className="field__label">Bedrooms</span>
        <Segment
          label="Bedrooms"
          value={prefs.beds}
          onChange={(beds) => onChange({ beds })}
          options={[
            { value: 2, label: "2 bed" },
            { value: 3, label: "3 bed" },
          ]}
        />
      </div>
      <div className="field">
        <label htmlFor="budget">
          Budget <strong>{fmtK(prefs.budget)}</strong>
        </label>
        <input
          id="budget"
          type="range"
          min={600}
          max={2500}
          step={50}
          value={prefs.budget}
          onChange={(e) => onChange({ budget: Number(e.target.value) })}
        />
      </div>
      <div className="field">
        <span className="field__label">Max commute to CBD</span>
        <Segment
          label="Max commute"
          value={prefs.maxCommute}
          onChange={(maxCommute) => onChange({ maxCommute })}
          options={[25, 30, 35, 45].map((n) => ({ value: n, label: `${n} min` }))}
        />
      </div>
      <div className="field">
        <span className="field__label">Hide areas where one non-Anglo ancestry is at least</span>
        <Segment
          label="Ancestry cap"
          value={prefs.maxSingleGroup}
          onChange={(maxSingleGroup) => onChange({ maxSingleGroup })}
          options={[
            { value: 100, label: "Off" },
            { value: 40, label: "40%" },
            { value: 30, label: "30%" },
            { value: 20, label: "20%" },
          ]}
        />
      </div>
      <button className="primary" onClick={onClose}>
        Done
      </button>
    </Modal>
  );
}

function About({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="About this data" onClose={onClose}>
      <div className="about">
        <p>
          Snapshot, 2025–26. {suburbs.length} areas ≤45 min to CBD. Shortlist here, verify via
          links.
        </p>
        <ul>
          <li>
            <strong>Commute</strong> — weekday peak, door to Town Hall / Wynyard.
          </li>
          <li>
            <strong>Prices</strong> — unit medians, indicative. 3 bed units are rare.
          </li>
          <li>
            <strong>Safety</strong> — vs Greater Sydney (BOCSAR).
          </li>
          <li>
            <strong>Community</strong> — Census 2021 ancestry.
          </li>
          <li>
            <strong>STRONG Pilates</strong> — official studio list, Oct 2026.
          </li>
          <li>
            <strong>Fit score</strong> — essentials first, then safety, commute, price.
          </li>
        </ul>
      </div>
    </Modal>
  );
}
