import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GatewayConvexProvider } from "@gateway/convex/react";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GatewayConvexProvider>
      <App />
    </GatewayConvexProvider>
  </StrictMode>,
);
