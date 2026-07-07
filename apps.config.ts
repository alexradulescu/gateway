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
    id: "tasks",
    name: "Tasks",
    description: "Todoist-style groups, priorities, due dates, and drag ordering.",
    accent: "#5b6ee1",
  },
] satisfies GatewayApp[];
