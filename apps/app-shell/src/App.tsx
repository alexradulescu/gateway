import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Home,
  LayoutPanelTop,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { AppBody, AppFooter, AppHeader, AppShell } from "./components/AppShell";
import { useSafeAreaInsets, useViewportSnapshot } from "./diagnostics";

const TEST_ITEMS = [
  ["01", "Morning brief", "A normal action row near the start of the scroll range."],
  ["02", "Safe targets", "Every control has a minimum 44 by 44 pixel hit area."],
  ["03", "Full-bleed paint", "The scroll plane extends beneath both fixed bars."],
  ["04", "Sized header", "A CSS size token keeps the first content clear."],
  ["05", "Sized footer", "The footer can use its minimum or a taller CSS size."],
  ["06", "System region", "Transient content can remain visible beneath iOS chrome."],
  ["07", "Plain composition", "The four React components only render semantic elements."],
  ["08", "Scroll ownership", "The body is the only vertical scrolling element."],
  ["09", "Dark appearance", "System colour preference changes the complete test palette."],
  ["10", "Edge fade", "The exposed web viewport edges keep a fixed 12 pixel fade."],
  ["11", "No viewport script", "CSS alone owns shell height and bar placement."],
  ["12", "End marker", "The final item can rest fully above the footer and Home indicator."],
] as const;

const SHELL_STYLE = {
  "--app-shell-background": "var(--demo-canvas)",
  "--app-shell-edge-fade-color": "var(--demo-canvas)",
} as CSSProperties;

