import { createContext, useContext } from "react";

const ItemOverlayPortalContext = createContext<HTMLElement | null>(null);

export const ItemOverlayPortalProvider = ItemOverlayPortalContext.Provider;

export function useItemOverlayPortal() {
  return useContext(ItemOverlayPortalContext);
}
