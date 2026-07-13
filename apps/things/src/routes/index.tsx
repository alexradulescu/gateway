import { createFileRoute } from "@tanstack/react-router";
import { ThingsHome } from "../components/ThingsHome";

export const Route = createFileRoute("/")({
  component: ThingsHome,
});
