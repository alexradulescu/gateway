import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/app-shell/",
  build: {
    outDir: "../../dist/app-shell",
    emptyOutDir: false,
  },
});
