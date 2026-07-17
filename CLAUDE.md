# Gateway — Working Context

## BLUF

- Gateway is the entry point and shared wrapper for a growing collection of personal family apps.
- Every app is a Progressive Web App (PWA), designed primarily for mobile use.
- Treat each app as its own product inside Gateway.
- When the user names an app, work only on that app unless they explicitly request a cross-app or Gateway-level change.
- Only modify or evaluate the Gateway wrapper when the user refers to “Gateway” specifically.

## Product Direction

- Build for a private, personal, family-oriented setting rather than a generic public SaaS product.
- Aim for the care, restraint, and refinement of a first-party iOS app.
- Take strong inspiration from Apple’s iOS design guidance, especially the visual and interaction direction of iOS 26 and iOS 27.
- Prioritize:
  - Clear visual hierarchy.
  - Consistent spacing and alignment.
  - Comfortable mobile touch targets.
  - Native-feeling navigation and interaction patterns.
  - Purposeful depth, translucency, and material effects.
  - Accessible contrast and legibility.
  - Polished loading, empty, error, and offline states.
  - Safe-area-aware layouts suitable for installed PWAs.
- Use iOS as design inspiration, not as a reason to imitate native controls where that would harm web usability or accessibility.

## Scope and Naming

- “Gateway” means the launcher and shared outer wrapper at `/`.
- Individual apps live under stable subpaths and should be discussed, reviewed, and changed independently.
- A request naming one app does not authorize changes to:
  - Other apps.
  - The Gateway launcher.
  - Shared behavior outside that app’s needs.
- If the user says “the app,” infer the currently discussed individual app—not Gateway—unless context clearly says otherwise.

## Implementation Expectations

- Preserve each app’s established stack and direction unless the user asks for a migration.
- Keep every app installable and reliable as a PWA.
- Review mobile layouts first, then verify larger responsive sizes.
- Check real interaction states and full flows, not only static components.
- Prefer a coherent system of reusable tokens and components over isolated one-off styling.
- Keep visual effects restrained: materials and decoration should create hierarchy and depth without compromising clarity or performance.
- Follow the repository architecture and commands documented in `gateway.md`.
