import { Spinner } from "@heroui/react";

export function ThingsBusyOverlay({
  isBusy,
  label = "Working",
}: {
  isBusy: boolean;
  label?: string;
}) {
  if (!isBusy) return null;

  return (
    <output className="things-busy-overlay" aria-label={label}>
      <span className="things-busy-overlay__indicator">
        <Spinner color="accent" size="sm" />
      </span>
    </output>
  );
}
