import { expect, test } from "bun:test";

const css = await Bun.file(new URL("./styles.css", import.meta.url)).text();
const libraryPage = await Bun.file(new URL("./components/LibraryPage.tsx", import.meta.url)).text();
const booksterContext = await Bun.file(
  new URL("./context/BooksterContext.tsx", import.meta.url),
).text();

function rule(selector: string) {
  const needle = `${selector} {`;
  const start = css.indexOf(needle);
  expect(start).toBeGreaterThanOrEqual(0);

  const end = css.indexOf("}", start);
  expect(end).toBeGreaterThan(start);

  return css.slice(start, end);
}

test("Bookster delegates its safe-area layout to AppShell", () => {
  const library = rule(".bookster-library");
  const settings = rule(".bookster-settings");

  expect(library).toContain("--app-shell-header-size: 99px");
  expect(library).toContain("--app-shell-footer-size: 72px");
  expect(settings).toContain("--app-shell-header-size: 56px");
  expect(css).not.toContain("--bookster-safe-top");
  expect(css).not.toContain("--bookster-safe-bottom");
});

test("the library no longer creates a nested scroll viewport", () => {
  const body = rule(".bookster-library-scroll");

  expect(body).not.toContain("height: 100%");
  expect(body).not.toContain("overflow: auto");
  expect(body).not.toContain("position:");
  expect(rule(".bookster-library")).not.toContain("position:");
  expect(libraryPage).toContain("useWindowVirtualizer");
  expect(libraryPage).not.toContain("useVirtualizer");
});

test("Bookster bars stop at AppShell safe-area boundaries", () => {
  const header = rule(".bookster-floating-header");
  const footer = rule(".bookster-floating-footer");

  expect(header).not.toContain("top: 0");
  expect(footer).not.toContain("bottom: 0");
  expect(header).not.toContain("position: fixed");
  expect(footer).not.toContain("position: fixed");
});

test("loading uses the same AppShell state surface", () => {
  expect(booksterContext).toContain("return <BooksterLoadingState />");
  expect(booksterContext).not.toContain('<main className="bookster-state"');
});
