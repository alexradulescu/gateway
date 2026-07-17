import { createFileRoute } from "@tanstack/react-router";
import { AddBookSheet } from "../components/AddBookSheet";

export const Route = createFileRoute("/shelf/add")({ component: ShelfAddRoute });

function ShelfAddRoute() {
  return <AddBookSheet returnTo="/shelf" />;
}
