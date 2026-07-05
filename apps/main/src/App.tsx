import { ArrowUpRight, Boxes, Plus } from "lucide-react";
import { createGlobalStyle, styled } from "@alex.radulescu/styled-static";
import { gatewayApps } from "../../../apps.config";

const GlobalStyle = createGlobalStyle`
  :root {
    color: #1e1c18;
    background: #f4f0e7;
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background:
      linear-gradient(90deg, rgba(30, 28, 24, 0.05) 1px, transparent 1px) 0 0 / 72px 72px,
      linear-gradient(rgba(30, 28, 24, 0.05) 1px, transparent 1px) 0 0 / 72px 72px,
      #f4f0e7;
  }

  a {
    color: inherit;
  }
`;

const Shell = styled.main`
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 56px 0;

  @media (max-width: 720px) {
    padding: 32px 0;
  }
`;

const Hero = styled.section`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  min-height: 260px;
  border-bottom: 2px solid #1e1c18;

  @media (max-width: 720px) {
    display: block;
    min-height: auto;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 18px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  max-width: 760px;
  margin: 0 0 32px;
  font-size: clamp(3.4rem, 12vw, 9rem);
  line-height: 0.86;
  letter-spacing: 0;

  @media (max-width: 720px) {
    margin-bottom: 22px;
  }
`;

const NewAppLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  margin-bottom: 36px;
  border: 2px solid #1e1c18;
  background: #f8c24a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.86rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 5px 5px 0 #1e1c18;

  @media (max-width: 720px) {
    margin-bottom: 28px;
  }
`;

const AppGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
  padding: 28px 0 0;
`;

const AppCard = styled.a`
  --accent: #d64550;
  display: grid;
  min-height: 260px;
  padding: 20px;
  border: 2px solid #1e1c18;
  background: #fffaf0;
  text-decoration: none;
  box-shadow: 7px 7px 0 #1e1c18;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;

  &:hover {
    transform: translate(-2px, -2px);
    background: color-mix(in srgb, var(--accent) 14%, #fffaf0);
    box-shadow: 10px 10px 0 #1e1c18;
  }
`;

const AppNumber = styled.span`
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
`;

const AppIcon = styled.span`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 34px 0 24px;
  border: 2px solid #1e1c18;
  background: var(--accent);
  color: #fffaf0;
`;

const AppName = styled.span`
  display: block;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
`;

const AppDescription = styled.span`
  display: block;
  max-width: 34ch;
  margin-top: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.98rem;
  line-height: 1.5;
`;

const OpenLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: end;
  margin-top: 38px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
`;

export function App() {
  return (
    <Shell>
      <GlobalStyle />
      <Hero aria-labelledby="page-title">
        <div>
          <Eyebrow>Vite app gateway</Eyebrow>
          <Title id="page-title">One deploy, many experiments.</Title>
        </div>
        <NewAppLink href="https://vite.dev/guide/" target="_blank" rel="noreferrer">
          <Plus size={18} />
          Add another
        </NewAppLink>
      </Hero>

      <AppGrid aria-label="Available apps">
        {gatewayApps.map((app, index) => (
          <AppCard
            href={`/${app.id}/`}
            key={app.id}
            style={{ "--accent": app.accent } as React.CSSProperties}
          >
            <AppNumber>{String(index + 1).padStart(2, "0")}</AppNumber>
            <AppIcon aria-hidden="true">
              <Boxes size={24} />
            </AppIcon>
            <AppName>{app.name}</AppName>
            <AppDescription>{app.description}</AppDescription>
            <OpenLink>
              Open
              <ArrowUpRight size={16} />
            </OpenLink>
          </AppCard>
        ))}
      </AppGrid>
    </Shell>
  );
}
