import {
  Anchor,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Construction,
  Download,
  Flame,
  Hammer,
  HeartPulse,
  House,
  Landmark,
  Leaf,
  LockKeyhole,
  Menu,
  Minus,
  PackageOpen,
  Pause,
  Pickaxe,
  Play,
  Plus,
  RotateCcw,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Sprout,
  Swords,
  TreePine,
  Upload,
  Users,
  Wheat,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CityStage } from "./CityStage";
import {
  BUILDING_DEFINITIONS,
  BUILDING_ORDER,
  BUILDING_RESEARCH_REQUIREMENTS,
  CRISIS_DEFINITIONS,
  DISTRICT_COSTS,
  DISTRICT_NAMES,
  DOCTRINE_RESEARCH_REQUIREMENTS,
  GAME_TIMING,
  PLOT_DISTRICTS,
  RESEARCH_DEFINITIONS,
  RESOURCE_LABELS,
  advanceCity,
  advanceOffline,
  applyMinorOpportunity,
  canAfford,
  createCity,
  demolishBuilding,
  developerDamage,
  developerGrant,
  finishAllProjects,
  getCityMetrics,
  getDefenceForces,
  isPlotUnlocked,
  maybeTriggerScheduledCrisis,
  moveBuilding,
  parseCity,
  placeBuilding,
  queueRepair,
  queueUpgrade,
  renameCity,
  resolveCrisis,
  resolveHarbourMission,
  serializeCity,
  setDoctrine,
  setStaffing,
  startExpansion,
  startResearch,
  triggerCrisis,
  upgradeRoads,
  upgradeWalls,
  type Building,
  type BuildingType,
  type CityState,
  type CrisisType,
  type Doctrine,
  type ResourceKey,
  type Resources,
  type Staffing,
} from "./game";

const SAVE_KEY = "aegean-polis.city.v1";
const STAFFING_LEVELS: Staffing[] = [0, 0.5, 1, 1.25];
const DOCTRINES: { value: Doctrine; label: string; detail: string }[] = [
  { value: "balanced", label: "Balanced", detail: "Steady growth across the whole polis." },
  { value: "industrial", label: "Industrial", detail: "Workshops and extraction lead." },
  { value: "scholarly", label: "Scholarly", detail: "Knowledge and public learning lead." },
  { value: "maritime", label: "Maritime", detail: "Harbour trade and coastal defence lead." },
  { value: "civic", label: "Civic", detail: "Health, safety and administration lead." },
  { value: "cultural", label: "Cultural", detail: "Beauty, gathering and the arts lead." },
  { value: "pastoral", label: "Resort", detail: "Gardens, calm streets and wellbeing lead." },
];

const RESOURCE_ICONS = {
  food: Wheat,
  timber: TreePine,
  stone: Pickaxe,
  coin: CircleDollarSign,
  goods: PackageOpen,
  knowledge: BookOpen,
};

const BUILDING_ICONS = {
  house: House,
  farm: Sprout,
  lumber: TreePine,
  quarry: Pickaxe,
  warehouse: PackageOpen,
  workshop: Hammer,
  market: CircleDollarSign,
  academy: BookOpen,
  clinic: HeartPulse,
  firewatch: Flame,
  barracks: Shield,
  park: Leaf,
};

type PanelName = "research" | "city" | "developer" | null;
type Speed = 0 | 1 | 2 | 20;

const INTEGER_FORMATTER = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const DECIMAL_FORMATTER = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const COMPACT_FORMATTER = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  notation: "compact",
});

function loadCity(): CityState {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return createCity();
    const city = parseCity(saved);
    const elapsed = Math.max(0, (Date.now() - city.lastSavedAt) / 1000);
    return { ...advanceOffline(city, elapsed), lastSavedAt: Date.now() };
  } catch {
    return createCity();
  }
}

