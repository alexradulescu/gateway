import { createFileRoute } from "@tanstack/react-router";
import { CatalogueSettings } from "../components/CatalogueSettings";

export const Route = createFileRoute("/settings")({
  component: CatalogueSettings,
});
