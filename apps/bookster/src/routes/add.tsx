import { createFileRoute } from "@tanstack/react-router";
import { AddBookSheet } from "../components/AddBookSheet";

type AddBookSearch = { tab?: "single" | "bulk" };

export const Route = createFileRoute("/add")({
  validateSearch: (search: Record<string, unknown>): AddBookSearch => ({
    tab: search.tab === "bulk" ? "bulk" : undefined,
  }),
  component: AddBookRoute,
});

function AddBookRoute() {
  const { tab } = Route.useSearch();
  return <AddBookSheet initialTab={tab ?? "single"} />;
}
