import { useContext } from "react";
import { BooksterContext } from "./contextValue";

export function useBookster() {
  const value = useContext(BooksterContext);
  if (value === null) throw new Error("useBookster must be used inside BooksterProvider.");
  return value;
}
