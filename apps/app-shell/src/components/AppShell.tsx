import type { ComponentProps } from "react";
import "./app-shell.css";

function AppShell({ children, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} data-slot="app-shell">
      {children}
    </div>
  );
}

function AppHeader(props: ComponentProps<"header">) {
  return <header {...props} data-slot="app-header" />;
}

function AppBody(props: ComponentProps<"main">) {
  return <main {...props} data-slot="app-body" />;
}

function AppFooter(props: ComponentProps<"footer">) {
  return <footer {...props} data-slot="app-footer" />;
}

export { AppBody, AppFooter, AppHeader, AppShell };
