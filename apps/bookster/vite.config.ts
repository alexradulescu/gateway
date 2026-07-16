import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: "../..",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  base: "/bookster/",
  build: {
    manifest: "asset-manifest.json",
    outDir: "../../dist/bookster",
    emptyOutDir: false,
  },
});
