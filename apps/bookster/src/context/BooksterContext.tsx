import { Spinner, Toast } from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { BooksterCategoryId, BooksterTheme } from "../types";
import { BooksterContext, type BooksterContextValue } from "./contextValue";
const THEME_STORAGE_KEY = "bookster-theme";

function useBooksterLibraryQuery() {
  return useQuery(api.bookster.library);
}

function storedTheme(): BooksterTheme {
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function BooksterProvider({ children }: { children: React.ReactNode }) {
  const library = useBooksterLibraryQuery();
  const initialize = useMutation(api.bookster.initialize);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<BooksterCategoryId>>(
    () => new Set(),
  );
  const [theme, setThemeState] = useState<BooksterTheme>(storedTheme);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const value = useMemo<BooksterContextValue | null>(() => {
    if (library === undefined) return null;
    return {
      library,
      searchValue,
      setSearchValue,
      selectedCategoryIds,
      toggleCategory(id) {
        setSelectedCategoryIds((current) => {
          const next = new Set(current);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      },
      resetCategories() {
        setSelectedCategoryIds(new Set());
      },
      theme,
      setTheme(nextTheme) {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        setThemeState(nextTheme);
      },
    };
  }, [library, searchValue, selectedCategoryIds, theme]);

  if (value === null) {
    return (
      <main className="bookster-state" aria-busy="true" aria-label="Loading Bookster">
        <Spinner color="accent" size="lg" />
        <p>Opening the library…</p>
      </main>
    );
  }

  return (
    <BooksterContext.Provider value={value}>
      {children}
      <Toast.Provider className="bookster-toast-region" placement="bottom" />
    </BooksterContext.Provider>
  );
}
