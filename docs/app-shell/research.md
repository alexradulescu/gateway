# AppShell research: iOS 26 Home Screen PWAs

Research date: 26 July 2026.

This note uses primary sources only: Apple and WebKit documentation, W3C specifications, and the official documentation or source of each UI library.

Safari 26.5 is the current stable release on this date. Safari 27 is beta and is out of scope. See [Apple's Safari release index](https://developer.apple.com/documentation/safari-release-notes).

## BLUF

Build this as two related layers:

1. A static PWA setup in the demo: manifest, icons, HTML metadata, and root CSS.
2. Four React layout primitives: `AppShell`, `AppHeader`, `AppBody`, and `AppFooter`.

Use `viewport-fit=cover` to make the layout viewport fill the display. Use the four `env(safe-area-inset-*)` values to keep readable and interactive content in the safe area. Let backgrounds and the scroll surface extend behind the status area, Home indicator, header, and footer.

Use manifest `display: "standalone"`, not `"fullscreen"`, as the honest default. iOS still shows system status and navigation areas for a manifest that requests `fullscreen`. WebKit has an open bug for true manifest fullscreen on iPhone and iPad. The app can be edge-to-edge, but it cannot promise to hide all system UI.

The closest library patterns are:

- Mantine for a compound AppShell API, semantic regions, fixed bars, size variables, and content offsets.
- Ionic for fullscreen content that scrolls behind translucent headers and footers, plus explicit safe-area padding.
- HeroUI ScrollShadow for a CSS-variable-driven fade implementation.

None of the reviewed libraries supplies the complete installed-PWA, unsafe-area, and interaction contract required here.

## 1. iOS web app and viewport behaviour

### iOS 26 install behaviour

iOS 26 and iPadOS 26 open every website added to the Home Screen as a web app by default. The user can turn off **Open as Web App** during installation. A manifest is no longer an installability requirement, but it still supplies identity, icons, start URL, scope, colours, and display preferences. Service workers have also never been an iOS Home Screen install requirement. See [WebKit: Safari 26.0, “Every site can be a web app”](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/#every-site-can-be-a-web-app-on-ios-and-ipados).

Before iOS 26, WebKit treated a manifest with `display: "standalone"` or `"fullscreen"` as a Home Screen web app. It opened outside the browser UI and received its own App Switcher entry. WebKit also confirms that `apple-touch-icon` takes precedence over manifest icons when both are present. See [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

**Consequence:** keep a complete manifest and Apple metadata for predictable identity and older iOS versions. Do not state that the manifest forces app mode on iOS 26; the user controls that choice.

### `standalone` is not true fullscreen

The W3C manifest model defines `fullscreen` as using all available display area and `standalone` as looking and feeling like a standalone application. See the current [Web Application Manifest specification](https://www.w3.org/TR/appmanifest/#display-modes).

WebKit accepts both values to launch a Home Screen web app. However, WebKit's open [bug 264220](https://bugs.webkit.org/show_bug.cgi?id=264220) states that manifest `display: "fullscreen"` is not truly fullscreen on iOS because the status bar remains visible. A duplicate report also records the bottom navigation indicator remaining visible in portrait and landscape; see [bug 280181](https://bugs.webkit.org/show_bug.cgi?id=280181).

**Consequence:** choose `"standalone"`. Treat the status bar, Dynamic Island, rounded corners, and Home indicator as permanent system surfaces. `viewport-fit=cover` permits drawing beneath them; it does not remove them.

### `viewport-fit=cover` and safe-area values

Safari normally insets a page into the safe area. `viewport-fit=cover` disables that automatic inset and lays the page out to the full screen. This can put content under the sensor housing and make bottom controls hard to use. WebKit introduced four CSS environment values for the repair:

- `env(safe-area-inset-top)`
- `env(safe-area-inset-right)`
- `env(safe-area-inset-bottom)`
- `env(safe-area-inset-left)`

WebKit says to apply these values selectively to important content and controls. It also recommends `max()` when a normal content gutter must remain larger than a zero safe inset. See [WebKit: Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/). The values are standardised in [CSS Environment Variables Level 1](https://www.w3.org/TR/css-env-1/#safe-area-insets).

The required viewport metadata is:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Do not add `maximum-scale=1` or `user-scalable=no`. Those values prevent or restrict user zoom.

### Apple compatibility metadata

Apple's legacy extension enables standalone mode on older releases:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
```

`apple-mobile-web-app-status-bar-style=black-translucent` makes the web content occupy the area beneath the visible status bar. Apple documents that the content can then be partially obscured by that bar. See Apple's archived but still authoritative [Safari HTML Reference: Supported Meta Tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html).

Use it as a compatibility hint, not as the main layout mechanism:

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

The root background must cover the whole page because Safari fills inset or exposed areas from the `html` or `body` background. The manifest `background_color` is a launch/default colour, not a replacement for page CSS.

Add light and dark `theme-color` meta values that match the root background. WebKit uses `theme-color` for the iOS status and overscroll areas and supports the `media` attribute for colour-scheme variants. See [WebKit: New WebKit Features in Safari 15](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/).

```html
<meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
```

### Height

Safari has supported `svh`, `lvh`, and `dvh` since 15.4. `100dvh` follows the dynamic viewport; `100svh` is the smallest viewport and `100lvh` is the largest. See [WebKit: New WebKit Features in Safari 15.4](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/).

The core does not select among viewport units. It uses `position: fixed; inset: 0` and fills the layout viewport that WebKit exposes.

This distinction matters on current iOS 26 releases:

- [WebKit bug 301108](https://bugs.webkit.org/show_bug.cgi?id=301108) tracks Safari failing to honour `viewport-fit=cover` across the physical screen.
- [WebKit bug 301994](https://bugs.webkit.org/show_bug.cgi?id=301994) records a Home Screen app where `screen.height` is 874 px but `innerHeight`, `100dvh`, and the document client height are 812 px. The remaining 62 px strip is outside the web layer and cannot be reached by a DOM element.

The page background and light/dark `theme-color` values must therefore match the app canvas. They provide the best available colour for any iOS-owned strip, but cannot place content or gradients inside it.

## 2. Recommended layout contract

### Separate full-bleed visuals from safe interaction

Apple defines a safe area as the region that avoids system and interactive features such as Dynamic Island. Apple recommends full-bleed visuals that still accommodate these features. See [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout).

The practical web contract should be:

- The shell background and scroll surface cover the full viewport.
- The scrolling content can be seen behind the fixed header and footer.
- Readable content and action targets receive safe inline and block padding.
- Header controls sit below `safe-area-inset-top`.
- Footer controls sit above `safe-area-inset-bottom`.
- Decorative fades span the unsafe edges and have `pointer-events: none`.
- The first and last content items have enough scroll padding to stop fully above or below the overlays.

Do not promise that arbitrary content can remain visible in an unsafe region while the same pixels are universally “non-interactive”. CSS paint, hit testing, and scrolling do not provide a general safe-area hit-test mask that forwards scroll gestures but rejects all taps. The robust interpretation is: **background and transient scrolling paint may enter unsafe areas; persistent text and controls do not.**

### Proposed anatomy

```text
AppShell (full viewport, owns CSS variables)
├── AppBody / main (full-bleed scroll region)
│   └── safe content wrapper
├── AppHeader (optional fixed overlay)
│   └── safe interactive inner bar
├── AppFooter (optional fixed overlay)
│   └── safe interactive inner bar
└── top and bottom edge fades (decorative)
```

Recommended CSS variables:

```css
--app-safe-top: env(safe-area-inset-top, 0px);
--app-safe-right: env(safe-area-inset-right, 0px);
--app-safe-bottom: env(safe-area-inset-bottom, 0px);
--app-safe-left: env(safe-area-inset-left, 0px);
--app-header-height: 48px;
--app-footer-height: 48px;
--app-content-gutter: 16px;
--app-edge-fade-size: 12px;
```

The interactive header box is `safe top + header height`. The interactive footer box is `footer height + safe bottom`. The main scroll padding must include those values only when the corresponding overlay exists. Inline content padding should use `max(var(--app-content-gutter), var(--app-safe-left))` and the matching right value.

The component should set state attributes such as `data-has-header` and `data-has-footer`. CSS can then select the correct start and end padding without runtime browser detection.

### Header height

Apple does not define a universal 48 px web header. Current Apple guidance says button hit regions should be at least 44 by 44 points; see [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons). Native bar height also changes with content, device class, Dynamic Type, and bar style.

Use the agreed **48 px minimum inner bar**, without claiming that native iOS bars have one universal height. Keep all controls at least 44 by 44 CSS pixels for an iOS-like touch target. WCAG 2.2 requires at least 24 by 24 CSS pixels at Level AA, with exceptions, and 44 by 44 at the enhanced level; see [WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

### Header and footer surface

iOS 26 places navigation and controls in a distinct Liquid Glass layer that floats above content. Apple says content can scroll and peek beneath it, while the material preserves control legibility. Apple also says scroll-edge effects clarify the boundary between moving content and pinned controls; they are not decorative dark overlays. See [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [WWDC25: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/).

A web component cannot reproduce Apple's system material exactly. Use:

- transparent bars with no blur or glass in the core;
- app-owned classes and CSS variables for colour and diagnostic overlays;
- a fixed 12 px colour fade at each exposed web viewport edge, which reaches the physical edge when WebKit honours `viewport-fit=cover`;
- no automatic collapsing or parallax in the core component.

## 3. Library comparison

The versions below are the versions shown by the official documentation on the research date.

| Library       | Official approach                                                                                                                                                                                                                                                                                                                                                                                                                                     | Reusable idea                                                                                                                                                                        | What it does not solve                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mantine 9.4.2 | [`AppShell`](https://mantine.dev/core/app-shell/) has compound Header, Footer, Main, Navbar, Aside, and Section parts. Bars are fixed. Main is offset by configured bar sizes. It uses semantic `header`, `footer`, and `main` elements and exposes size/offset CSS variables.                                                                                                                                                                        | Compound API, optional sections, explicit size configuration, semantic roots, z-index and offset variables. Setting a bar offset to false is close to the scroll-behind requirement. | It does not provide manifest or HTML metadata. Its default Main is offset, so content does not scroll behind bars. Its current source adds `env(safe-area-inset-bottom)` to the footer, but not a complete four-side safe-area contract; see [`AppShell.module.css`](https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/AppShell/AppShell.module.css). |
| Ionic 8       | [`ion-content fullscreen`](https://ionicframework.com/docs/api/content) scrolls behind headers and footers. [`ion-header`](https://ionicframework.com/docs/api/header) and [`ion-footer`](https://ionicframework.com/docs/api/footer) can be translucent in iOS mode and account for device safe areas when they contain toolbars. Ionic states that `ion-content` does not add safe padding automatically because adjacent bars may own it.          | Fullscreen scroll-behind model, safe-area ownership rules, translucent bars, fixed-slot focus-order option, explicit `--ion-safe-area-*` variables.                                  | It is a full UI runtime and Web Component system, not a small React primitive. Some behaviour is Ionic-mode-specific. It still needs host manifest and viewport metadata.                                                                                                                                                                                                                     |
| HeroUI 3.2.2  | HeroUI's [current component list](https://heroui.com/en/docs/react/components) has no AppShell. HeroUI v3 removed Navbar and recommends native HTML plus Tailwind sticky/fixed and backdrop-blur classes; see the [official Navbar migration guide](https://heroui.com/en/docs/react/migration/navbar). [`ScrollShadow`](https://heroui.com/en/docs/react/components/scroll-shadow) detects scroll edges and controls a fade mask with CSS variables. | Scroll-edge state and configurable fade size. Buttons, Toolbar, and semantic HTML can fill user-provided header/footer content.                                                      | No app-shell layout, PWA metadata, or safe-area ownership. ScrollShadow fades scroll overflow; it is not a device unsafe-area solution.                                                                                                                                                                                                                                                       |
| shadcn/ui     | The [official component catalogue](https://ui.shadcn.com/docs/components) has no AppShell. Its [`Sidebar`](https://ui.shadcn.com/docs/components/radix/sidebar) uses provider + compound parts, with sticky sidebar header/footer and a scrollable middle. shadcn adds source files to the app for the user to own and customise.                                                                                                                     | Source-owned compound composition and clear slot responsibilities.                                                                                                                   | Sidebar is a side-navigation component, not a mobile viewport shell. It provides no manifest, iOS safe-area, full-bleed, or top/bottom app-bar contract.                                                                                                                                                                                                                                      |

### What to reuse

Reuse Mantine's explicit contract and Ionic's layout behaviour:

- Root config owns bar presence and dimensions.
- Header, footer, and main render semantic elements.
- Main can scroll behind overlays.
- The safe-area owner is unambiguous.
- CSS variables make application-level theming possible.
- Physical-edge fades remain fixed and always visible.

Do not add any reviewed library as a dependency only for AppShell. The required core is small, and a library dependency would not remove the PWA or iOS-specific work.

## 4. Accessibility and motion requirements

- Render one `main` landmark. Use `header` for `AppHeader`. Use `footer` for `AppFooter`. Add `nav` inside the footer only when its content is navigation.
- Keep focus outlines visible above fades and overlays.
- Ensure a focused component is not entirely hidden by the header or footer. This is a WCAG 2.2 Level AA requirement; see [WCAG 2.2: Focus Not Obscured (Minimum)](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum).
- Make every iOS-style control hit area at least 44 by 44 CSS pixels.
- Keyboard accommodation is outside this first core. Applications that add editing flows must test focus visibility separately.
- Do not disable zoom in viewport metadata.
- Do not use colour or transparency as the only boundary between controls and content.
- Keep the edge fades out of the accessibility tree. Prefer pseudo-elements; if they are DOM nodes, use `aria-hidden="true"`.
- Do not animate the gradient as the user scrolls. If future variants collapse, translate, or morph bars, disable non-essential motion under `@media (prefers-reduced-motion: reduce)`. WebKit maps this media query to the Apple Reduce Motion setting; see [WebKit: Responsive Design for Motion](https://webkit.org/blog/7551/responsive-design-for-motion/). W3C also identifies the query as a sufficient technique for interaction animation; see [WCAG technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
- A static opacity change is less risky than scale, parallax, or depth animation. Test Increased Contrast and Reduce Transparency manually because a portable, widely implemented web equivalent cannot be assumed.
- Do not depend on `prefers-reduced-transparency` in stable Safari 26.5. WebKit's implementation issue remains open; see [WebKit bug 175497](https://bugs.webkit.org/show_bug.cgi?id=175497). Supply an inherently legible opaque fallback or an explicit app setting.

## 5. PWA setup baseline for the demo

Use an app-scoped manifest so the Gateway launcher is not captured:

```json
{
  "id": "/app-shell/",
  "name": "AppShell",
  "short_name": "AppShell",
  "start_url": "/app-shell/",
  "scope": "/app-shell/",
  "display": "standalone",
  "background_color": "#f2f2f7",
  "theme_color": "#f2f2f7",
  "icons": [
    {
      "src": "/app-shell/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/app-shell/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

The W3C specification recommends an explicit `scope` to avoid unexpected navigation behaviour; see [Web Application Manifest: scope examples](https://www.w3.org/TR/appmanifest/#understanding-scope).

The page head should include:

```html
<link rel="manifest" href="/app-shell/manifest.webmanifest" />
<link rel="apple-touch-icon" href="/app-shell/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="AppShell" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Use HTTPS in production. A service worker is optional for the iOS 26 install action but is required if the demo must work offline. It is not part of the AppShell component contract.

## 6. Test matrix

The demo should make failures obvious rather than only look polished.

Test these cases on the iPhone 15 Pro:

1. Safari tab, before installation.
2. Home Screen web app, portrait.
3. Header + footer, header only, footer only, and neither.
4. Long content behind both overlays.
5. Buttons near each interactive edge.
6. Light mode, Dark Mode, Increase Contrast, Reduce Transparency, Reduce Motion, and larger text.
7. In-scope navigation and an out-of-scope link.
8. The iOS 26 **Open as Web App** toggle turned on and off.

Show diagnostics in the demo:

- current `matchMedia("(display-mode: standalone)")` state;
- legacy `navigator.standalone` state when present;
- current safe inset values copied into visible CSS-sized rulers;
- screen, layout viewport, visual viewport, and any screen-to-layout height gap;
- header/footer presence and configured sizes.

## 7. Final architecture decisions

1. **Bar sizing:** `AppHeader` and `AppFooter` default to 48 px. Applications can set `--app-shell-header-size` and `--app-shell-footer-size` when a bar is taller.
2. **Scroll owner:** `AppBody` is the only vertical scroller. Root CSS locks document scrolling.
3. **Fade behaviour:** two fixed pseudo-elements provide the 12 px edge fades and block interaction in the exposed unsafe insets.
4. **Surface style:** the core bars are transparent with no blur or glass. Apps own any surface treatment.
5. **Viewport sizing:** the core contains no viewport or keyboard JavaScript and no viewport-height unit. `position: fixed; inset: 0` fills WebKit's layout viewport.
6. **Platform limit:** iOS-owned pixels outside that viewport can only inherit a sampled page colour. The core cannot paint or place controls there.
7. **Offline support:** the first diagnostic demo has no service worker. Installation and online layout testing are the intended scope.
8. **Orientation:** portrait is supported. Landscape behaviour and testing are out of scope.
