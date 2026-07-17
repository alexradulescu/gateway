import { createFileRoute, notFound } from "@tanstack/react-router";
import { SettingsPage } from "../components/SettingsPage";
import { isBooksterSettingsTab } from "../types";

export const Route = createFileRoute("/settings/$tab")({
  beforeLoad: ({ params }) => {
    if (!isBooksterSettingsTab(params.tab)) {
      throw notFound();
    }
  },
  component: SettingsRoute,
});

function SettingsRoute() {
  const { tab } = Route.useParams();
  if (!isBooksterSettingsTab(tab)) throw notFound();
  return <SettingsPage tab={tab} />;
}
