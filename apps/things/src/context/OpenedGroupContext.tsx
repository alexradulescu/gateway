import { createContext, useContext } from "react";
import type { OpenedGroup } from "../types";

const OpenedGroupContext = createContext<OpenedGroup | null>(null);

export const OpenedGroupProvider = OpenedGroupContext.Provider;

export function useOpenedGroup() {
  const openedGroup = useContext(OpenedGroupContext);
  if (openedGroup === null)
    throw new Error("useOpenedGroup must be used on an opened group route.");
  return openedGroup;
}
