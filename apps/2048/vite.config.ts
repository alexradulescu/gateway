import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/2048/",
  build: {
    outDir: "../../dist/2048",
    emptyOutDir: false,
  },
});
