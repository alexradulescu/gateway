import { SettingsPreview } from "./SettingsPreview";
import { CompositionGuide } from "./CompositionGuide";
import { SettingsExamples } from "./SettingsExamples";
import { ButtonExamples } from "./ButtonExamples";
import { InputExamples } from "./InputExamples";
import { NavigationExamples } from "./NavigationExamples";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  Grid2X2,
  Layers,
  Moon,
  Plus,
  Settings,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { IconButton, SegmentedControl, Surface } from "@gateway/ui";

type Section = "overview" | "navigation" | "inputs" | "buttons" | "settings" | "composition";
const sections: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Grid2X2 size={18} /> },
  { id: "navigation", label: "Navigation", icon: <Layers size={18} /> },
  { id: "inputs", label: "Inputs & selection", icon: <SlidersHorizontal size={18} /> },
  { id: "buttons", label: "Buttons & actions", icon: <Plus size={18} /> },
  { id: "settings", label: "Settings patterns", icon: <Settings size={18} /> },
  { id: "composition", label: "Composition & API", icon: <Code2 size={18} /> },
];
function subscribeToSection(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function readSection(): Section {
  const hash = window.location.hash.slice(1);
  return sections.find((section) => section.id === hash)?.id ?? "overview";
}
function setSection(section: Section) {
  window.location.hash = section;
}
export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [palette, setPalette] = useState<"ios" | "bookster">("ios");
  const section = useSyncExternalStore(subscribeToSection, readSection, () => "overview");
  const [status, setStatus] = useState("Ready to explore.");
  const show = (id: Section) => section === "overview" || section === id;
  return (
    <Surface theme={theme} palette={palette} className="library-app">
      <a className="skip-link" href="#main-content">
        Skip to components
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setSection("overview")}>
          <span className="brand-symbol">
            <Layers size={22} />
          </span>
          <span>
            UI Library<small>GATEWAY / DESIGN SYSTEM</small>
          </span>
        </a>
        <div className="sidebar-label">EXPLORE THE LIBRARY</div>
        <nav aria-label="Component categories">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={section === item.id ? "page" : undefined}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "composition" ? <ArrowUpRight size={14} /> : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="release">
            v0.1 <span>React components</span>
          </span>
          <p>
            Born in Bookster.
            <br />
            Ready for your next project.
          </p>
          <a href="/">
            Back to Gateway <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-bar">
          <span>
            Library <ChevronRight size={14} />{" "}
            <strong>{sections.find((item) => item.id === section)?.label}</strong>
          </span>
          <div className="workspace-tools">
            <span className="version-tag">iOS 27 inspired</span>
            <IconButton
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="intro" id="overview">
            <div>
              <span className="eyebrow">THE FAMILIAR, MADE REUSABLE</span>
              <h1>
                Small pieces.
                <br />
                <span>Thoughtful interfaces.</span>
              </h1>
              <p>
                Everyday iOS patterns, distilled from Bookster into composable React. Explore the
                details. Make them your own.
              </p>
            </div>
            <div className="intro-note">
              <span className="live-dot" /> 16 components<span>Native semantics</span>
              <span>Just React + CSS</span>
            </div>
          </div>
          <div className="gallery-toolbar">
            <span>
              <span className="live-dot" /> Live components <small>Try every control</small>
            </span>
            <SegmentedControl
              label="Color palette"
              value={palette}
              onValueChange={(value) => setPalette(value as "ios" | "bookster")}
              options={[
                { value: "ios", label: "iOS" },
                { value: "bookster", label: "Bookster" },
              ]}
            />
          </div>
          <div className="workbench">
            <div className="catalog">
              {show("navigation") && <NavigationExamples setStatus={setStatus} />}
              {show("inputs") && <InputExamples setStatus={setStatus} />}
              {show("buttons") && (
                <ButtonExamples
                  setStatus={setStatus}
                  onShowComposition={() => setSection("composition")}
                />
              )}
              {show("settings") && (
                <SettingsExamples
                  setStatus={setStatus}
                  onShowOverview={() => setSection("overview")}
                  theme={theme}
                />
              )}
              {show("composition") && <CompositionGuide />}
            </div>
            <aside className="preview-column">
              <div className="preview-label">
                <span>PUTTING IT TOGETHER</span>
                <span className="live-dot" />
              </div>
              <SettingsPreview />
              <div className="preview-note">
                <Layers size={17} />
                <p>
                  One screen. Seven primitives.
                  <br />
                  <strong>Same components. Different context.</strong>
                </p>
              </div>
              <a
                href="#composition"
                className="composition-link"
                onClick={() => setSection("composition")}
              >
                See how it’s composed <ArrowUpRight size={15} />
              </a>
            </aside>
          </div>
          <footer className="page-footer">
            <span>UI Library / Gateway</span>
            <span>Built from Bookster · React + CSS</span>
          </footer>
        </main>
        <output className="demo-status">
          <span className="live-dot" />
          {status}
        </output>
      </div>
    </Surface>
  );
}
