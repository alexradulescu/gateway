import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button, Input, Label, Spinner, TextField } from "@heroui/react";
import { FocusScope } from "react-aria";
import { Trash2, X } from "lucide-react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { cleanVisibleText } from "../../../../convex/thingsDomain";
import { errorMessage, useThingsData } from "../context/ThingsDataContext";
import { useOpenedGroup } from "../context/OpenedGroupContext";
import { useItemOverlayPortal } from "../context/ItemOverlayPortalContext";
import { CatalogueComboBox } from "./CatalogueComboBox";
import { ThingsNotFound } from "./ThingsStates";

export function ItemDetailModal({ groupId, itemId }: { groupId: string; itemId: string }) {
  const openedGroup = useOpenedGroup();
  const item = [...openedGroup.activeItems, ...openedGroup.completedItems].find(
    (candidate) => candidate._id === itemId,
  );

  if (!item) {
    return (
      <div className="things-full-page-layer">
        <ThingsNotFound message="That item does not exist." />
      </div>
    );
  }

  return <ItemDetailForm key={item._id} groupId={groupId} item={item} />;
}

function ItemDetailForm({
  groupId,
  item,
}: {
  groupId: string;
  item: ReturnType<typeof useOpenedGroup>["activeItems"][number];
}) {
  const navigate = useNavigate({ from: "/$groupId/$itemId" });
  const updateItem = useMutation(api.things.updateGroupItem);
  const deleteItem = useMutation(api.things.deleteGroupItem);
  const { showDeleteUndo } = useThingsData();
  const overlayPortal = useItemOverlayPortal();
  const [name, setName] = useState(item.canonicalName);
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const isDirty =
    cleanVisibleText(name) !== item.canonicalName || cleanVisibleText(quantity) !== item.quantity;
  const isPending = pendingAction !== null;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function close() {
    if (isPending) return;
    void navigate({ to: "/$groupId", params: { groupId } });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty || isPending) return;

    setError("");
    setPendingAction("save");
    try {
      await updateItem({ itemId: item._id, name, quantity });
      await navigate({ to: "/$groupId", params: { groupId } });
    } catch (caught) {
      setError(errorMessage(caught, "Could not save the item."));
      setPendingAction(null);
    }
  }

  async function remove() {
    if (isPending) return;

    setError("");
    setPendingAction("delete");
    try {
      await deleteItem({ itemId: item._id });
      await navigate({ to: "/$groupId", params: { groupId } });
      requestAnimationFrame(() => showDeleteUndo(item));
    } catch (caught) {
      setError(errorMessage(caught, "Could not delete the item."));
      setPendingAction(null);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    if (!event.defaultPrevented) close();
  }

  if (!overlayPortal) return null;

  // The parent Drawer owns the modal focus scope. A second modal would inert that parent,
  // so this route dialog stays inside the Drawer and reuses its focus and scroll locking.
  return createPortal(
    <FocusScope contain restoreFocus>
      <div className="things-item-overlay">
        <dialog
          open
          className="things-glass things-glass--drawer things-item-modal"
          aria-labelledby="things-item-dialog-title"
          aria-modal="true"
          onKeyDown={handleKeyDown}
        >
          <header className="things-drawer-header">
            <button
              ref={closeButtonRef}
              className="things-close-button"
              type="button"
              aria-label="Close item"
              disabled={isPending}
              onClick={close}
            >
              <X aria-hidden="true" size={19} />
            </button>
            <h2 id="things-item-dialog-title">Edit item</h2>
            <span aria-hidden="true" className="things-header-spacer" />
          </header>
          <form ref={formRef} onSubmit={save}>
            <div className="things-item-form">
              <div className="things-item-form__field">
                <Label>Item name</Label>
                <CatalogueComboBox
                  errorId={error ? errorId : undefined}
                  isDisabled={isPending}
                  isInvalid={Boolean(error)}
                  label="Item name"
                  value={name}
                  onChange={setName}
                  onSubmitRequest={() => formRef.current?.requestSubmit()}
                />
              </div>
              <TextField isDisabled={isPending} value={quantity} onChange={setQuantity}>
                <Label>Quantity</Label>
                <Input
                  aria-label="Quantity"
                  aria-describedby={error ? errorId : undefined}
                  placeholder="Optional"
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }}
                />
              </TextField>
              {error && (
                <p id={errorId} className="things-field-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="things-item-form__actions">
              <Button
                className="things-delete-item"
                type="button"
                variant="danger"
                isDisabled={isPending}
                onPress={remove}
              >
                {pendingAction === "delete" ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <Trash2 aria-hidden="true" size={18} />
                )}
                Delete item
              </Button>
              <Button type="submit" variant="primary" isDisabled={!isDirty || isPending}>
                {pendingAction === "save" ? <Spinner color="current" size="sm" /> : "Save"}
              </Button>
            </div>
          </form>
        </dialog>
      </div>
    </FocusScope>,
    overlayPortal,
  );
}
