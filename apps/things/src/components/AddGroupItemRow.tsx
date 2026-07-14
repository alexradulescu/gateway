import { useId, useRef, useState, type FormEvent } from "react";
import { Button, Input, TextField } from "@heroui/react";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { errorMessage } from "../context/ThingsDataContext";
import type { OpenedGroup } from "../types";
import { CatalogueComboBox } from "./CatalogueComboBox";
import { ThingsBusyOverlay } from "./ThingsBusyOverlay";

export function AddGroupItemRow({
  group,
  name,
  quantity,
  onNameChange,
  onPendingChange,
  onQuantityChange,
}: {
  group: OpenedGroup["group"];
  name: string;
  quantity: string;
  onNameChange: (name: string) => void;
  onPendingChange: (isPending: boolean) => void;
  onQuantityChange: (quantity: string) => void;
}) {
  const addItem = useMutation(api.things.addGroupItem);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRef = useRef(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const errorId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    pendingRef.current = true;
    setError("");
    setIsPending(true);
    onPendingChange(true);
    try {
      await addItem({ groupId: group._id, name, quantity });
      onNameChange("");
      onQuantityChange("");
    } catch (caught) {
      setError(errorMessage(caught, "Could not add the item."));
    } finally {
      pendingRef.current = false;
      setIsPending(false);
      onPendingChange(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="things-add-item"
      aria-busy={isPending || undefined}
      onSubmit={submit}
    >
      <CatalogueComboBox
        errorId={error ? errorId : undefined}
        isDisabled={isPending}
        isInvalid={Boolean(error)}
        label="Item name"
        placeholder="Item name"
        value={name}
        onChange={onNameChange}
        onSubmitRequest={() => formRef.current?.requestSubmit()}
      />
      <TextField
        aria-label="Quantity"
        className="things-add-item__quantity"
        isDisabled={isPending}
        value={quantity}
        onChange={onQuantityChange}
      >
        <Input
          aria-label="Quantity"
          autoComplete="off"
          name="quantity"
          placeholder="Qty"
          variant="secondary"
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            formRef.current?.requestSubmit();
          }}
        />
      </TextField>
      <Button isIconOnly aria-label="Add item" type="submit" isDisabled={isPending}>
        <Plus aria-hidden="true" size={19} />
      </Button>
      <ThingsBusyOverlay isBusy={isPending} label="Adding item" />
      {error && (
        <p id={errorId} className="things-field-error things-add-item__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
