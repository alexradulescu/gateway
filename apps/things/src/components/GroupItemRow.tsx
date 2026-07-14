import { useState } from "react";
import { Checkbox, toast } from "@heroui/react";
import { GripVertical } from "lucide-react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { errorMessage } from "../context/ThingsDataContext";
import type { ThingsGroupItem } from "../types";
import type { SortableHandle } from "./SortableList";
import { ThingsBusyOverlay } from "./ThingsBusyOverlay";

type GroupItemRowProps = {
  item: ThingsGroupItem;
  groupId: string;
  isCompleted: boolean;
  handle?: SortableHandle;
};

export function GroupItemRow({ item, groupId, isCompleted, handle }: GroupItemRowProps) {
  const navigate = useNavigate({ from: "/$groupId" });
  const setCompleted = useMutation(api.things.setGroupItemCompleted);
  const [isPending, setIsPending] = useState(false);

  async function toggleCompletion(completed: boolean) {
    if (isPending) return;
    setIsPending(true);
    try {
      await setCompleted({ itemId: item._id, completed });
    } catch (error) {
      toast.danger(errorMessage(error, "Could not update the item."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className="things-item-row"
      data-completed={isCompleted || undefined}
      data-pending={isPending || undefined}
      aria-busy={isPending || undefined}
    >
      <Checkbox
        aria-label={
          isCompleted ? `Reactivate ${item.canonicalName}` : `Complete ${item.canonicalName}`
        }
        className="things-item-checkbox"
        isDisabled={isPending}
        isSelected={isCompleted}
        onChange={toggleCompletion}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox.Content>
      </Checkbox>
      <button
        className="things-row-main things-item-row__main"
        type="button"
        onClick={() =>
          navigate({
            to: "/$groupId/$itemId",
            params: { groupId, itemId: item._id },
          })
        }
      >
        <span className="things-row-title things-item-label">
          {item.canonicalName}
          {item.quantity ? <span className="things-item-quantity"> × {item.quantity}</span> : null}
        </span>
      </button>
      {handle && (
        <button
          {...handle.attributes}
          {...handle.listeners}
          ref={handle.setActivatorNodeRef}
          className="things-drag-handle"
          type="button"
          aria-label={`Reorder ${item.canonicalName}`}
          disabled={handle.isDisabled}
        >
          <GripVertical aria-hidden="true" size={18} />
        </button>
      )}
      <ThingsBusyOverlay isBusy={isPending} label="Updating item" />
    </div>
  );
}
