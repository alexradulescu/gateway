import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  basepath: "/things",
  defaultPreload: "intent",
  scrollRestoration: true,
  scrollToTopSelectors: [".things-app-shell__scroll"],
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
