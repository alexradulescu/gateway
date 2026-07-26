import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ThingsDataProvider } from "../context/ThingsDataContext";
import { AppShell } from "../components/AppShell";
import { ThingsErrorState, ThingsNotFound } from "../components/ThingsStates";
import { ThingsHome } from "../components/ThingsHome";
import { CatalogueSettingsHeader, ThingsHomeHeader } from "../components/ThingsHeaders";

export const Route = createRootRoute({
  component: ThingsRoot,
  errorComponent: ({ reset }) => (
    <AppShell>
      <ThingsErrorState onRetry={reset} />
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <ThingsNotFound />
    </AppShell>
  ),
});

function ThingsRoot() {
  const matchRoute = useMatchRoute();
  const isSettingsPage = Boolean(matchRoute({ to: "/settings" }));

  return (
    <AppShell header={isSettingsPage ? <CatalogueSettingsHeader /> : <ThingsHomeHeader />}>
      <ThingsDataProvider>
        {!isSettingsPage && <ThingsHome />}
        <Outlet />
      </ThingsDataProvider>
    </AppShell>
  );
}
