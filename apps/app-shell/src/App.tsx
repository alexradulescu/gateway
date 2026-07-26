import { Eye, EyeOff, Home, Layers3, ShieldCheck, Smartphone } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { AppBody, AppFooter, AppHeader, AppShell } from "./components/AppShell";

const SHELL_STYLE = {
  "--app-shell-background": "var(--demo-canvas)",
} as CSSProperties;

const SCROLL_ITEMS = [
  [
    "01",
    "Normal document",
    "The page owns vertical scrolling. There is no fixed root or inner viewport.",
  ],
  ["02", "Safe start", "The first content starts below the status area and the 48 px header."],
  [
    "03",
    "Transparent header",
    "The fixed bar starts below the top inset, leaving the unsafe edge to the document.",
  ],
  [
    "04",
    "Full canvas",
    "The app background belongs to the document and continues to its final pixel.",
  ],
  ["05", "Portrait only", "The manifest locks this test app to portrait orientation."],
  [
    "06",
    "No viewport script",
    "Safe-area environment variables and normal CSS position both bars.",
  ],
  [
    "07",
    "CSS-only focus probe",
    "Input focus changes the canvas without keyboard or visual viewport JavaScript.",
  ],
  [
    "08",
    "Transparent footer",
    "The fixed bar ends above the bottom inset, leaving the unsafe edge to the document.",
  ],
  [
    "09",
    "Safe finish",
    "Bottom padding leaves the final content above the footer and Home indicator.",
  ],
  [
    "10",
    "One scroll owner",
    "The document scroll position should change from zero to this final card.",
  ],
] as const;

function App() {
  const [showRegionColors, setShowRegionColors] = useState(true);

  return (
    <AppShell
      className="demo-shell"
      data-region-colors={showRegionColors || undefined}
      style={SHELL_STYLE}
    >
      <AppHeader className="demo-header">
        <div className="demo-header__bar">
          <a href="/" aria-label="Back to Gateway">
            <Home aria-hidden="true" size={20} />
          </a>
          <div>
            <span>Core component lab</span>
            <strong>AppShell</strong>
          </div>
          <button
            type="button"
            aria-label={showRegionColors ? "Hide region colours" : "Show region colours"}
            aria-pressed={showRegionColors}
            onClick={() => setShowRegionColors((current) => !current)}
          >
            {showRegionColors ? (
              <Eye aria-hidden="true" size={20} />
            ) : (
              <EyeOff aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </AppHeader>

      <AppBody className="demo-body">
        <div className="demo-content" id="top">
          <div className="demo-boundary">
            <span>Main content starts here</span>
          </div>

          <section className="demo-hero" aria-labelledby="demo-title">
            <Smartphone aria-hidden="true" size={30} />
            <p>iOS PWA · portrait</p>
            <h1 id="demo-title">One page. One scroller.</h1>
            <p className="demo-hero__summary">
              This version follows Stocky, Buddy and Bookster. The document fills the screen and
              scrolls behind fixed, transparent app bars.
            </p>
          </section>

          <section className="demo-anatomy" id="anatomy" aria-labelledby="anatomy-title">
            <div className="demo-section-title">
              <Layers3 aria-hidden="true" size={21} />
              <div>
                <p>Layout contract</p>
                <h2 id="anatomy-title">Three visible regions</h2>
              </div>
            </div>
            <dl>
              <div data-region="header">
                <dt>Blue</dt>
                <dd>Fixed AppHeader, starting below the top safe inset.</dd>
              </div>
              <div data-region="body">
                <dt>Amber</dt>
                <dd>Normal document content. This is the only scroll plane.</dd>
              </div>
              <div data-region="footer">
                <dt>Green</dt>
                <dd>Fixed AppFooter, ending above the bottom safe inset.</dd>
              </div>
            </dl>
          </section>

          <section className="demo-list" aria-labelledby="scroll-title">
            <div className="demo-section-title">
              <ShieldCheck aria-hidden="true" size={21} />
              <div>
                <p>Scroll test</p>
                <h2 id="scroll-title">Follow the page to the bottom</h2>
              </div>
            </div>
            {SCROLL_ITEMS.map(([number, title, detail]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="demo-focus-test" aria-labelledby="focus-test-title">
            <div className="demo-section-title">
              <div>
                <p>Safari robustness test</p>
                <h2 id="focus-test-title">Focus changes the canvas</h2>
              </div>
            </div>
            <p>
              Focus either field. The page background changes through <code>body:has(...)</code>
              without React state or viewport handling.
            </p>
            <label>
              <span>Input</span>
              <input type="text" placeholder="Focus the input" />
            </label>
            <label>
              <span>Textarea</span>
              <textarea rows={3} placeholder="Focus the textarea" />
            </label>
          </section>

          <div className="demo-end" id="end">
            <strong>End of document</strong>
            <span>The document canvas should remain visible behind the footer to the bottom.</span>
          </div>

          <div className="demo-boundary">
            <span>Main content ends here</span>
          </div>
        </div>
      </AppBody>

      <AppFooter className="demo-footer">
        <input
          className="demo-footer__input"
          type="text"
          aria-label="Footer keyboard test"
          enterKeyHint="done"
          placeholder="Open the iOS keyboard"
        />
      </AppFooter>
    </AppShell>
  );
}

export { App };
