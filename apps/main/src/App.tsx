import { ArrowUpRight, Boxes, Plus } from "lucide-react";
import { gatewayApps } from "../../../apps.config";

export function App() {
  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Vite app gateway</p>
          <h1 id="page-title">One deploy, many experiments.</h1>
        </div>
        <a className="new-app" href="https://vite.dev/guide/" target="_blank" rel="noreferrer">
          <Plus size={18} />
          Add another
        </a>
      </section>

      <section className="app-grid" aria-label="Available apps">
        {gatewayApps.map((app, index) => (
          <a
            className="app-card"
            href={`/${app.id}/`}
            key={app.id}
            style={{ "--accent": app.accent } as React.CSSProperties}
          >
            <span className="app-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="app-icon" aria-hidden="true">
              <Boxes size={24} />
            </span>
            <span className="app-name">{app.name}</span>
            <span className="app-description">{app.description}</span>
            <span className="open-link">
              Open
              <ArrowUpRight size={16} />
            </span>
          </a>
        ))}
      </section>
    </main>
  );
}
