import { styledStatic } from "@alex.radulescu/styled-static/vite";
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
    styledStatic(),
    react(),
  ],
  base: "/things/",
  build: {
    manifest: "asset-manifest.json",
    outDir: "../../dist/things",
    emptyOutDir: false,
  },
});
