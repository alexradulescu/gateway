import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  Button,
  ButtonGroup,
  FieldError,
  Switch,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { ArrowLeft, Check, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { cleanVisibleText } from "../../../../convex/thingsDomain";
import { errorMessage } from "../context/ThingsDataContext";
import type { ThingsCatalogueSettingsItem } from "../types";
import { ThingsBusyOverlay } from "./ThingsBusyOverlay";

export function CatalogueSettings() {
  const catalogue = useQuery(api.things.catalogueSettings);
  const navigate = useNavigate({ from: "/settings" });
  const [editingId, setEditingId] = useState<string | null>(null);

  if (catalogue === undefined) {
    return (
      <main className="things-state" aria-busy="true" aria-label="Loading catalogue settings">
        <Spinner color="accent" size="lg" />
        <p>Loading catalogue…</p>
      </main>
    );
  }

  const visibleItems = catalogue.filter((item) => item.isVisible);
  const hiddenItems = catalogue.filter((item) => !item.isVisible);

  return (
    <main className="things-shell things-settings-page">
      <header className="things-header things-settings-header">
        <Button
          isIconOnly
          aria-label="Back to Things"
          className="things-page-icon-button"
          size="lg"
          variant="ghost"
          onPress={() => navigate({ to: "/" })}
        >
          <ArrowLeft aria-hidden="true" size={21} />
        </Button>
        <h1>Catalogue</h1>
        <span aria-hidden="true" className="things-header-spacer" />
      </header>

      <CatalogueSection
        title="Active"
        items={visibleItems}
        editingId={editingId}
        onEditingChange={setEditingId}
      />
      <CatalogueSection
        title="Hidden"
        items={hiddenItems}
        editingId={editingId}
        onEditingChange={setEditingId}
      />
    </main>
  );
}

function CatalogueSection({
  title,
  items,
  editingId,
  onEditingChange,
}: {
  title: string;
  items: ThingsCatalogueSettingsItem[];
  editingId: string | null;
  onEditingChange: (itemId: string | null) => void;
}) {
  return (
    <section className="things-catalogue-section" aria-labelledby={`catalogue-${title}`}>
      <h2 id={`catalogue-${title}`}>
        {title} <span>{items.length}</span>
      </h2>
      <Surface className="things-frosted things-group-surface things-catalogue-surface">
        {items.length === 0 ? (
          <p className="things-empty">No {title.toLocaleLowerCase()} catalogue items.</p>
        ) : (
          items.map((item) => (
            <CatalogueRow
              key={item._id}
              item={item}
              isEditing={editingId === item._id}
              onEdit={() => onEditingChange(item._id)}
              onFinishEditing={() => onEditingChange(null)}
            />
          ))
        )}
      </Surface>
    </section>
  );
}

function CatalogueRow({
  item,
  isEditing,
  onEdit,
  onFinishEditing,
}: {
  item: ThingsCatalogueSettingsItem;
  isEditing: boolean;
  onEdit: () => void;
  onFinishEditing: () => void;
}) {
  const renameItem = useMutation(api.things.renameCatalogueItem);
  const setVisible = useMutation(api.things.setCatalogueItemVisible);
  const [name, setName] = useState(item.canonicalName);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<"rename" | "visibility" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (!isEditing) return;
    setName(item.canonicalName);
    setError("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isEditing, item.canonicalName]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingAction !== null) return;
    if (cleanVisibleText(name) === item.canonicalName) {
      onFinishEditing();
      return;
    }

    setError("");
    setPendingAction("rename");
    try {
      await renameItem({ catalogueItemId: item._id, name });
      toast("Catalogue item renamed");
      onFinishEditing();
    } catch (caught) {
      setError(errorMessage(caught, "Could not rename the catalogue item."));
    } finally {
      setPendingAction(null);
    }
  }

  function cancel() {
    if (pendingAction !== null) return;
    setName(item.canonicalName);
    setError("");
    onFinishEditing();
  }

  async function changeVisibility(visible: boolean) {
    if (pendingAction !== null) return;
    setPendingAction("visibility");
    try {
      await setVisible({ catalogueItemId: item._id, visible });
      toast(visible ? "Catalogue item shown" : "Catalogue item hidden");
    } catch (caught) {
      toast.danger(errorMessage(caught, "Could not update catalogue visibility."));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="things-catalogue-row-wrap">
      {isEditing ? (
        <form
          className="things-catalogue-row things-catalogue-row--editing"
          aria-busy={pendingAction === "rename" || undefined}
          onSubmit={save}
        >
          <TextField
            isDisabled={pendingAction !== null}
            isInvalid={Boolean(error)}
            value={name}
            onChange={setName}
          >
            <Label className="sr-only">Rename {item.canonicalName}</Label>
            <Input
              ref={inputRef}
              aria-describedby={error ? errorId : undefined}
              autoComplete="off"
              name="catalogueItemName"
              variant="secondary"
              onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                cancel();
              }}
            />
            <FieldError id={errorId} className="things-field-error">
              {error}
            </FieldError>
          </TextField>
          <ButtonGroup
            aria-label={`Editing ${item.canonicalName}`}
            className="things-catalogue-edit-actions"
            size="lg"
            variant="secondary"
          >
            <Button
              isIconOnly
              aria-label={`Save ${item.canonicalName}`}
              variant="primary"
              isPending={pendingAction === "rename"}
              isDisabled={pendingAction !== null}
              type="submit"
            >
              <Check aria-hidden="true" size={18} />
            </Button>
            <Button
              isIconOnly
              aria-label={`Cancel editing ${item.canonicalName}`}
              isDisabled={pendingAction !== null}
              type="button"
              onPress={cancel}
            >
              <X aria-hidden="true" size={18} />
            </Button>
          </ButtonGroup>
          <ThingsBusyOverlay isBusy={pendingAction === "rename"} label="Renaming catalogue item" />
        </form>
      ) : (
        <div
          className="things-catalogue-row"
          aria-busy={pendingAction === "visibility" || undefined}
        >
          <Button
            size="lg"
            variant="ghost"
            fullWidth
            className="things-row-main things-catalogue-name"
            type="button"
            onPress={onEdit}
          >
            <span className="things-row-title">{item.canonicalName}</span>
          </Button>
          <Switch
            aria-label={`Show ${item.canonicalName} in suggestions`}
            className="things-catalogue-visibility"
            isDisabled={pendingAction !== null}
            isSelected={item.isVisible}
            onChange={changeVisibility}
          >
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
          <ThingsBusyOverlay
            isBusy={pendingAction === "visibility"}
            label="Updating catalogue visibility"
          />
        </div>
      )}
    </div>
  );
}
