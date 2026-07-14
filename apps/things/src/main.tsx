import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { GatewayConvexProvider } from "@gateway/convex/react";
import { router } from "./router";
import "./styles.css";

document.body.classList.add("things-theme");

const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
const syncHeroTheme = () => {
  document.documentElement.classList.toggle("dark", darkMode.matches);
  document.documentElement.dataset.theme = darkMode.matches ? "dark" : "light";
};

syncHeroTheme();
darkMode.addEventListener("change", syncHeroTheme);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/things/sw.js");
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GatewayConvexProvider>
      <RouterProvider router={router} />
    </GatewayConvexProvider>
  </StrictMode>,
);
