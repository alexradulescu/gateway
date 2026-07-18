import { useState } from "react";
import { Button, Disclosure, toast } from "@heroui/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { OpenedGroup } from "../types";
import { ConfirmAction } from "./ConfirmAction";
import { GroupItemRow } from "./GroupItemRow";

export function DoneSection({
  openedGroup,
  onItemPendingChange,
}: {
  openedGroup: OpenedGroup;
  onItemPendingChange: (itemId: string, pending: boolean) => void;
}) {
  const clearCompleted = useMutation(api.things.clearCompletedGroupItems);
  const [isExpanded, setIsExpanded] = useState(false);

  if (openedGroup.completedItems.length === 0) return null;

  return (
    <section className="things-done-section things-item-section">
      <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <div className="things-done-section__header">
          <Disclosure.Heading>
            <Button className="things-done-trigger" slot="trigger" variant="tertiary">
              <Disclosure.Indicator />
              <span>Done ({openedGroup.completedItems.length})</span>
            </Button>
          </Disclosure.Heading>
          <ConfirmAction
            title="Clear completed items?"
            description="Completed items will be removed from this group. This cannot be undone."
            confirmLabel="Clear all"
            trigger={(open) => (
              <Button className="things-clear-all" size="sm" variant="ghost" onPress={open}>
                Clear all
              </Button>
            )}
            onConfirm={async () => {
              await clearCompleted({ groupId: openedGroup.group._id });
            }}
            onError={(message) => toast.danger(message)}
          />
        </div>
        <Disclosure.Content>
          <Disclosure.Body className="things-done-list things-item-group">
            {openedGroup.completedItems.map((item) => (
              <GroupItemRow
                key={item._id}
                groupId={openedGroup.group._id}
                isCompleted
                item={item}
                onPendingChange={onItemPendingChange}
              />
            ))}
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </section>
  );
}
