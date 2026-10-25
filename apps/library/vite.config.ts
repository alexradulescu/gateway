import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: "../..",
  plugins: [react()],
  base: "/library/",
  build: {
    outDir: "../../dist/library",
    emptyOutDir: false,
  },
});
