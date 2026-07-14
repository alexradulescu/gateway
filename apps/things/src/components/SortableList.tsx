import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@heroui/react";
import { errorMessage } from "../context/ThingsDataContext";

export type SortableHandle = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
  isDisabled: boolean;
};

type SortableListProps<Item extends { _id: string }> = {
  items: Item[];
  disabled?: boolean;
  failureMessage: string;
  onReorder: (items: Item[]) => Promise<void>;
  renderItem: (item: Item, handle: SortableHandle) => React.ReactNode;
};

export function SortableList<Item extends { _id: string }>({
  items,
  disabled = false,
  failureMessage,
  onReorder,
  renderItem,
}: SortableListProps<Item>) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // TouchSensor installs the non-passive touchmove listener required by iOS Safari.
    // A short hold avoids accidental reorders while keeping the dedicated handle responsive.
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const displayedItems = isSaving ? orderedItems : items;

  async function handleDragEnd(event: DragEndEvent) {
    if (isSaving || event.over === null || event.active.id === event.over.id) return;

    const fromIndex = displayedItems.findIndex((item) => item._id === event.active.id);
    const toIndex = displayedItems.findIndex((item) => item._id === event.over?.id);
    if (fromIndex < 0 || toIndex < 0) return;

    const previousItems = displayedItems;
    const nextItems = arrayMove(previousItems, fromIndex, toIndex);
    setOrderedItems(nextItems);
    setIsSaving(true);

    try {
      await onReorder(nextItems);
    } catch (error) {
      setOrderedItems(previousItems);
      toast.danger(errorMessage(error, failureMessage));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        items={displayedItems.map((item) => item._id)}
        strategy={verticalListSortingStrategy}
      >
        {displayedItems.map((item) => (
          <SortableEntry
            key={item._id}
            id={item._id}
            disabled={disabled || isSaving}
            render={(handle) => renderItem(item, handle)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableEntry({
  id,
  disabled,
  render,
}: {
  id: string;
  disabled: boolean;
  render: (handle: SortableHandle) => React.ReactNode;
}) {
  const sortable = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    zIndex: sortable.isDragging ? 2 : undefined,
  };

  return (
    <div style={style} data-dragging={sortable.isDragging || undefined}>
      {render({
        attributes: sortable.attributes,
        listeners: sortable.listeners,
        setActivatorNodeRef: sortable.setActivatorNodeRef,
        isDisabled: disabled,
      })}
    </div>
  );
}
