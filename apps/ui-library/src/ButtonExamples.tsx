import { useState } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { Button, IconButton, Stack } from "@gateway/ui";

import { Specimen, SectionTitle } from "./Specimen";
export function ButtonExamples({
  setStatus,
  onShowComposition,
}: {
  setStatus: (message: string) => void;
  onShowComposition: () => void;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <section id="buttons">
      <SectionTitle index="03 / ACTION" title="An obvious next step">
        A small set of actions with a clear hierarchy.
      </SectionTitle>
      <Specimen
        number="07"
        title="Buttons & icon buttons"
        description="44px targets. Subtle press feedback. Native disabled state."
        code={
          '<Button onClick={save}>Save changes</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="plain">Learn more</Button>\n<Button variant="danger">Delete</Button>\n<IconButton aria-label="Add"><Plus /></IconButton>'
        }
      >
        <Stack gap={16}>
          <Stack direction="horizontal" wrap gap={12}>
            <Button
              onClick={() => {
                setSaved(!saved);
                setStatus(saved ? "Save state reset." : "Changes saved in this demo.");
              }}
            >
              {saved ? <Check size={17} /> : <Plus size={17} />}
              {saved ? "Saved" : "Save changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSaved(false);
                setStatus("Changes canceled.");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="plain"
              onClick={() => {
                onShowComposition();
                setStatus("Component API is now displayed.");
              }}
            >
              View API <ArrowUpRight size={16} />
            </Button>
          </Stack>
          <Stack direction="horizontal" wrap gap={12}>
            <Button
              variant="danger"
              onClick={() => setStatus("Delete action previewed. No records were changed.")}
            >
              Delete
            </Button>
            <Button disabled>Unavailable</Button>
            <IconButton aria-label="Add item" onClick={() => setStatus("Add item pressed.")}>
              <Plus size={21} />
            </IconButton>
            <IconButton aria-label="Disabled add item" disabled>
              <Plus size={21} />
            </IconButton>
          </Stack>
        </Stack>
      </Specimen>
    </section>
  );
}
