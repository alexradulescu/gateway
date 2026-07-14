import { useId, useRef, useState, type FormEvent } from "react";
import { Button, Input, Separator, Spinner, TextField } from "@heroui/react";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { errorMessage } from "../context/ThingsDataContext";
import type { OpenedGroup } from "../types";
import { CatalogueComboBox } from "./CatalogueComboBox";

export function AddGroupItemRow({ group }: { group: OpenedGroup["group"] }) {
  const addItem = useMutation(api.things.addGroupItem);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRef = useRef(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [focusVersion, setFocusVersion] = useState(0);
  const errorId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;

    pendingRef.current = true;
    setError("");
    setIsPending(true);
    try {
      await addItem({ groupId: group._id, name, quantity });
      setName("");
      setQuantity("");
      setFocusVersion((version) => version + 1);
    } catch (caught) {
      setError(errorMessage(caught, "Could not add the item."));
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} className="things-add-item" onSubmit={submit}>
      <CatalogueComboBox
        key={focusVersion}
        shouldFocus={focusVersion > 0}
        errorId={error ? errorId : undefined}
        isDisabled={isPending}
        isInvalid={Boolean(error)}
        label="Item name"
        placeholder="Item name"
        value={name}
        onChange={setName}
        onSubmitRequest={() => formRef.current?.requestSubmit()}
      />
      <Separator className="things-separator" orientation="vertical" />
      <TextField
        aria-label="Quantity"
        className="things-add-item__quantity"
        isDisabled={isPending}
        value={quantity}
        onChange={setQuantity}
      >
        <Input
          aria-label="Quantity"
          placeholder="Qty"
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            formRef.current?.requestSubmit();
          }}
        />
      </TextField>
      <Separator className="things-separator" orientation="vertical" />
      <Button isIconOnly aria-label="Add item" type="submit" isDisabled={isPending}>
        {isPending ? <Spinner color="current" size="sm" /> : <Plus aria-hidden="true" size={19} />}
      </Button>
      {error && (
        <p id={errorId} className="things-field-error things-add-item__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
