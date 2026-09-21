# Gateway UI

Small React components adapted from Bookster's iOS-inspired redesign. The live **UI Library** app is at `/ui-library/`; its **Composition & API** view documents every component and its main props. These are web interpretations, not Apple's native controls or a complete iOS SDK.

## Use in another Gateway app

Add `"@gateway/ui": "workspace:*"` to the app's dependencies and run `bun install`. Import the stylesheet once and wrap the component tree in `Surface`.

```tsx
import { useState } from "react";
import { Surface, Stack, TopBar, SettingsGroup, SettingsRow, Switch } from "@gateway/ui";
import "@gateway/ui/styles.css";

export function Preferences() {
  const [reminders, setReminders] = useState(true);
  return (
    <Surface theme="light" palette="bookster">
      <TopBar title={<h1 style={{ margin: 0, font: "inherit" }}>Settings</h1>} large />
      <Stack gap={24} style={{ padding: 20 }}>
        <SettingsGroup title="Reading" footer="Your app decides how to save changes.">
          <SettingsRow
            label="Reading reminders"
            trailing={
              <Switch
                label="Reading reminders"
                checked={reminders}
                onChange={(event) => setReminders(event.target.checked)}
              />
            }
          />
        </SettingsGroup>
      </Stack>
    </Surface>
  );
}
```

For a separate repository, copy this package and consume it as a local workspace package. The package exports TypeScript source, so the consuming bundler must support TSX (Vite does). React 19 is its only peer dependency. It is intentionally private and is not published to a registry. Icons are caller-provided React nodes; the showcase uses Lucide, but the package does not depend on it.

## Component map

```text
Surface                           theme + palette tokens
├── TopBar                        title / leading / trailing slots
│   ├── Button
│   └── IconButton
├── Stack                         gap / direction / wrap
│   ├── SegmentedControl          controlled native radio group
│   ├── FilterChip                selected + onClick
│   ├── TextField / SearchField   native input props + label / hint / error
│   ├── SelectField               native select props + option children
│   └── SettingsGroup             title + footer + children
│       ├── SettingsLink          native anchor, label / icon / value
│       └── SettingsRow           label / description / icon / trailing
│           └── Switch            controlled checked + onChange
└── TabBar                        navigation landmark
    └── TabBarItem                href / icon / active + children
```

- App: owns state, persistence, validation rules, routing, and page positioning.
- Components: own native semantics, labeling, slots, and layout. No provider is required.
- CSS: owns colors, spacing, control states, and short transitions. No motion library.

All public prop types are exported from `@gateway/ui`. Most components accept their native element's props, including `className`, `style`, events, and React 19 refs. `SegmentedControl` deliberately accepts only `label`, `value`, `onValueChange`, `options`, and `disabled`. Options have `{ value, label, disabled? }`; use unique values and a value matching one option. Switches are controlled; fields can be controlled or uncontrolled. `Button` defaults to `type="button"`; set `type="submit"` in a form.

Use `SettingsLink` for whole-row navigation. Use `SettingsRow` when its trailing slot holds an interactive control. Do not nest interactive controls in a link. Supply a label for every field and switch and an `aria-label` for every icon button. `TopBar.title` accepts a React node so the consumer can choose the appropriate heading level. Navigation anchors work with native browser routing; compose an app-specific router adapter if required.

## Styling

`Surface` defaults to `theme="light"`, `palette="ios"`. Choose `palette="bookster"` for the warm paper colors from Bookster, or `theme="dark"` for black and charcoal surfaces. Themes are explicit and can be nested. Apps own system-theme detection if needed.

Override these custom properties on your `Surface` class or inline style:

| Token                                        | Responsibility                                       |
| -------------------------------------------- | ---------------------------------------------------- |
| `--ui-page`, `--ui-card`, `--ui-field`       | Page, grouped content, and input surfaces            |
| `--ui-ink`, `--ui-muted`                     | Primary and secondary text                           |
| `--ui-accent`, `--ui-on-accent`, `--ui-soft` | Actions and selected states                          |
| `--ui-line`, `--ui-danger`, `--ui-glass`     | Separators, destructive actions, navigation material |

All selectors are prefixed with `ui-`; resets are scoped beneath `Surface`. Top bars and navigation use restrained backdrop blur with an opaque fallback. Controls use 120–160ms transitions; reduced-motion preferences disable them. Components have no viewport positioning: the app decides whether a top bar is sticky or a tab bar floats. Field font sizes stay at 16px, and primary controls have at least 44px touch targets.

## Run the showcase

```sh
bun run --cwd apps/ui-library dev
bun run --cwd apps/ui-library typecheck
bun run --cwd apps/ui-library build
```

The gallery includes local-only demo state, light/dark and iOS/Bookster palettes, accessible native inputs, disabled and error examples, composition snippets, and an API table for all 16 components. Bookster itself continues to use its existing components; this package extracts the patterns without coupling the library to its backend or router.

Design references: [Bookster settings](../../apps/bookster/src/components/SettingsPage.tsx), [Bookster styles](../../apps/bookster/src/styles.css), and [Apple Liquid Glass guidance](https://developer.apple.com/documentation/technologyoverviews/liquid-glass).
