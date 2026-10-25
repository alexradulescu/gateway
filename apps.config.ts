export type GatewayApp = {
  id: string;
  name: string;
  description: string;
  accent: string;
};

export const gatewayApps = [
  {
    id: "app-shell",
    name: "AppShell",
    description: "A full-screen safe-area shell and installable iOS PWA test bench.",
    accent: "#5a8dee",
  },
  {
    id: "things",
    name: "Things",
    description: "Shared household lists with quick entry, live updates, and tidy completion.",
    accent: "#2f6f5e",
  },
  {
    id: "bookster",
    name: "Bookster",
    description: "A shared family library with fast search, tidy shelves, and bulk import.",
    accent: "#5d9166",
  },
  {
    id: "2048",
    name: "2048",
    description: "Slide and stack matching tiles on an isometric board.",
    accent: "#d98a1f",
  },
  {
    id: "sydney",
    name: "Sydney",
    description: "Explore apartment-friendly neighbourhoods within 45 minutes of the CBD.",
    accent: "#1a73d9",
  },
  {
    id: "library",
    name: "Restricted Section",
    description: "A candlelit library of wizarding-world fan fiction, book by book.",
    accent: "#9c7433",
  },
] satisfies GatewayApp[];
