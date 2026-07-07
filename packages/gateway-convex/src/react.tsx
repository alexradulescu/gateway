import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

let gatewayConvexClient: ConvexReactClient | undefined;

export function getGatewayConvexUrl() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing VITE_CONVEX_URL. Set it to your Convex .convex.cloud deployment URL.");
  }

  return convexUrl.replace(/\/+$/, "");
}

export function getGatewayConvexClient() {
  gatewayConvexClient ??= new ConvexReactClient(getGatewayConvexUrl());
  return gatewayConvexClient;
}

export function GatewayConvexProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={getGatewayConvexClient()}>{children}</ConvexProvider>;
}
