import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { BooksterSortOrder } from "./domain";

export type BooksterBook = Doc<"booksterBooks">;
export type BooksterCategory = Doc<"booksterCategories">;
export type BooksterLocation = Doc<"booksterLocations">;
export type BooksterBookId = Id<"booksterBooks">;
export type BooksterCategoryId = Id<"booksterCategories">;
export type BooksterLocationId = Id<"booksterLocations">;
export type { BooksterSortOrder };

export type BooksterTheme = "system" | "light" | "dark";
export type BooksterSettingsTab = "config" | "categories" | "locations" | "duplicates" | "import";

export const BOOKSTER_SETTINGS_TABS: BooksterSettingsTab[] = [
  "config",
  "categories",
  "locations",
  "duplicates",
  "import",
];

export function isBooksterSettingsTab(value: string): value is BooksterSettingsTab {
  return BOOKSTER_SETTINGS_TABS.some((tab) => tab === value);
}
