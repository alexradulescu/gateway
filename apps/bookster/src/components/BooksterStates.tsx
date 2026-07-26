import { AppBody, AppShell } from "@gateway/app-shell";
import { Button, Spinner } from "@heroui/react";
import { Link } from "@tanstack/react-router";

export function BooksterLoadingState() {
  return (
    <AppShell className="bookster-state-shell">
      <AppBody aria-busy="true" aria-label="Loading Bookster" className="bookster-state">
        <Spinner color="accent" size="lg" />
        <p>Opening the library…</p>
      </AppBody>
    </AppShell>
  );
}

export function BooksterErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <AppShell className="bookster-state-shell">
      <AppBody className="bookster-state">
        <p className="bookster-eyebrow">The shelf went quiet</p>
        <h1>Bookster could not reach the library.</h1>
        <p>Check the connection and try again. No changes are queued while offline.</p>
        <Button onPress={onRetry}>Retry</Button>
      </AppBody>
    </AppShell>
  );
}

export function BooksterNotFound() {
  return (
    <AppShell className="bookster-state-shell">
      <AppBody className="bookster-state">
        <p className="bookster-eyebrow">Missing volume</p>
        <h1>This Bookster page does not exist.</h1>
        <Link className="bookster-link-button" to="/">
          Back to Bookster
        </Link>
      </AppBody>
    </AppShell>
  );
}
