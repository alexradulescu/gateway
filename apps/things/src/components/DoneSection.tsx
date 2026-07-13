import { useState } from "react";
import { Button, Disclosure, toast } from "@heroui/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { OpenedGroup } from "../types";
import { ConfirmAction } from "./ConfirmAction";
import { GroupItemRow } from "./GroupItemRow";

export function DoneSection({ openedGroup }: { openedGroup: OpenedGroup }) {
  const clearCompleted = useMutation(api.things.clearCompletedGroupItems);
  const [isExpanded, setIsExpanded] = useState(true);

  if (openedGroup.completedItems.length === 0) return null;

  return (
    <section className="things-done-section">
      <div className="things-done-section__header">
        <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
          <Disclosure.Heading>
            <Button className="things-done-trigger" slot="trigger" variant="tertiary">
              Done ({openedGroup.completedItems.length})
              <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="things-done-list">
              {openedGroup.completedItems.map((item) => (
                <GroupItemRow
                  key={item._id}
                  groupId={openedGroup.group._id}
                  isCompleted
                  item={item}
                />
              ))}
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
        <ConfirmAction
          title="Clear completed items?"
          description="Completed items will be removed from this group. This cannot be undone."
          confirmLabel="Clear all"
          trigger={(open) => (
            <Button size="sm" variant="danger-soft" onPress={open}>
              Clear all
            </Button>
          )}
          onConfirm={async () => {
            await clearCompleted({ groupId: openedGroup.group._id });
          }}
          onError={(message) => toast.danger(message)}
        />
      </div>
    </section>
  );
}
