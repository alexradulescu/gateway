import { createContext, useContext } from "react";

type ItemOverlayPortalContextValue = {
  portal: HTMLElement | null;
  setItemOverlayOpen: (isOpen: boolean) => void;
};

const ItemOverlayPortalContext = createContext<ItemOverlayPortalContextValue | null>(null);

export const ItemOverlayPortalProvider = ItemOverlayPortalContext.Provider;

export function useItemOverlayPortal() {
  const context = useContext(ItemOverlayPortalContext);
  if (!context) throw new Error("useItemOverlayPortal must be used inside a group drawer.");
  return context;
}
