export const componentDocs = [
  {
    name: "Surface",
    props: "theme: light | dark; palette: ios | bookster",
    composition: "Scopes tokens to children; nested themes work.",
  },
  {
    name: "Stack",
    props: "gap: 8 | 12 | 16 | 24 | 32; direction; wrap",
    composition: "Arrange any children vertically or horizontally.",
  },
  {
    name: "TopBar",
    props: "title; leading; trailing; subtitle; large",
    composition: "Pass actions into slots; caller owns heading level and positioning.",
  },
  {
    name: "Button",
    props: "variant: primary | secondary | plain | danger; fullWidth",
    composition: "Native button props, children, onClick, disabled, type.",
  },
  {
    name: "IconButton",
    props: "Button props; aria-label (required)",
    composition: "Pass any icon as children; accessible name required.",
  },
  {
    name: "TabBar",
    props: "aria-label; children",
    composition: "Navigation container; compose TabBarItem children.",
  },
  {
    name: "TabBarItem",
    props: "icon; active; href; children",
    composition: "Native anchor props; router/navigation stays in the app.",
  },
  {
    name: "SegmentedControl",
    props: "label; value; onValueChange; options; disabled",
    composition: "Options: { value, label, disabled? }; native radio group.",
  },
  {
    name: "FilterChip",
    props: "selected; children; onClick; disabled",
    composition: "Native button with aria-pressed; app owns selection rules.",
  },
  {
    name: "TextField",
    props: "label; hint; error; native input props",
    composition: "Generated or explicit id; linked label and feedback.",
  },
  {
    name: "SearchField",
    props: "TextField props, except type",
    composition: "Native search input; app owns filtering and results.",
  },
  {
    name: "SelectField",
    props: "label; hint; native select props",
    composition: "Pass option/optgroup children; native platform picker.",
  },
  {
    name: "Switch",
    props: "label; checked; onChange; disabled",
    composition: "Native checkbox with switch semantics; pair with a row.",
  },
  {
    name: "SettingsGroup",
    props: "title; footer; children",
    composition: "Groups rows or inset fields under a section label.",
  },
  {
    name: "SettingsRow",
    props: "label; description; icon; trailing",
    composition: "Non-interactive layout; put controls in trailing.",
  },
  {
    name: "SettingsLink",
    props: "label; description; icon; value; href",
    composition: "Whole-row anchor and chevron; no nested controls.",
  },
];
