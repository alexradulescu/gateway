import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/shelf")({ component: ShelfRoute });

function ShelfRoute() {
  return <Outlet />;
}
