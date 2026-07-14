/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  assertCompleteOrder,
  cleanVisibleText,
  nextPosition,
  normalizeCatalogueKey,
  normalizeGroupName,
  rankCatalogueMatches,
} from "./thingsDomain";

describe("cleanVisibleText", () => {
  test("turns multi-line, repeated whitespace into one readable line", () => {
    expect(cleanVisibleText("  2 \n\t x   500ml  ")).toBe("2 x 500ml");
  });

  test("preserves case, punctuation, and symbols", () => {
    expect(cleanVisibleText("  Home-Tasks & More  ")).toBe("Home-Tasks & More");
  });
});

describe("catalogue matching", () => {
  const catalogue = [
    { canonicalName: "Oat Milk", normalizedKey: "oatmilk" },
    { canonicalName: "Milk", normalizedKey: "milk" },
    { canonicalName: "Milk Chocolate", normalizedKey: "milkchocolate" },
    { canonicalName: "Almond Milk", normalizedKey: "almondmilk" },
  ];

  test("ranks exact, prefix, then substring matches with alphabetic ties", () => {
    expect(rankCatalogueMatches(catalogue, "milk").map((item) => item.canonicalName)).toEqual([
      "Milk",
      "Milk Chocolate",
      "Almond Milk",
      "Oat Milk",
    ]);
  });

  test("returns no suggestions for empty input and limits results", () => {
    expect(rankCatalogueMatches(catalogue, "   ")).toEqual([]);
    const many = Array.from({ length: 14 }, (_, index) => ({
      canonicalName: `Milk ${String(index).padStart(2, "0")}`,
      normalizedKey: `milk${index}`,
    }));
    expect(rankCatalogueMatches(many, "milk")).toHaveLength(10);
  });
});

describe("normalization", () => {
  test("group names compare case-insensitively but preserve punctuation", () => {
    expect(normalizeGroupName("  HOME   Tasks ")).toBe("home tasks");
    expect(normalizeGroupName("Home-Tasks")).not.toBe(normalizeGroupName("Home Tasks"));
  });

  test("catalogue keys remove accents, spacing, punctuation, and symbols", () => {
    expect(normalizeCatalogueKey(" Café-au lait! ")).toBe("cafeaulait");
    expect(normalizeCatalogueKey("Ｃｏｃａ Cola")).toBe("cocacola");
  });
});

describe("ordering invariants", () => {
  test("new active records append after the current maximum position", () => {
    expect(nextPosition([])).toBe(0);
    expect(nextPosition([{ position: 7 }, { position: 2 }])).toBe(8);
  });

  test("a reorder must contain every visible id exactly once", () => {
    expect(() => assertCompleteOrder(["b", "a"], ["a", "b"])).not.toThrow();
    expect(() => assertCompleteOrder(["a"], ["a", "b"])).toThrow(
      "Order must include every visible record exactly once.",
    );
    expect(() => assertCompleteOrder(["a", "a"], ["a", "b"])).toThrow(
      "Order must include every visible record exactly once.",
    );
  });
});
