import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/sydney/",
  build: {
    outDir: "../../dist/sydney",
    emptyOutDir: false,
  },
});
