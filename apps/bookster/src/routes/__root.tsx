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
  const pathname = useLocation({ select: (location) => location.pathname.replace(/\/$/, "") });
  const inSettings = pathname.startsWith("/settings");
  const inList = pathname === "/list" || pathname === "/add" || pathname.startsWith("/books/");
  return (
    <BooksterProvider>
      {inSettings ? null : (
        <LibraryPage key={inList ? "list" : "shelf"} view={inList ? "list" : "shelf"} />
      )}
      <Outlet />
    </BooksterProvider>
  );
}
