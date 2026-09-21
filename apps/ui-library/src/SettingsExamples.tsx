import { useState } from "react";
import { Bell, Sun } from "lucide-react";
import { SettingsGroup, SettingsLink, SettingsRow, Switch } from "@gateway/ui";

import { Specimen, SectionTitle } from "./Specimen";
export function SettingsExamples({
  setStatus,
  onShowOverview,
  theme,
}: {
  setStatus: (message: string) => void;
  onShowOverview: () => void;
  theme: "light" | "dark";
}) {
  const [enabled, setEnabled] = useState(true);
  return (
    <section id="settings">
      <SectionTitle index="04 / GROUPING" title="Everything in its place">
        Bookster’s settings, broken into reusable pieces.
      </SectionTitle>
      <Specimen
        number="08"
        title="Grouped settings"
        description="Compose rows, links, controls, and supporting copy."
        code={
          '<SettingsGroup title="Preferences" footer="Saved on this device.">\n  <SettingsLink label="Appearance" href="/appearance" />\n  <SettingsRow label="Reminders" trailing={\n    <Switch label="Reminders" checked={on} onChange={toggle} />\n  } />\n</SettingsGroup>'
        }
      >
        <SettingsGroup
          title="Preferences"
          footer="A row owns layout. Its trailing slot owns the control."
        >
          <SettingsLink
            label="Appearance"
            description="Explore the theme controls"
            icon={<Sun size={18} />}
            href="#overview"
            onClick={() => {
              onShowOverview();
              setStatus("Use the moon button or palette selector to change appearance.");
            }}
            value={theme === "light" ? "Light" : "Dark"}
          />
          <SettingsRow
            label="Notifications"
            icon={<Bell size={18} />}
            trailing={
              <Switch
                label="Notifications"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
            }
          />
          <SettingsRow
            label="Managed setting"
            description="Disabled by the account owner"
            trailing={<Switch label="Managed setting" checked disabled />}
          />
        </SettingsGroup>
      </Specimen>
    </section>
  );
}