function formatNumber(value: number) {
  if (value >= 10_000) return COMPACT_FORMATTER.format(value);
  return value < 100 ? DECIMAL_FORMATTER.format(value) : INTEGER_FORMATTER.format(value);
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.ceil(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

function costParts(resources: Resources) {
  return (Object.keys(resources) as ResourceKey[]).reduce<{ key: ResourceKey; value: number }[]>(
    (parts, key) => {
      if (resources[key] > 0) parts.push({ key, value: resources[key] });
      return parts;
    },
    [],
  );
}

function atlasStyle(index: number): CSSProperties {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return {
    "--atlas-x": `${column * (100 / 3)}%`,
    "--atlas-y": `${row * 50}%`,
  } as CSSProperties;
}

function AtlasSprite({
  type,
  level = 1,
  className = "",
}: {
  type: BuildingType;
  level?: number;
  className?: string;
}) {
  const atlas =
    level === 1
      ? "/polis/assets/buildings-atlas.png"
      : `/polis/assets/buildings-atlas-level-${Math.min(3, level)}.png`;
  return (
    <span
      className={`atlas-sprite ${className}`}
      style={
        {
          ...atlasStyle(BUILDING_DEFINITIONS[type].atlasIndex),
          "--atlas-image": `url("${atlas}")`,
        } as CSSProperties
      }
      aria-hidden="true"
    />
  );
}

function CostLine({ resources }: { resources: Resources }) {
  return (
    <span className="cost-line">
      {costParts(resources).map(({ key, value }) => {
        const Icon = RESOURCE_ICONS[key];
        return (
          <span key={key} title={RESOURCE_LABELS[key]}>
            <Icon size={12} strokeWidth={2.2} />
            {formatNumber(value)}
          </span>
        );
      })}
    </span>
  );
}

function Progress({
  label,
  remaining,
  total,
}: {
  label: string;
  remaining: number;
  total: number;
}) {
  const percent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  return (
    <div className="progress-block">
      <span>
        <strong>{label}</strong>
        <small>{formatTime(remaining)}</small>
      </span>
      <span className="progress-track" aria-label={`${label}: ${Math.round(percent)}% complete`}>
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </span>
    </div>
  );
}

function Drawer({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-labelledby="drawer-title"
      onPointerDown={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const outsidePanel =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;
        if (event.target === event.currentTarget && outsidePanel) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="drawer-header">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="drawer-title">{title}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close panel">
          <X size={20} />
        </button>
      </header>
      <div className="drawer-body">{children}</div>
    </dialog>
  );
}

function CrisisDialog({
  city,
  onResolve,
}: {
  city: CityState;
  onResolve: (response: "mobilise" | "spend" | "shelter") => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const crisis = city.pendingCrisis;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  if (!crisis) return null;

  return (
    <dialog
      ref={dialogRef}
      className="crisis-overlay"
      aria-labelledby="crisis-title"
      onCancel={(event) => event.preventDefault()}
    >
      <section className="crisis-card">
        <span className="crisis-emblem">
          {crisis === "invasion" ? (
            <Swords size={31} />
          ) : crisis === "fire" ? (
            <Flame size={31} />
          ) : (
            <Shield size={31} />
          )}
        </span>
        <span className="eyebrow">City crisis</span>
        <h2 id="crisis-title">{CRISIS_DEFINITIONS[crisis].title}</h2>
        <p>{CRISIS_DEFINITIONS[crisis].summary}</p>
        <div className="warning-box">
          <Shield size={17} />
          {CRISIS_DEFINITIONS[crisis].warning}
        </div>
        <div className="crisis-actions">
          <button type="button" className="primary-action" onClick={() => onResolve("mobilise")}>
            <Swords size={18} />
            <span>
              <strong>Mobilise</strong>
              <small>35 food · 45 coin</small>
            </span>
          </button>
          <button type="button" onClick={() => onResolve("spend")}>
            <Hammer size={18} />
            <span>
              <strong>Spend freely</strong>
              <small>Materials · 80 coin</small>
            </span>
          </button>
          <button type="button" onClick={() => onResolve("shelter")}>
            <House size={18} />
            <span>
              <strong>Shelter</strong>
              <small>Accept greater risk</small>
            </span>
          </button>
        </div>
      </section>
    </dialog>
  );
}

function FoundingDialog({ onFound }: { onFound: (name: string) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("Thalassa");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="founding-overlay"
      aria-labelledby="founding-title"
      onCancel={(event) => event.preventDefault()}
    >
      <form
        className="founding-card"
        onSubmit={(event) => {
          event.preventDefault();
          onFound(name.trim() || "Thalassa");
        }}
      >
        <span className="city-seal">
          <Landmark size={27} />
        </span>
        <span className="eyebrow">A new island awaits</span>
        <h1 id="founding-title">Found your polis</h1>
        <p>
          Twelve plots are cleared around a small starter settlement. Name the city you will help
          grow.
        </p>
        <label>
          City name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={36}
            autoFocus
          />
        </label>
        <button type="submit" className="primary-action">
          Raise the city seal
        </button>
      </form>
    </dialog>
  );
}

export function App() {
  const [city, setCity] = useState(loadCity);
  const [needsFounding, setNeedsFounding] = useState(() => {
    try {
      return localStorage.getItem(SAVE_KEY) === null;
    } catch {
      return false;
    }
  });
  const [speed, setSpeed] = useState<Speed>(1);
  const [panel, setPanel] = useState<PanelName>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [moveMode, setMoveMode] = useState<string | null>(null);
  const [toast, setToast] = useState("Welcome to the sunlit island of Thalassa.");
  const [camera, setCamera] = useState({ x: 0, y: -28, zoom: 0.78 });
  const [layoutEditorEnabled, setLayoutEditorEnabled] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const metrics = useMemo(() => getCityMetrics(city), [city]);
  const defenceForces = useMemo(() => getDefenceForces(city), [city]);
  const selectedBuilding = city.buildings.find((building) => building.id === selectedBuildingId);
  const newestEvent = city.eventLog[0];
  const unlockedDistricts = new Set(city.unlockedDistricts);
  const availablePlots = PLOT_DISTRICTS.reduce(
    (sum, plots, index) => sum + (unlockedDistricts.has(index) ? plots.length : 0),
    0,
  );
  const occupiedPlots = city.buildings.length;
  const nightStrength = 0.08 + ((Math.sin(city.activeSeconds / 95) + 1) / 2) * 0.2;

  const tutorialGoals = [
    {
      label: "Build an academy",
      complete: city.buildings.some((building) => building.type === "academy"),
    },
    {
      label: "Raise a fire watch",
      complete: city.buildings.some((building) => building.type === "firewatch"),
    },
    { label: "Improve the roads", complete: city.roadLevel > 1 },
    { label: "Clear a new district", complete: city.unlockedDistricts.length > 1 },
  ];
  const currentGoal = tutorialGoals.find((goal) => !goal.complete);

  useEffect(() => {
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(5, (now - previous) / 1000);
      previous = now;
      if (speed === 0) return;
      setCity((current) =>
        maybeTriggerScheduledCrisis(advanceCity(current, elapsed, speed), Date.now()),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [speed]);

  useEffect(() => {
    if (needsFounding) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(SAVE_KEY, serializeCity({ ...city, lastSavedAt: Date.now() }));
      } catch {
        // Export remains available if browser storage is disabled.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [city, needsFounding]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateCity(action: (current: CityState) => CityState, success?: string) {
    try {
      const next = action(city);
      setCity(next);
      if (success) setToast(success);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "That action could not be completed.");
    }
  }

  function handlePlot(plotId: number) {
    if (moveMode) {
      updateCity((current) => moveBuilding(current, moveMode, plotId), "Building moved.");
      setMoveMode(null);
      setSelectedBuildingId(null);
      return;
    }
    if (buildMode) {
      updateCity(
        (current) => placeBuilding(current, buildMode, plotId),
        `${BUILDING_DEFINITIONS[buildMode].shortName} queued.`,
      );
      setBuildMode(null);
      return;
    }
    if (!isPlotUnlocked(city, plotId)) {
      setPanel("city");
      return;
    }
    setSelectedBuildingId(null);
  }

  function selectBuilding(building: Building) {
    setBuildMode(null);
    setMoveMode(null);
    setSelectedBuildingId(building.id);
  }

  function beginBuild(type: BuildingType) {
    if (city.construction) {
      setToast("The builders are already working.");
      return;
    }
    const requirement = BUILDING_RESEARCH_REQUIREMENTS[type];
    if (requirement && !city.completedResearch.includes(requirement)) {
      const research = RESEARCH_DEFINITIONS.find((definition) => definition.id === requirement);
      setToast(`Complete ${research?.label ?? requirement} first.`);
      return;
    }
    if (!canAfford(city.resources, BUILDING_DEFINITIONS[type].cost)) {
      setToast("More resources are needed.");
      return;
    }
    setBuildMode((current) => (current === type ? null : type));
    setMoveMode(null);
    setSelectedBuildingId(null);
    setToast(`Choose an open plot for ${BUILDING_DEFINITIONS[type].name}.`);
  }

  function zoomBy(amount: number) {
    setCamera((current) => ({
      ...current,
      zoom: Math.max(0.45, Math.min(1.45, current.zoom + amount)),
    }));
  }

  function exportCity() {
    const blob = new Blob([serializeCity({ ...city, lastSavedAt: Date.now() })], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${city.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-") || "polis"}.polis.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Frozen city file downloaded.");
  }

  async function importCity(file: File) {
    try {
      const imported = parseCity(await file.text());
      if (
        !window.confirm(
          `Replacing ${city.name} cannot be undone. Download its backup first if you want to keep it.\n\nContinue with ${imported.name}?`,
        )
      ) {
        return;
      }
      setCity({ ...imported, lastSavedAt: Date.now(), pendingCrisis: null });
      setPanel(null);
      setSelectedBuildingId(null);
      setToast(`${imported.name} restored.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "The city file could not be read.");
    }
  }

  function createNewCity() {
    if (
      !window.confirm(
        "Download a backup before founding a new city? Select Cancel to keep playing.",
      )
    ) {
      return;
    }
    exportCity();
    const name = window.prompt("Name the new polis", "Thalassa");
    if (name === null) return;
    setCity(createCity(name));
    setSelectedBuildingId(null);
    setPanel(null);
    setToast(`${name || "Thalassa"} founded.`);
  }

  function changeCityName() {
    const name = window.prompt("City name", city.name);
    if (name !== null) updateCity((current) => renameCity(current, name), "City renamed.");
  }

  const cityYear = Math.max(1, Math.floor(city.activeSeconds / 1200) + 1);

  return (
    <main
      className={`game-shell game-shell--${city.doctrine} ${
        layoutEditorEnabled ? "game-shell--layout-editor" : ""
      }`}
    >
      <header className="top-bar">
        <button className="city-mark" type="button" onClick={() => setPanel("city")}>
          <span className="city-seal">
            <Landmark size={24} />
          </span>
          <span>
            <small>Aegean Polis · Year {cityYear}</small>
            <strong>{city.name}</strong>
          </span>
          <ChevronRight size={16} />
        </button>

        <section className="resource-ribbon" aria-label="City resources">
          {(Object.keys(city.resources) as ResourceKey[]).map((key) => {
            const Icon = RESOURCE_ICONS[key];
            return (
              <div className="resource" key={key} title={RESOURCE_LABELS[key]}>
                <Icon size={17} />
                <span>
                  <small>{RESOURCE_LABELS[key]}</small>
                  <strong>{formatNumber(city.resources[key])}</strong>
                </span>
              </div>
            );
          })}
        </section>

        <nav className="top-actions" aria-label="City controls">
          <button type="button" onClick={() => setPanel("research")} aria-label="Research">
            <BookOpen size={18} />
            <span>Research</span>
            {city.research && <i />}
          </button>
          <button type="button" onClick={() => setPanel("city")} aria-label="City">
            <ScrollText size={18} />
            <span>City</span>
          </button>
          <button type="button" onClick={() => setPanel("developer")} aria-label="Developer tools">
            <Settings size={18} />
            <span className="desktop-only">Tools</span>
          </button>
        </nav>
      </header>

      <section
        className={`city-viewport ${buildMode || moveMode ? "city-viewport--placing" : ""}`}
        aria-label="Isometric city view"
      >
        <CityStage
          city={city}
          camera={camera}
          selectedBuildingId={selectedBuildingId}
          placementActive={Boolean(buildMode || moveMode)}
          editorEnabled={layoutEditorEnabled}
          onCameraChange={setCamera}
          onPlot={handlePlot}
          onBuilding={selectBuilding}
          onLandmark={() => setPanel("city")}
          onEditorClose={() => setLayoutEditorEnabled(false)}
        />
        <div className="night-wash" style={{ opacity: nightStrength }} aria-hidden="true" />
      </section>

      <aside className="city-vitals parchment" aria-label="City condition">
        <div>
          <span>
            <Users size={15} /> Population
          </span>
          <strong>
            {formatNumber(city.population)} <small>/ {metrics.housing}</small>
          </strong>
        </div>
        <div>
          <span>
            <Sparkles size={15} /> Happiness
          </span>
          <strong>{metrics.happiness}%</strong>
        </div>
        <div>
          <span>
            <HeartPulse size={15} /> Safety
          </span>
          <strong>{metrics.safety}%</strong>
        </div>
        <div>
          <span>
            <Shield size={15} /> Defence
          </span>
          <strong>{metrics.defence}</strong>
        </div>
      </aside>

      {!city.tutorialDismissed && currentGoal && (
        <aside className="tutorial-card parchment">
          <span className="eyebrow">Civic goal</span>
          <button
            className="bare-close"
            type="button"
            onClick={() => setCity((current) => ({ ...current, tutorialDismissed: true }))}
            aria-label="Dismiss civic goals"
          >
            <X size={15} />
          </button>
          <strong>{currentGoal.label}</strong>
          <p>Complete the goal at your own pace. There is no deadline.</p>
          <span className="goal-count">
            {tutorialGoals.filter((goal) => goal.complete).length}/{tutorialGoals.length}
          </span>
        </aside>
      )}

      {(city.construction || city.research || city.expansion) && (
        <aside className="project-stack parchment" aria-label="Active projects">
          {city.construction && (
            <Progress
              label={city.construction.label}
              remaining={city.construction.remainingSeconds}
              total={city.construction.totalSeconds}
            />
          )}
          {city.research && (
            <Progress
              label={city.research.label}
              remaining={city.research.remainingSeconds}
              total={city.research.totalSeconds}
            />
          )}
          {city.expansion && (
            <Progress
              label={city.expansion.label}
              remaining={city.expansion.remainingSeconds}
              total={city.expansion.totalSeconds}
            />
          )}
        </aside>
      )}

      {city.crisisWarning && city.crisisWarningEndsAt !== null && (
        <aside className="crisis-warning-banner parchment" aria-label="Crisis warning">
          <span className="visually-hidden" role="alert">
            Crisis warning: {CRISIS_DEFINITIONS[city.crisisWarning].title}. Review your city
            preparations.
          </span>
          <span className="crisis-warning-icon">
            <Shield size={20} />
          </span>
          <span>
            <small>Warning</small>
            <strong>{CRISIS_DEFINITIONS[city.crisisWarning].title}</strong>
            <p aria-hidden="true">
              About {formatTime(Math.max(0, city.crisisWarningEndsAt - city.activeSeconds))} to
              prepare.
            </p>
          </span>
          <button type="button" onClick={() => setPanel("city")}>
            Review city
          </button>
        </aside>
      )}

      <aside className={`event-note parchment event-note--${newestEvent.tone}`}>
        <span className="eyebrow">Latest news</span>
        <strong>{newestEvent.title}</strong>
        <p>{newestEvent.detail}</p>
      </aside>

      <fieldset className="camera-controls parchment">
        <legend className="visually-hidden">Camera controls</legend>
        <button type="button" onClick={() => zoomBy(0.12)} aria-label="Zoom in">
          <ZoomIn size={20} />
        </button>
        <button
          type="button"
          onClick={() => setCamera({ x: 0, y: -28, zoom: 0.78 })}
          aria-label="Reset camera"
        >
          <RotateCcw size={18} />
        </button>
        <button type="button" onClick={() => zoomBy(-0.12)} aria-label="Zoom out">
          <ZoomOut size={20} />
        </button>
      </fieldset>

      <fieldset className="speed-control parchment">
        <legend className="visually-hidden">Simulation speed</legend>
        {[0, 1, 2].map((value) => (
          <button
            type="button"
            key={value}
            className={speed === value ? "active" : ""}
            onClick={() => setSpeed(value as Speed)}
            aria-label={value === 0 ? "Pause simulation" : `${value} times speed`}
          >
            {value === 0 ? <Pause size={15} /> : value === 1 ? <Play size={14} /> : "2×"}
          </button>
        ))}
        {speed === 20 && (
          <button type="button" className="active">
            20×
          </button>
        )}
      </fieldset>

      <section className="build-dock parchment" aria-label="Construction">
        <header>
          <span>
            <Construction size={17} />
            <strong>Build</strong>
          </span>
          <small>
            {occupiedPlots} of {availablePlots} plots used
          </small>
        </header>
        <div className="build-list">
          {BUILDING_ORDER.map((type) => {
            const definition = BUILDING_DEFINITIONS[type];
            const affordable = canAfford(city.resources, definition.cost);
            const requirement = BUILDING_RESEARCH_REQUIREMENTS[type];
            const unlocked = !requirement || city.completedResearch.includes(requirement);
            const requiredResearch = RESEARCH_DEFINITIONS.find(
              (research) => research.id === requirement,
            );
            const Icon = BUILDING_ICONS[type];
            return (
              <button
                type="button"
                key={type}
                disabled={!unlocked}
                className={[
                  "build-option",
                  buildMode === type ? "build-option--active" : "",
                  !affordable ? "build-option--unaffordable" : "",
                  !unlocked ? "build-option--locked" : "",
                ].join(" ")}
                onClick={() => beginBuild(type)}
                aria-label={
                  unlocked
                    ? `Build ${definition.name}`
                    : `${definition.name}, requires ${requiredResearch?.label ?? requirement}`
                }
              >
                <AtlasSprite type={type} className="build-thumb" />
                <span className="build-option-copy">
                  <span>
                    <Icon size={13} /> {definition.shortName}
                  </span>
                  {unlocked ? (
                    <CostLine resources={definition.cost} />
                  ) : (
                    <small className="research-lock">
                      <LockKeyhole size={10} /> {requiredResearch?.label}
                    </small>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedBuilding && (
        <>
          <button
            type="button"
            className="building-panel-backdrop"
            aria-label="Close building details"
            onClick={() => setSelectedBuildingId(null)}
          />
          <aside className="building-panel parchment">
            <header>
              <span className="eyebrow">Plot {selectedBuilding.plotId + 1}</span>
              <button
                className="bare-close"
                type="button"
                onClick={() => setSelectedBuildingId(null)}
                aria-label="Close building details"
              >
                <X size={17} />
              </button>
              <AtlasSprite type={selectedBuilding.type} level={selectedBuilding.level} />
              <div>
                <h2>{BUILDING_DEFINITIONS[selectedBuilding.type].name}</h2>
                <p>
                  Level {selectedBuilding.level} · {selectedBuilding.condition}% condition
                </p>
              </div>
            </header>
            <p className="building-description">
              {BUILDING_DEFINITIONS[selectedBuilding.type].description}
            </p>
            {BUILDING_DEFINITIONS[selectedBuilding.type].workers > 0 && (
              <label className="staffing-row">
                <span>Work priority</span>
                <select
                  value={selectedBuilding.staffing}
                  onChange={(event) =>
                    updateCity((current) =>
                      setStaffing(
                        current,
                        selectedBuilding.id,
                        Number(event.target.value) as Staffing,
                      ),
                    )
                  }
                >
                  {STAFFING_LEVELS.map((level) => (
                    <option value={level} key={level}>
                      {level === 0
                        ? "Closed"
                        : level === 0.5
                          ? "Low"
                          : level === 1
                            ? "Normal"
                            : "High"}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="panel-actions">
              {selectedBuilding.condition < 100 && (
                <button
                  type="button"
                  className="primary-action"
                  onClick={() =>
                    updateCity(
                      (current) => queueRepair(current, selectedBuilding.id),
                      "Repairs queued.",
                    )
                  }
                >
                  <Hammer size={17} /> Repair
                </button>
              )}
              <button
                type="button"
                className="primary-action"
                disabled={selectedBuilding.level >= 3 || selectedBuilding.condition < 100}
                onClick={() =>
                  updateCity(
                    (current) => queueUpgrade(current, selectedBuilding.id),
                    "Upgrade queued.",
                  )
                }
              >
                <Plus size={17} /> Upgrade
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoveMode(selectedBuilding.id);
                  setSelectedBuildingId(null);
                  setToast("Choose an empty plot. Moving costs 25 coin and 10 timber.");
                }}
              >
                <Menu size={17} /> Move
              </button>
              <button
                type="button"
                className="danger-action"
                onClick={() => {
                  if (
                    !window.confirm("Demolish this building and recover 35% of its base materials?")
                  ) {
                    return;
                  }
                  updateCity(
                    (current) => demolishBuilding(current, selectedBuilding.id),
                    "Building demolished.",
                  );
                  setSelectedBuildingId(null);
                }}
              >
                <Minus size={17} /> Demolish
              </button>
            </div>
          </aside>
        </>
      )}

      {panel === "research" && (
        <Drawer title="Research" eyebrow="Academy programme" onClose={() => setPanel(null)}>
          <div className="panel-intro">
            <BookOpen size={22} />
            <p>
              Knowledge opens lasting improvements. Given time, this city can learn every subject.
            </p>
          </div>
          {city.research && (
            <Progress
              label={city.research.label}
              remaining={city.research.remainingSeconds}
              total={city.research.totalSeconds}
            />
          )}
          <div className="research-list">
            {RESEARCH_DEFINITIONS.map((research) => {
              const complete = city.completedResearch.includes(research.id);
              return (
                <article
                  className={complete ? "research-card research-card--complete" : "research-card"}
                  key={research.id}
                >
                  <span className="research-icon">
                    {complete ? <Check size={18} /> : <BookOpen size={18} />}
                  </span>
                  <div>
                    <h3>{research.label}</h3>
                    <p>{research.detail}</p>
                    <small>
                      {research.knowledge} knowledge · {formatTime(research.seconds)}
                    </small>
                  </div>
                  <button
                    type="button"
                    disabled={
                      complete ||
                      Boolean(city.research) ||
                      city.resources.knowledge < research.knowledge
                    }
                    onClick={() =>
                      updateCity(
                        (current) => startResearch(current, research.id),
                        `${research.label} started.`,
                      )
                    }
                  >
                    {complete ? "Learned" : "Study"}
                  </button>
                </article>
              );
            })}
          </div>
        </Drawer>
      )}

      {panel === "city" && (
        <Drawer title={city.name} eyebrow="City administration" onClose={() => setPanel(null)}>
          <div className="city-summary">
            <div>
              <Users size={18} />
              <span>
                <small>Population</small>
                <strong>{formatNumber(city.population)}</strong>
              </span>
            </div>
            <div>
              <Hammer size={18} />
              <span>
                <small>Employment</small>
                <strong>{metrics.employment}%</strong>
              </span>
            </div>
            <div>
              <Sparkles size={18} />
              <span>
                <small>Happiness</small>
                <strong>{metrics.happiness}%</strong>
              </span>
            </div>
            <div>
              <Shield size={18} />
              <span>
                <small>Defence</small>
                <strong>{metrics.defence}</strong>
              </span>
            </div>
          </div>
          <p className="workforce-note">
            {metrics.workersAssigned} of {metrics.workersAvailable} available workers assigned
            {metrics.jobs > metrics.workersAvailable
              ? ` · ${metrics.jobs - metrics.workersAvailable} requested jobs are unfilled`
              : ` · ${metrics.jobs} jobs requested`}
          </p>

          <section className="admin-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Civic direction</span>
                <h3>Doctrine</h3>
              </div>
              <button type="button" className="text-button" onClick={changeCityName}>
                Rename city
              </button>
            </div>
            <select
              className="doctrine-select"
              aria-label="Civic doctrine"
              value={city.doctrine}
              onChange={(event) =>
                updateCity(
                  (current) => setDoctrine(current, event.target.value as Doctrine),
                  "Civic doctrine adopted.",
                )
              }
            >
              {DOCTRINES.map((doctrine) => {
                const requirement = DOCTRINE_RESEARCH_REQUIREMENTS[doctrine.value];
                const unlocked = !requirement || city.completedResearch.includes(requirement);
                const requiredResearch = RESEARCH_DEFINITIONS.find(
                  (research) => research.id === requirement,
                );
                return (
                  <option value={doctrine.value} key={doctrine.value} disabled={!unlocked}>
                    {doctrine.label}
                    {unlocked ? "" : ` · requires ${requiredResearch?.label ?? requirement}`}
                  </option>
                );
              })}
            </select>
            <p>{DOCTRINES.find((doctrine) => doctrine.value === city.doctrine)?.detail}</p>
          </section>

          <section className="admin-section">
            <span className="eyebrow">Public works</span>
            <div className="public-works">
              <article>
                <span>
                  <Construction size={20} />
                </span>
                <div>
                  <strong>Roads · Level {city.roadLevel}</strong>
                  <p>
                    {city.roadLevel === 1
                      ? "Packed earth lanes connect occupied plots."
                      : city.roadLevel === 2
                        ? "Broad limestone paving makes travel easier."
                        : city.roadLevel === 3
                          ? "Fine fitted stone gives the polis civic grandeur."
                          : "Tree-lined ceremonial avenues shade the city."}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={city.roadLevel >= 4}
                  onClick={() => updateCity(upgradeRoads, "Roads improved.")}
                >
                  Improve
                </button>
              </article>
              <article>
                <span>
                  <Shield size={20} />
                </span>
                <div>
                  <strong>Walls · Level {city.wallLevel}</strong>
                  <p>Reduces losses during raids and storms.</p>
                </div>
                <button
                  type="button"
                  disabled={city.wallLevel >= 3}
                  onClick={() => updateCity(upgradeWalls, "Walls improved.")}
                >
                  Improve
                </button>
              </article>
            </div>
          </section>

          <section className="admin-section">
            <span className="eyebrow">Harbour and defence</span>
            <div className="force-grid">
              <span>
                <small>Militia</small>
                <strong>{defenceForces.militia}</strong>
              </span>
              <span>
                <small>Hoplites</small>
                <strong>{defenceForces.hoplites}</strong>
              </span>
              <span>
                <small>Archers</small>
                <strong>{defenceForces.archers}</strong>
              </span>
              <span>
                <small>Ships</small>
                <strong>{defenceForces.ships}</strong>
              </span>
            </div>
            <p className="upkeep-note">Forces are stationary. Soldiers use food; ships use coin.</p>
            <div className="mission-grid">
              <button
                type="button"
                onClick={() =>
                  updateCity(
                    (current) => resolveHarbourMission(current, "fishing"),
                    "Fishing boats returned with food.",
                  )
                }
              >
                <Wheat size={17} />
                <span>
                  <strong>Send fishing boats</strong>
                  <small>25 coin</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  updateCity(
                    (current) => resolveHarbourMission(current, "trade"),
                    "The trade voyage returned.",
                  )
                }
              >
                <Anchor size={17} />
                <span>
                  <strong>Send trade voyage</strong>
                  <small>20 goods · 20 coin</small>
                </span>
              </button>
              <button
                type="button"
                disabled={metrics.defence < 30}
                onClick={() =>
                  updateCity(
                    (current) => resolveHarbourMission(current, "patrol"),
                    "The barbarian camp was cleared.",
                  )
                }
              >
                <Swords size={17} />
                <span>
                  <strong>Clear barbarian camp</strong>
                  <small>Requires 30 defence</small>
                </span>
              </button>
            </div>
          </section>

          <section className="admin-section">
            <span className="eyebrow">Land clearance</span>
            <div className="district-list">
              {DISTRICT_NAMES.map((name, district) => {
                const unlocked = city.unlockedDistricts.includes(district);
                const active = city.expansion?.district === district;
                return (
                  <article key={name} className={unlocked ? "district district--open" : "district"}>
                    <span>{district + 1}</span>
                    <div>
                      <strong>{name}</strong>
                      <p>
                        {unlocked
                          ? `${PLOT_DISTRICTS[district].length} plots open`
                          : "Eight plots and a variable find"}
                      </p>
                      {!unlocked && <CostLine resources={DISTRICT_COSTS[district]} />}
                    </div>
                    {unlocked ? (
                      <Check size={18} />
                    ) : (
                      <button
                        type="button"
                        disabled={
                          Boolean(city.expansion) ||
                          !canAfford(city.resources, DISTRICT_COSTS[district])
                        }
                        onClick={() =>
                          updateCity(
                            (current) => startExpansion(current, district),
                            `${name} clearance started.`,
                          )
                        }
                      >
                        {active ? "Clearing" : "Clear"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="admin-section file-actions">
            <span className="eyebrow">City files</span>
            <div>
              <button type="button" onClick={exportCity}>
                <Download size={17} /> Export frozen city
              </button>
              <button type="button" onClick={() => fileInput.current?.click()}>
                <Upload size={17} /> Import city
              </button>
              <button type="button" className="danger-action" onClick={createNewCity}>
                <Sparkles size={17} /> Found new city
              </button>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".json,.polis.json,application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importCity(file);
                event.target.value = "";
              }}
            />
          </section>
        </Drawer>
      )}

      {panel === "developer" && (
        <Drawer title="Developer tools" eyebrow="Test controls" onClose={() => setPanel(null)}>
          <div className="developer-note">
            <Settings size={20} />
            <p>
              These controls make long-running systems easy to inspect. They are not part of normal
              balance.
            </p>
          </div>
          <section className="admin-section">
            <span className="eyebrow">Simulation</span>
            <div className="tool-grid">
              <button
                type="button"
                aria-pressed={layoutEditorEnabled}
                onClick={() => {
                  setLayoutEditorEnabled((enabled) => !enabled);
                  setPanel(null);
                  setToast(
                    layoutEditorEnabled
                      ? "Placement editor closed."
                      : "Placement editor opened. Drag numbered anchors to calibrate sites.",
                  );
                }}
              >
                <Construction size={18} />{" "}
                {layoutEditorEnabled ? "Close placement editor" : "Open placement editor"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeed(20);
                  setToast("Developer speed set to 20×.");
                }}
              >
                <Clock3 size={18} /> Run at 20×
              </button>
              <button
                type="button"
                onClick={() => updateCity(finishAllProjects, "All active projects finished.")}
              >
                <Check size={18} /> Finish projects
              </button>
              <button
                type="button"
                onClick={() =>
                  updateCity(
                    (current) => developerGrant(current, 500),
                    "500 of every resource added.",
                  )
                }
              >
                <Plus size={18} /> Add resources
              </button>
              <button
                type="button"
                onClick={() => updateCity(developerDamage, "One building damaged.")}
              >
                <Hammer size={18} /> Damage building
              </button>
              <button
                type="button"
                onClick={() => updateCity(applyMinorOpportunity, "Minor opportunity added.")}
              >
                <Sparkles size={18} /> Minor event
              </button>
            </div>
          </section>
          <section className="admin-section">
            <span className="eyebrow">Trigger a crisis</span>
            <div className="crisis-grid">
              {(Object.keys(CRISIS_DEFINITIONS) as CrisisType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    updateCity((current) => triggerCrisis(current, type));
                    setPanel(null);
                  }}
                >
                  {type === "fire" ? (
                    <Flame size={17} />
                  ) : type === "invasion" ? (
                    <Swords size={17} />
                  ) : (
                    <Shield size={17} />
                  )}
                  {CRISIS_DEFINITIONS[type].title}
                </button>
              ))}
            </div>
          </section>
          <section className="admin-section config-readout">
            <span className="eyebrow">Current balance</span>
            <p>
              Minor situations: every {GAME_TIMING.minorEventMinSeconds / 60}–
              {GAME_TIMING.minorEventMaxSeconds / 60} active minutes.
            </p>
            <p>
              Severe crises: every {GAME_TIMING.severeCrisisMinDays}–
              {GAME_TIMING.severeCrisisMaxDays} calendar days, followed by a warning period.
            </p>
            <p>
              Offline progress: capped at {GAME_TIMING.offlineCapSeconds / 3600} hours. Offline
              crises never resolve.
            </p>
          </section>
        </Drawer>
      )}

      {city.pendingCrisis && (
        <CrisisDialog
          city={city}
          onResolve={(response) =>
            updateCity((current) => resolveCrisis(current, response), "The crisis has passed.")
          }
        />
      )}

      {needsFounding && (
        <FoundingDialog
          onFound={(name) => {
            setCity(createCity(name));
            setNeedsFounding(false);
            setToast(`${name} founded. Welcome to your island.`);
          }}
        />
      )}

      {toast && <output className="toast">{toast}</output>}

      {(buildMode || moveMode) && (
        <div className="placement-banner">
          <span>
            <Construction size={17} />
            {moveMode
              ? "Choose an empty plot to move the building"
              : `Place ${BUILDING_DEFINITIONS[buildMode!].name}`}
          </span>
          <button
            type="button"
            onClick={() => {
              setBuildMode(null);
              setMoveMode(null);
            }}
          >
            <X size={17} /> Cancel
          </button>
        </div>
      )}

      <a className="gateway-link" href="/" aria-label="Back to Gateway">
        <Anchor size={15} /> Gateway
      </a>
    </main>
  );
}
