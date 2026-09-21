import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@gateway/ui/styles.css";
import "./showcase.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
