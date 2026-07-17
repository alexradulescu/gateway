import { AlertDialog, Button } from "@heroui/react";

export function DiscardDialog({
  isOpen,
  onCancel,
  onDiscard,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}) {
  return (
    <AlertDialog.Backdrop isOpen={isOpen} variant="blur">
      <AlertDialog.Container>
        <AlertDialog.Dialog className="bookster-confirm-dialog">
          <AlertDialog.Header>
            <AlertDialog.Icon status="warning" />
            <AlertDialog.Heading>Discard your changes?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>Your unsaved edits will be lost.</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button onPress={onCancel} variant="tertiary">
              Keep editing
            </Button>
            <Button onPress={onDiscard} variant="danger">
              Discard
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
