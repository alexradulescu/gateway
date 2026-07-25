import { Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";

export function ThingsHomeHeader() {
  const navigate = useNavigate({ from: "/" });

  return (
    <header className="things-header things-home-header">
      <h1>Things</h1>
      <Button
        isIconOnly
        aria-label="Open catalogue settings"
        className="things-page-icon-button"
        size="sm"
        variant="ghost"
        onPress={() => navigate({ to: "/settings" })}
      >
        <Settings aria-hidden="true" size={20} />
      </Button>
    </header>
  );
}

export function CatalogueSettingsHeader() {
  const navigate = useNavigate({ from: "/settings" });

  return (
    <header className="things-header things-settings-header">
      <Button
        isIconOnly
        aria-label="Back to Things"
        className="things-page-icon-button"
        size="sm"
        variant="ghost"
        onPress={() => navigate({ to: "/" })}
      >
        <ArrowLeft aria-hidden="true" size={21} />
      </Button>
      <h1>Catalogue</h1>
      <span aria-hidden="true" className="things-header-spacer" />
    </header>
  );
}
