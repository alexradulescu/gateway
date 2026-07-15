import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ThingsDataProvider } from "../context/ThingsDataContext";
import { ThingsErrorState, ThingsNotFound } from "../components/ThingsStates";
import { ThingsHome } from "../components/ThingsHome";

export const Route = createRootRoute({
  component: ThingsRoot,
  errorComponent: ({ reset }) => <ThingsErrorState onRetry={reset} />,
  notFoundComponent: () => <ThingsNotFound />,
});

function ThingsRoot() {
  const matchRoute = useMatchRoute();
  const isSettingsPage = Boolean(matchRoute({ to: "/settings" }));

  return (
    <ThingsDataProvider>
      {!isSettingsPage && <ThingsHome />}
      <Outlet />
    </ThingsDataProvider>
  );
}
