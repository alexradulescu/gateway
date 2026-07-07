import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { styledStatic } from "@alex.radulescu/styled-static/vite";

export default defineConfig({
  plugins: [styledStatic(), react()],
  base: "/tasks/",
  build: {
    outDir: "../../dist/tasks",
    emptyOutDir: false,
  },
});
