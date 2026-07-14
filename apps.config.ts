export type GatewayApp = {
  id: string;
  name: string;
  description: string;
  accent: string;
};

export const gatewayApps = [
  {
    id: "counter",
    name: "Counter Lab",
    description: "Small Vite app for testing state, controls, and deployment paths.",
    accent: "#d64550",
  },
  {
    id: "notes",
    name: "Notes Bench",
    description: "Local note cards for testing forms, lists, and browser storage.",
    accent: "#0d7c66",
  },
  {
    id: "things",
    name: "Things",
    description: "Shared household lists with quick entry, live updates, and tidy completion.",
    accent: "#2f6f5e",
  },
] satisfies GatewayApp[];
