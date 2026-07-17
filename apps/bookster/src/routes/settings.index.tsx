import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
  component: () => <Navigate replace to="/settings/$tab" params={{ tab: "config" }} />,
});
