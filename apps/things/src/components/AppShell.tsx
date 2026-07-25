import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  topFade?: boolean;
  bottomFade?: boolean;
};

export function AppShell({ children, header, topFade = false, bottomFade = true }: AppShellProps) {
  return (
    <div className="things-app-shell">
      <div className="things-app-shell__pattern" aria-hidden="true" />
      <div className="things-app-shell__frame">
        {header && (
          <div className="things-app-shell__header">
            {header}
            {topFade && (
              <div
                className="things-app-shell__fade things-app-shell__fade--top"
                aria-hidden="true"
              />
            )}
          </div>
        )}
        <main className="things-app-shell__scroll" data-scroll-restoration-id="things-primary">
          <div
            className={`things-app-shell__content${header ? "" : " things-app-shell__content--no-header"}`}
          >
            {children}
          </div>
        </main>
        {bottomFade && (
          <div
            className="things-app-shell__fade things-app-shell__fade--bottom"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
