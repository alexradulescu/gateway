# AppShell implementation note

Date: 26 July 2026.

## BLUF

The working local iOS apps do not lock their outer app root to a fixed viewport.

AppShell must use the same outer layout:

- `html`, `body`, and the React root remain in normal document flow.
- The shell has `min-height: 100dvh`.
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

- `AppShell` has a `100dvh` minimum and the app canvas background.
- `AppBody` remains in normal flow.
- `AppHeader` and `AppFooter` are fixed and transparent.
- Both bars have a 48 px default inner size.
- Their 48 px boxes sit immediately inside the corresponding safe-area inset.
- `:has()` adds bar clearance to `AppBody` only when that optional bar is present.
- Apps must override `--app-shell-header-size` or `--app-shell-footer-size` when a bar is taller.
- No fixed layer covers the unsafe edge, so Safari can composite the scrolling document beneath its
  Liquid Glass controls.

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

## Safari tab versus standalone unsafe areas

### Correction

The earlier conclusion that Safari cannot show live webpage content beneath its Liquid Glass controls
was wrong. The Facebook screenshot is direct counter-evidence. Safari can composite normal scrolling
content beneath its top and bottom controls.

The actual constraint is narrower: Safari 26 and 27 use a special fixed-edge colour-fill path when a
painted, viewport-constrained layer touches an obscured edge.

### What WebKit does

Current WebKit source defines an internal **Content Inset Background Fill** preference and enables it
when Liquid Glass is enabled
([preference definition](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml#L2223-L2234),
[Cocoa default](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebKit/Shared/Cocoa/WebPreferencesDefaultValuesCocoa.mm#L155-L170)).
For every non-zero obscured inset, WebKit asks the page for a fixed-container edge
([WebPageCocoa.mm](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebKit/WebProcess/WebPage/Cocoa/WebPageCocoa.mm#L1707-L1743)).

The sampler:

- only runs when the page has viewport-constrained objects;
- looks for `position: fixed` or `position: sticky` elements;
- treats an element spanning at least 90% of an edge as an edge container;
- samples a two-pixel strip near that edge;
- samples only fixed and sticky layers, excluding normal scrolling content; and
- turns a semi-transparent edge colour into an opaque result by blending it with the page background,
  or forces its alpha to `1`
  ([container detection and blending](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebCore/page/LocalFrameView.cpp#L2259-L2703),
  [fixed/sticky-only snapshot flags](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebCore/page/PageColorSampler.cpp#L299-L360)).

WKWebView then inserts a native `WKColorExtensionView` **above** the web content for the obscured
inset. It uses the sampled fixed-edge colour, or the page background when there are multiple fixed
colours
([WKWebView.mm](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebKit/UIProcess/API/Cocoa/WKWebView.mm#L3469-L3563)).
This is the heuristic WebKit engineers described for fixed bottom controls in Safari 26
([WebKit bug 297779, comment 23](https://bugs.webkit.org/show_bug.cgi?id=297779#c23)).

WebKit's own regression test confirms the distinction: it ignores non-fixed content at an edge while
sampling a fixed header
([`color-sampling-ignores-non-fixed-content.html`](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/LayoutTests/fast/page-color-sampling/color-sampling-ignores-non-fixed-content.html)).

### Why AppShell is blue and green

The previous demo matched the fixed-edge heuristic exactly:

1. `AppHeader` was fixed, full width and touched the top edge.
2. `AppFooter` was fixed, full width and touched the bottom edge.
3. Their diagnostic backgrounds have alpha `0.34`.
4. `AppShell::before` and `AppShell::after` were also fixed, full-width edge layers.

WebKit blended those semi-transparent blue and green backgrounds against the app canvas and painted
the result as an opaque native extension above the scrolling document. The `theme-color` metadata is not
the source of these two colours. In WebKit, the fixed-edge blend uses the rendered page background,
while theme colour is tracked separately
([`Page::themeColor` and `Page::pageExtendedBackgroundColor`](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WebCore/page/Page.cpp#L3649-L3669)).

Facebook's screenshot is consistent with normal feed content reaching the obscured areas without a
painted full-width fixed or sticky layer at the sampled edge. This is an inference from the screenshot
and WebKit's algorithm; the authenticated Facebook DOM was not inspected.

### What metadata can and cannot do

`viewport-fit=cover` remains necessary for edge-to-edge layout, and safe-area variables remain the way
to keep essential controls in the visible rectangle
([WebKit viewport guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/),
[CSS safe-area variables](https://www.w3.org/TR/css-env-1/#safe-area-insets)).
Neither setting disables the fixed-edge colour-fill algorithm.

Changing `theme-color` to transparent is not an escape hatch. The Web App Manifest specification
allows the user agent to ignore alpha, and most presentation contexts cannot be transparent
([Web App Manifest](https://www.w3.org/TR/appmanifest/#theme_color-member)).
Safari 27's published feature list does not add a public webpage API for disabling content-inset
background fill, and the current WebKit implementation still exposes this as an internal preference
([Safari 27 beta](https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/),
[internal preference](https://github.com/WebKit/WebKit/blob/01aaa3e0be0c606e0e276f9b5266bc1915a86277/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml#L2223-L2234)).

### Ranked hypotheses and device test

1. **Very high confidence:** the full-width fixed header and footer create the opaque blue and green
   extensions.
2. **High confidence:** the fixed edge-fade pseudo-elements can independently create or retain an
   opaque extension when they have non-zero size.
3. **Low confidence:** manifest or theme metadata is responsible. The colours and WebKit source do
   not support this.

The implemented causality test keeps both bars fixed but moves their boxes to the inner safe-area
boundaries and removes the fixed edge pseudo-elements. This preserves the bars' visual positions while
leaving normal document content at WebKit's sampled edges. The iPhone test remains the final
confirmation.

The stricter diagnostic, if the device still shows solid fills, is:

- keep the document, metadata, colours and scroll position unchanged;
- change the header and footer from `position: fixed` to non-viewport-constrained positioning for a
  test build; and
- compare the same scroll positions in Safari.

If live amber cards replace the opaque blue and green fills, the fixed-edge extension is confirmed.
Then test the product trade-off separately:

- **robust browser-tab behaviour:** do not let painted fixed or sticky layers touch Safari's sampled
  edge; or
- **always-fixed app bars:** accept Safari's colour extension in browser mode.

A small transparent gutter between a fixed bar and the viewport edge may evade today's private
sampling strip, but that would depend on undocumented WebKit constants and should not be a core
contract.

Installed Home Screen mode is different. Safari's address toolbar is absent. With Apple full-screen
mode enabled, `apple-mobile-web-app-status-bar-style=black-translucent` lets web content occupy the
status-bar area while the OS items remain above it
([Apple Safari HTML Reference](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)).
Test browser and newly installed standalone modes separately.

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
- simulated 59 px top and 34 px bottom safe insets produce 107 px and 82 px body clearances, while
  each fixed bar remains 48 px tall.

The iPhone 15 Pro remains the final device acceptance test. Test both a Safari tab and a newly installed Home Screen app because iOS can retain an older installed web-app snapshot or cached asset set.
