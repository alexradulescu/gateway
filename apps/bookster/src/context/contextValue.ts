import { createContext } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../../convex/_generated/api";
import type { BooksterCategoryId, BooksterTheme } from "../types";

export type BooksterContextValue = {
  library: FunctionReturnType<typeof api.bookster.library>;
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedCategoryIds: ReadonlySet<BooksterCategoryId>;
  toggleCategory: (id: BooksterCategoryId) => void;
  resetCategories: () => void;
  theme: BooksterTheme;
  setTheme: (theme: BooksterTheme) => void;
};

export const BooksterContext = createContext<BooksterContextValue | null>(null);
