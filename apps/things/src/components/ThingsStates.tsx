import { Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";

export function ThingsNotFound({ message = "That Things page no longer exists." }) {
  return (
    <main className="things-state">
      <p className="things-state__eyebrow">404</p>
      <h1>Nothing here</h1>
      <p>{message}</p>
      <BackToThingsButton />
    </main>
  );
}

export function ThingsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="things-state">
      <p className="things-state__eyebrow">Something went wrong</p>
      <h1>Things could not load</h1>
      <p>Check the connection and try again.</p>
      <div className="things-state__actions">
        <Button variant="primary" onPress={onRetry}>
          Retry
        </Button>
        <BackToThingsButton variant="secondary" />
      </div>
    </main>
  );
}

function BackToThingsButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const navigate = useNavigate();
  return (
    <Button variant={variant} onPress={() => navigate({ to: "/" })}>
      Back to Things
    </Button>
  );
}
