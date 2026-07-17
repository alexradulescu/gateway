import { createFileRoute } from "@tanstack/react-router";
import { SettingsOverviewPage } from "../components/SettingsPage";

export const Route = createFileRoute("/settings/")({
  component: SettingsOverviewPage,
});
