import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { styledStatic } from "@alex.radulescu/styled-static/vite";

export default defineConfig({
  plugins: [styledStatic(), react()],
  base: "/notes/",
  build: {
    outDir: "../../dist/notes",
    emptyOutDir: false,
  },
});
