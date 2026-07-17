import { AlertDialog, Button } from "@heroui/react";

export function DiscardDialog({
  isOpen,
  isDiscardDisabled = false,
  title = "Discard your changes?",
  description = "Your unsaved edits will be lost.",
  onCancel,
  onDiscard,
}: {
  isOpen: boolean;
  isDiscardDisabled?: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onDiscard: () => void;
}) {
  return (
    <AlertDialog.Backdrop className="bookster-modal-backdrop" isOpen={isOpen} variant="transparent">
      <AlertDialog.Container>
        <AlertDialog.Dialog className="bookster-confirm-dialog">
          <AlertDialog.Header>
            <AlertDialog.Icon status="warning" />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{description}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button onPress={onCancel} variant="tertiary">
              Keep editing
            </Button>
            <Button isDisabled={isDiscardDisabled} onPress={onDiscard} variant="danger">
              Discard
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
