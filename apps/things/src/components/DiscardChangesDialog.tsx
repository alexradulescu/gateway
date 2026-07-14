import { useRef, useState } from "react";
import { AlertDialog, Button } from "@heroui/react";

export function useDiscardGuard({ isBlocked, isDirty }: { isBlocked: boolean; isDirty: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function run(action: () => void) {
    if (isBlocked) return;
    if (!isDirty) {
      action();
      return;
    }

    pendingActionRef.current = action;
    setIsOpen(true);
  }

  function keepEditing() {
    pendingActionRef.current = null;
    setIsOpen(false);
  }

  function discard() {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setIsOpen(false);
    action?.();
  }

  return { discard, isOpen, keepEditing, run };
}

export function DiscardChangesDialog({
  isOpen,
  onDiscard,
  onKeepEditing,
  portalContainer,
}: {
  isOpen: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        className="things-discard-backdrop"
        variant="blur"
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={isOpen}
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        onOpenChange={(open) => !open && onKeepEditing()}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="things-frosted things-confirm-dialog">
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning" />
              <AlertDialog.Heading>Discard changes?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>Your unsaved changes will be lost.</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" onPress={onKeepEditing}>
                Keep editing
              </Button>
              <Button variant="danger" onPress={onDiscard}>
                Discard
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
