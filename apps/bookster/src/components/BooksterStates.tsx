import { Button } from "@heroui/react";
import { Link } from "@tanstack/react-router";

export function BooksterErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="bookster-state">
      <p className="bookster-eyebrow">The shelf went quiet</p>
      <h1>Bookster could not reach the library.</h1>
      <p>Check the connection and try again. No changes are queued while offline.</p>
      <Button onPress={onRetry}>Retry</Button>
    </main>
  );
}

export function BooksterNotFound() {
  return (
    <main className="bookster-state">
      <p className="bookster-eyebrow">Missing volume</p>
      <h1>This Bookster page does not exist.</h1>
      <Link className="bookster-link-button" to="/">
        Back to Bookster
      </Link>
    </main>
  );
}
