import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/polis/",
  build: {
    outDir: "../../dist/polis",
    emptyOutDir: false,
  },
});
