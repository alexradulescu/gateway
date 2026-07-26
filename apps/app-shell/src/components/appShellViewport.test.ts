import { describe, expect, test } from "bun:test";
import { resolveViewportOverride } from "./appShellViewport";

describe("AppShell viewport policy", () => {
  test("keeps the full CSS viewport when the keyboard is closed", () => {
    expect(
      resolveViewportOverride({
        layoutHeight: 852,
        visualHeight: 780,
        visualOffsetTop: 0,
        visualPageTop: 0,
        windowScrollY: 0,
        scale: 1,
        hasFocusedEditor: false,
      }),
    ).toBeNull();
  });

  test("ignores a small visual viewport difference after the keyboard is dismissed", () => {
    expect(
      resolveViewportOverride({
        layoutHeight: 852,
        visualHeight: 780,
        visualOffsetTop: 0,
        visualPageTop: 0,
        windowScrollY: 0,
        scale: 1,
        hasFocusedEditor: true,
      }),
    ).toBeNull();
  });

  test("follows a materially contracted visual viewport while editing", () => {
    expect(
      resolveViewportOverride({
        layoutHeight: 852,
        visualHeight: 500,
        visualOffsetTop: 12,
        visualPageTop: 14,
        windowScrollY: 0,
        scale: 1,
        hasFocusedEditor: true,
      }),
    ).toEqual({
      height: 500,
      offsetTop: 14,
    });
  });
});
