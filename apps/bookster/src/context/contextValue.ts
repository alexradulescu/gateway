import { createContext } from "react";
import type {
  BooksterBook,
  BooksterCategory,
  BooksterCategoryId,
  BooksterLocation,
  BooksterSortOrder,
  BooksterTheme,
} from "../types";

export type BooksterContextValue = {
  library: {
    books: BooksterBook[];
    categories: BooksterCategory[];
    locations: BooksterLocation[];
    allLocations: BooksterLocation[];
    settings: {
      userId: string;
      defaultSortOrder: BooksterSortOrder;
      theme: BooksterTheme;
    };
  };
  searchValue: string;
  setSearchValue: (value: string) => void;
  deselectedCategoryIds: ReadonlySet<BooksterCategoryId>;
  toggleCategory: (id: BooksterCategoryId) => void;
  resetCategories: () => void;
  theme: BooksterTheme;
  setTheme: (theme: BooksterTheme) => void;
};

export const BooksterContext = createContext<BooksterContextValue | null>(null);
