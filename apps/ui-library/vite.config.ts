import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react()],
  base: "/ui-library/",
  build: { outDir: "../../dist/ui-library", emptyOutDir: false },
});
