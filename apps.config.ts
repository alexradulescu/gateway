export type GatewayApp = {
  id: string;
  name: string;
  description: string;
  accent: string;
};

export const gatewayApps = [
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
