import { ChevronRight } from "lucide-react";

import { componentDocs } from "./componentDocs";

import { SectionTitle } from "./Specimen";
export function CompositionGuide() {
  return (
    <section id="composition">
      <SectionTitle index="05 / COMPOSITION" title="Build with what you need">
        No provider. No router. Your state, your content.
      </SectionTitle>
      <div className="composition-card">
        <pre>
          <code>
            {
              'import { Surface, Stack, TopBar, SettingsGroup,\n  SettingsRow, Switch } from "@gateway/ui";\nimport "@gateway/ui/styles.css";\n\n<Surface theme="light" palette="bookster">\n  <TopBar title="Settings" large />\n  <Stack gap={24}>\n    <SettingsGroup title="Preferences">\n      <SettingsRow label="Reminders" trailing={\n        <Switch label="Reminders" checked={enabled}\n          onChange={e => setEnabled(e.target.checked)} />\n      } />\n    </SettingsGroup>\n  </Stack>\n</Surface>'
            }
          </code>
        </pre>
        <div className="composition-boundaries">
          <span>
            <strong>App</strong>State & navigation
          </span>
          <ChevronRight size={17} />
          <span>
            <strong>Components</strong>Semantics & layout
          </span>
          <ChevronRight size={17} />
          <span>
            <strong>CSS tokens</strong>Theme & motion
          </span>
        </div>
      </div>
      <div className="api-table-wrap">
        <table className="api-table">
          <caption>All 16 components · native element props are forwarded where applicable</caption>
          <thead>
            <tr>
              <th>Component</th>
              <th>Main props</th>
              <th>Composition</th>
            </tr>
          </thead>
          <tbody>
            {componentDocs.map((doc) => (
              <tr key={doc.name}>
                <td>
                  <code>{doc.name}</code>
                </td>
                <td>{doc.props}</td>
                <td>{doc.composition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
