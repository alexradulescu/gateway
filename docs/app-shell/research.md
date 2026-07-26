# AppShell implementation note

Date: 26 July 2026.

## BLUF

The working local iOS apps do not lock their outer app root to a fixed viewport.

AppShell must use the same outer layout:

- `html`, `body`, and the React root remain in normal document flow.
- The shell has `min-height: 100vh`.
- The document owns page scrolling.
- The header and footer are fixed overlays.
- Main content uses safe-area and bar padding, so it starts and finishes clear of persistent controls.
- Scrolling content can remain visible behind the transparent overlays.

The rejected Gateway version did the opposite. It fixed the shell to `inset: 0`, hid root overflow, positioned the body absolutely, and made the body a second scroll viewport. On iOS, that fixed composition ended above the physical bottom of the display.

## Local reference implementations

### Stocky

Location: `~/Funspace/Stocky`

Framework:

- React 19
- Vite 8
- Mantine 8 `AppShell`
- TanStack Router
- `vite-plugin-pwa`

Relevant implementation:

- `body` and `#root` use `min-height: 100vh`.
- The root is not fixed and page overflow is not locked.
- `AppShell.Main` uses normal document layout.
- The fixed footer includes `safe-area-inset-bottom`.
- Main bottom padding includes the footer height and safe inset.
- `viewport-fit=cover`, Apple standalone metadata, a standalone manifest, and matching root and manifest colours are present.

### Buddy

Location: `~/Funspace/buddy`

Framework:

- React 19
- Vite 8
- Mantine 8 `AppShell`
- TanStack Router

Relevant implementation:

- The outer root is not fixed or overflow-locked.
- Mantine owns the fixed header and mobile footer.
- The mobile header includes `safe-area-inset-top`.
- The mobile footer height and padding include `safe-area-inset-bottom`.
- Initial main content is padded below the header while later content can move behind it.

Buddy is a layout reference. It does not currently supply the complete installable PWA setup.

### Bookster

Location: `~/Funspace/bookster`

Framework:

- React 19
- Vite 7
- Mantine 7
- TanStack Router
- `vite-plugin-pwa`

Relevant implementation:

- `html`, `body`, and `#app` use the available page height without a fixed root.
- The outer application is a normal `100vh` flex layout.
- The header is sticky and has a 48 px inner row.
- The footer is fixed and includes `safe-area-inset-bottom`.
- Scrollable book content adds bottom padding for the footer and safe inset.
- The manifest uses standalone display and portrait orientation.

Bookster has keyboard-offset code in its footer. That code is deliberately excluded from AppShell.

## Resulting component contract

The React API is composition:

```tsx
<AppShell>
  <AppHeader>{/* optional */}</AppHeader>
  <AppBody>{/* page content */}</AppBody>
  <AppFooter>{/* optional */}</AppFooter>
</AppShell>
```

The four components only render semantic elements:

- `AppShell` renders `div`.
- `AppHeader` renders `header`.
- `AppBody` renders `main`.
- `AppFooter` renders `footer`.

Core CSS owns the layout:

- `AppShell` has a `100vh` minimum and the app canvas background.
- `AppBody` remains in normal flow.
- `AppHeader` and `AppFooter` are fixed and transparent.
- Both bars have a 48 px default inner size.
- Their total boxes include the corresponding safe-area inset.
- `:has()` adds bar clearance to `AppBody` only when that optional bar is present.
- Apps must override `--app-shell-header-size` or `--app-shell-footer-size` when a bar is taller.
- Fixed top and bottom pseudo-elements cover only the real unsafe hit regions and paint a 12 px fade inside them.

The core is 50 formatted CSS lines. It has no viewport unit selection, viewport event listener, `ResizeObserver`, focus handler, or keyboard handling.

## PWA setup

The demo supplies:

- `viewport-fit=cover`;
- Apple standalone and translucent status-bar metadata;
- light and dark `theme-color` values that match the page canvas;
- an app-scoped manifest;
- standalone display mode;
- portrait orientation;
- app-scoped start URL and scope;
- 192 px, 512 px, maskable, and Apple touch icons.

The `html`, `body`, shell, manifest, and theme colours must agree. This prevents a different browser-owned colour from appearing around the page during launch or overscroll.

## Explicit exclusions

This first core does not handle:

- landscape;
- virtual keyboard movement;
- input focus;
- `visualViewport`;
- intrinsically measured bar heights;
- collapsing bars;
- blur or glass effects;
- offline service-worker behaviour.

Bar size is an explicit contract, as it is in Mantine and Stocky. The configured size sets both the fixed bar box and the matching main-content clearance. Applications that need bars taller than 48 px set the corresponding variable; the core does not infer height from arbitrary children.

## Regression contract

For a long page:

- `document.scrollingElement` is `HTML`;
- document scroll height is greater than viewport height;
- `AppShell` and `AppBody` have static positioning;
- `AppBody` does not set `overflow-y: auto`;
- the fixed footer ends at the viewport bottom;
- the final content can stop above the footer;
- removing a header or footer removes only that bar's main padding;
- simulated 59 px top and 34 px bottom safe insets produce 107 px and 82 px total bar regions.

The iPhone 15 Pro remains the final device acceptance test. Test both a Safari tab and a newly installed Home Screen app because iOS can retain an older installed web-app snapshot or cached asset set.
