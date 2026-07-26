import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AppBody, AppFooter, AppHeader, AppShell } from "./AppShell";

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

  expect(shell).toContain("min-block-size: 100dvh");
  expect(shell).not.toContain("position: fixed");
  expect(shell).not.toContain("overflow: hidden");
});

test("AppBody does not become a second scroll viewport", () => {
  const body = rule('[data-slot="app-body"]');

  expect(body).not.toContain("position: absolute");
  expect(body).not.toContain("overflow-y: auto");
});

test("bar boxes stop at the safe-area boundary", () => {
  const header = rule('[data-slot="app-header"]');
  const footer = rule('[data-slot="app-footer"]', true);

  expect(header).toContain("inset-block-start: var(--app-shell-safe-top)");
  expect(header).toContain("block-size: var(--app-shell-header-size, 48px)");
  expect(footer).toContain("inset-block-end: var(--app-shell-safe-bottom)");
  expect(footer).toContain("block-size: var(--app-shell-footer-size, 48px)");
});

test("focused form controls collapse the bottom safe-area inset", () => {
  const focusedShell = rule('[data-slot="app-shell"]:has(input:focus, textarea:focus)');

  expect(focusedShell).toContain("--app-shell-safe-bottom: 0px");
});

test("AppShell has no fixed layer over the unsafe areas", () => {
  expect(css).not.toContain('[data-slot="app-shell"]::before');
  expect(css).not.toContain('[data-slot="app-shell"]::after');
});

test("AppShell exposes semantic composable regions", () => {
  const markup = renderToStaticMarkup(
    <AppShell className="test-shell">
      <AppHeader>Header</AppHeader>
      <AppBody>Body</AppBody>
      <AppFooter>Footer</AppFooter>
    </AppShell>,
  );

  expect(markup).toContain('<div class="test-shell" data-slot="app-shell">');
  expect(markup).toContain('<header data-slot="app-header">Header</header>');
  expect(markup).toContain('<main data-slot="app-body">Body</main>');
  expect(markup).toContain('<footer data-slot="app-footer">Footer</footer>');
});
