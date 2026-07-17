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
  const inShelf = pathname === "/shelf" || pathname.startsWith("/shelf/");
  return (
    <BooksterProvider>
      {inSettings ? null : (
        <LibraryPage key={inShelf ? "shelf" : "list"} view={inShelf ? "shelf" : "list"} />
      )}
      <Outlet />
    </BooksterProvider>
  );
}
