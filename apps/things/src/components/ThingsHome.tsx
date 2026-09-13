import { useId, useRef, useState, type FormEvent } from "react";
import { Button, FieldError, Input, Label, Surface, TextField } from "@heroui/react";
import { GripVertical, Plus, Settings } from "lucide-react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { errorMessage, useThingsData } from "../context/ThingsDataContext";
import type { ThingsGroupSummary } from "../types";
import { SortableList, type SortableHandle } from "./SortableList";
import { ThingsBusyOverlay } from "./ThingsBusyOverlay";

export function ThingsHome() {
  const { home } = useThingsData();
  const reorderGroups = useMutation(api.things.reorderGroups);
  const navigate = useNavigate({ from: "/" });

  return (
    <main className="things-shell">
      <header className="things-header things-home-header">
        <h1>Things</h1>
        <Button
          isIconOnly
          aria-label="Open catalogue settings"
          className="things-page-icon-button"
          size="lg"
          variant="ghost"
          onPress={() => navigate({ to: "/settings" })}
        >
          <Settings aria-hidden="true" size={20} />
        </Button>
      </header>

      <Surface className="things-frosted things-group-surface things-home-groups">
        {home.groups.length === 0 ? (
          <p className="things-empty">Add your first household list below.</p>
        ) : (
          <SortableList
            items={home.groups}
            failureMessage="Could not save the group order."
            onReorder={async (groups) => {
              await reorderGroups({ groupIds: groups.map((group) => group._id) });
            }}
            renderItem={(group, handle) => <GroupRow group={group} handle={handle} />}
          />
        )}
        <AddGroupRow />
      </Surface>
    </main>
  );
}

function GroupRow({ group, handle }: { group: ThingsGroupSummary; handle: SortableHandle }) {
  const { home } = useThingsData();
  const navigate = useNavigate({ from: "/" });
  const order = home.groups.findIndex((candidate) => candidate._id === group._id) + 1;
  const counts = [
    group.activeCount > 0 ? `${group.activeCount} active` : "",
    group.completedCount > 0 ? `${group.completedCount} completed` : "",
  ].filter(Boolean);

  return (
    <div className="things-group-row">
      <span className="things-order" aria-hidden="true">
        {String(order).padStart(2, "0")}
      </span>
      <Button
        size="lg"
        variant="ghost"
        fullWidth
        className="things-row-main things-group-main"
        type="button"
        onPress={() => navigate({ to: "/$groupId", params: { groupId: group._id } })}
      >
        <span className="things-row-title">{group.name}</span>
        {counts.length > 0 && <span className="things-row-meta">{counts.join(" · ")}</span>}
      </Button>
      <Button
        {...handle.attributes}
        {...handle.listeners}
        ref={handle.setActivatorNodeRef}
        isIconOnly
        size="lg"
        variant="ghost"
        className="things-drag-handle"
        type="button"
        aria-label={`Reorder ${group.name}`}
        isDisabled={handle.isDisabled}
      >
        <GripVertical aria-hidden="true" size={18} />
      </Button>
    </div>
  );
}

function AddGroupRow() {
  const createGroup = useMutation(api.things.createGroup);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const errorId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    pendingRef.current = true;
    setError("");
    setIsPending(true);
    try {
      await createGroup({ name });
      setName("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (caught) {
      setError(errorMessage(caught, "Could not create the group."));
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="things-add-group"
      aria-busy={isPending || undefined}
      onSubmit={submit}
    >
      <div className="things-add-group__controls">
        <TextField
          className="things-add-group__field"
          isInvalid={Boolean(error)}
          isDisabled={isPending}
          value={name}
          onChange={setName}
        >
          <Label className="sr-only">Group name</Label>
          <Input
            ref={inputRef}
            aria-describedby={error ? errorId : undefined}
            autoComplete="off"
            name="groupName"
            placeholder="Group name"
            variant="secondary"
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              formRef.current?.requestSubmit();
            }}
          />
          <FieldError id={errorId} className="things-field-error">
            {error}
          </FieldError>
        </TextField>
        <Button
          isIconOnly
          size="md"
          variant="primary"
          aria-label="Add group"
          type="submit"
          isPending={isPending}
        >
          <span className="things-add-action-disc">
            <Plus aria-hidden="true" size={17} />
          </span>
        </Button>
      </div>
      <ThingsBusyOverlay isBusy={isPending} label="Adding group" />
    </form>
  );
}
