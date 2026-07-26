import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="things-app-shell">
      <div className="things-app-shell__pattern" aria-hidden="true" />
      {header && <header className="things-app-shell__header">{header}</header>}
      <main
        className={`things-app-shell__main${header ? "" : " things-app-shell__main--no-header"}`}
      >
        {children}
      </main>
    </div>
  );
}