function Toggle({
  pressed,
  children,
  onPressedChange,
}: {
  pressed: boolean;
  children: React.ReactNode;
  onPressedChange: (pressed: boolean) => void;
}) {
  return (
    <button
      className="demo-toggle"
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      <span>{children}</span>
      <span className="demo-toggle__state" aria-hidden="true">
        {pressed ? "On" : "Off"}
      </span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="demo-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function App() {
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [growHeader, setGrowHeader] = useState(false);
  const [growFooter, setGrowFooter] = useState(false);
  const [lastAction, setLastAction] = useState("No test action yet.");
  const viewport = useViewportSnapshot();
  const safeArea = useSafeAreaInsets();

  return (
    <AppShell
      className="demo-shell"
      data-debug-regions={showRegions || undefined}
      data-grow-header={growHeader || undefined}
      data-grow-footer={growFooter || undefined}
      style={SHELL_STYLE}
    >
      {showHeader && (
        <AppHeader className="demo-header">
          <div className="demo-header__row">
            <a className="demo-icon-button" href="/" aria-label="Back to Gateway">
              <Home aria-hidden="true" size={19} />
            </a>
            <div className="demo-header__title">
              <span>Core component lab</span>
              <strong>AppShell</strong>
            </div>
            <button
              className="demo-icon-button"
              type="button"
              aria-label={growHeader ? "Use minimum header" : "Grow header"}
              aria-pressed={growHeader}
              onClick={() => setGrowHeader((value) => !value)}
            >
              {growHeader ? (
                <ChevronUp aria-hidden="true" size={20} />
              ) : (
                <ChevronDown aria-hidden="true" size={20} />
              )}
            </button>
          </div>
          {growHeader && (
            <p className="demo-header__extra">A CSS size token makes room for this second row.</p>
          )}
        </AppHeader>
      )}

      <AppBody className="demo-body">
        <div className="demo-content">
          <div className="demo-boundary" data-boundary="start">
            <span>Main content starts here</span>
          </div>

          <section className="demo-intro" aria-labelledby="demo-title">
            <div className="demo-intro__icon" aria-hidden="true">
              <Smartphone size={27} />
            </div>
            <p className="demo-eyebrow">iOS 26 · portrait PWA</p>
            <h1 id="demo-title">See every layer.</h1>
            <p className="demo-lede">
              Install this test bench on an iPhone. Scroll slowly to see content pass beneath the
              transparent fixed regions and the system-owned unsafe areas.
            </p>
            <output className="demo-status" aria-live="polite">
              <span className="demo-status__dot" aria-hidden="true" />
              {viewport.standalone
                ? `Installed · viewport ${Math.round(viewport.layoutHeight)} / screen ${Math.round(viewport.screenHeight)}px`
                : "Running in a browser tab"}
            </output>
          </section>

          <section className="demo-panel" aria-labelledby="layout-controls-title">
            <div className="demo-section-heading">
              <LayoutPanelTop aria-hidden="true" size={20} />
              <div>
                <p>Live controls</p>
                <h2 id="layout-controls-title">Layout regions</h2>
              </div>
            </div>
            <div className="demo-toggle-grid">
              <Toggle pressed={showHeader} onPressedChange={setShowHeader}>
                Header
              </Toggle>
              <Toggle pressed={showFooter} onPressedChange={setShowFooter}>
                Footer
              </Toggle>
              <Toggle pressed={growHeader} onPressedChange={setGrowHeader}>
                Grow header
              </Toggle>
              <Toggle pressed={growFooter} onPressedChange={setGrowFooter}>
                Grow footer
              </Toggle>
              <Toggle pressed={showRegions} onPressedChange={setShowRegions}>
                Region colours
              </Toggle>
            </div>
          </section>

          <section className="demo-panel" aria-labelledby="diagnostics-title">
            <div className="demo-section-heading">
              <ShieldCheck aria-hidden="true" size={20} />
              <div>
                <p>Live diagnostics</p>
                <h2 id="diagnostics-title">Viewport and safe area</h2>
              </div>
            </div>
            <dl className="demo-metrics">
              <Metric
                label="Layout viewport"
                value={`${Math.round(viewport.layoutWidth)} × ${Math.round(viewport.layoutHeight)}`}
              />
              <Metric
                label="Visual viewport"
                value={`${Math.round(viewport.visualWidth)} × ${Math.round(viewport.visualHeight)}`}
              />
              <Metric label="Screen height" value={`${Math.round(viewport.screenHeight)}px`} />
              <Metric
                label="Screen − layout"
                value={`${Math.max(0, Math.round(viewport.screenHeight - viewport.layoutHeight))}px`}
              />
              <Metric label="Scale" value={`${viewport.scale.toFixed(2)}×`} />
              <Metric label="Display mode" value={viewport.standalone ? "Standalone" : "Browser"} />
              <Metric
                label="Safe top / bottom"
                value={`${safeArea.top}px / ${safeArea.bottom}px`}
              />
              <Metric
                label="Safe left / right"
                value={`${safeArea.left}px / ${safeArea.right}px`}
              />
              <Metric label="Orientation" value={viewport.orientation} />
              <Metric
                label="navigator.standalone"
                value={viewport.appleStandalone ? "true" : "false"}
              />
            </dl>
          </section>

          <section className="demo-panel demo-legend" aria-labelledby="legend-title">
            <div className="demo-section-heading">
              {showRegions ? (
                <Eye aria-hidden="true" size={20} />
              ) : (
                <EyeOff aria-hidden="true" size={20} />
              )}
              <div>
                <p>Diagnostic overlay</p>
                <h2 id="legend-title">Region legend</h2>
              </div>
            </div>
            <ul>
              <li data-region="unsafe">Unsafe system area</li>
              <li data-region="header">AppHeader</li>
              <li data-region="body">AppBody scroll plane</li>
              <li data-region="footer">AppFooter</li>
            </ul>
          </section>

          <section className="demo-test-list" aria-labelledby="scroll-test-title">
            <div className="demo-list-heading">
              <p>Interaction runway</p>
              <h2 id="scroll-test-title">Scroll behind every layer</h2>
            </div>
            {TEST_ITEMS.map(([number, title, description]) => (
              <article className="demo-test-card" key={number}>
                <span className="demo-test-card__number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLastAction(`Activated test row ${number}: ${title}.`)}
                >
                  Test
                </button>
              </article>
            ))}
          </section>

          <output className="demo-action-output" aria-live="polite">
            {lastAction}
          </output>

          <div className="demo-boundary" data-boundary="end">
            <span>Main content ends here</span>
          </div>
        </div>
      </AppBody>

      {showFooter && (
        <AppFooter className="demo-footer">
          <nav className="demo-footer__nav" aria-label="Demo navigation">
            <button type="button" onClick={() => setLastAction("Footer: Shell selected.")}>
              <Smartphone aria-hidden="true" size={18} />
              <span>Shell</span>
            </button>
            <button type="button" onClick={() => setLastAction("Footer: Safety selected.")}>
              <ShieldCheck aria-hidden="true" size={18} />
              <span>Safety</span>
            </button>
            <button type="button" onClick={() => setLastAction("Footer: Settings selected.")}>
              <Settings aria-hidden="true" size={18} />
              <span>Settings</span>
            </button>
            <button
              type="button"
              aria-label={growFooter ? "Use minimum footer" : "Grow footer"}
              aria-pressed={growFooter}
              onClick={() => setGrowFooter((value) => !value)}
            >
              {growFooter ? (
                <ChevronDown aria-hidden="true" size={20} />
              ) : (
                <ChevronUp aria-hidden="true" size={20} />
              )}
            </button>
          </nav>
          {growFooter && (
            <p className="demo-footer__extra">Extra footer row. No keyboard handling.</p>
          )}
        </AppFooter>
      )}
    </AppShell>
  );
}

export { App };
