import { expect, test } from "bun:test";

const css = await Bun.file(new URL("./app-shell.css", import.meta.url)).text();

function rule(selector: string, fromEnd = false) {
  const needle = `${selector} {`;
  const start = fromEnd ? css.lastIndexOf(needle) : css.indexOf(needle);
  expect(start).toBeGreaterThanOrEqual(0);

  const end = css.indexOf("}", start);
  expect(end).toBeGreaterThan(start);

  return css.slice(start, end);
}

test("AppShell keeps the page in normal document flow", () => {
  const shell = rule('[data-slot="app-shell"]');

  expect(shell).toContain("min-block-size: 100vh");
  expect(shell).not.toContain("position: fixed");
  expect(shell).not.toContain("overflow: hidden");
});

test("AppBody does not become a second scroll viewport", () => {
  const body = rule('[data-slot="app-body"]');

  expect(body).not.toContain("position: absolute");
  expect(body).not.toContain("overflow-y: auto");
});

test("bar boxes and body clearance use the same configured sizes", () => {
  const header = rule('[data-slot="app-header"]');
  const footer = rule('[data-slot="app-footer"]', true);

  expect(header).toContain(
    "block-size: calc(var(--app-shell-safe-top) + var(--app-shell-header-size, 48px))",
  );
  expect(footer).toContain(
    "block-size: calc(var(--app-shell-safe-bottom) + var(--app-shell-footer-size, 48px))",
  );
  expect(header).not.toContain("min-block-size");
  expect(footer).not.toContain("min-block-size");
});

test("edge guards cover only real unsafe insets", () => {
  const edges = rule('[data-slot="app-shell"]::before,\n[data-slot="app-shell"]::after');
  const bottomEdge = rule('[data-slot="app-shell"]::after', true);

  expect(edges).toContain("block-size: var(--app-shell-safe-top)");
  expect(bottomEdge).toContain("block-size: var(--app-shell-safe-bottom)");
  expect(edges).not.toContain("max(12px");
  expect(bottomEdge).not.toContain("max(12px");
});
