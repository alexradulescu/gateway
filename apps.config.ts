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
] satisfies GatewayApp[];
