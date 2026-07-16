import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GatewayConvexProvider } from "@gateway/convex/react";
import { router } from "./router";
import "./styles.css";

document.body.classList.add("bookster-theme");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/bookster/sw.js");
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GatewayConvexProvider>
      <RouterProvider router={router} />
    </GatewayConvexProvider>
  </StrictMode>,
);
