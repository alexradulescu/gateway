import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Surface, Stack, TopBar, Button } from "@gateway/ui";
import "@gateway/ui/styles.css";
import "./showcase.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Surface className="showcase">
      <TopBar title="UI Library" large subtitle="Familiar patterns. Composed your way." />
      <Stack>
        <Button>Continue</Button>
        <Button variant="secondary">Secondary</Button>
      </Stack>
    </Surface>
  </StrictMode>,
);
