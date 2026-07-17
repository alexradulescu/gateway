import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { BooksterProvider } from "../context/BooksterContext";
import { LibraryPage } from "../components/LibraryPage";
import { BooksterErrorState, BooksterNotFound } from "../components/BooksterStates";

export const Route = createRootRoute({
  component: BooksterRoot,
  errorComponent: ({ reset }) => <BooksterErrorState onRetry={reset} />,
  notFoundComponent: () => <BooksterNotFound />,
});

function BooksterRoot() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const inSettings = pathname.startsWith("/settings");
  return (
    <BooksterProvider>
      {inSettings ? null : <LibraryPage />}
      <Outlet />
    </BooksterProvider>
  );
}
