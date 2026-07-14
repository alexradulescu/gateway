import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThingsDataProvider } from "../context/ThingsDataContext";
import { ThingsErrorState, ThingsNotFound } from "../components/ThingsStates";
import { ThingsHome } from "../components/ThingsHome";

export const Route = createRootRoute({
  component: ThingsRoot,
  errorComponent: ({ reset }) => <ThingsErrorState onRetry={reset} />,
  notFoundComponent: () => <ThingsNotFound />,
});

function ThingsRoot() {
  return (
    <ThingsDataProvider>
      <ThingsHome />
      <Outlet />
    </ThingsDataProvider>
  );
}
