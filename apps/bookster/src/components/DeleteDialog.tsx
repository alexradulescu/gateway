import { AlertDialog, Button } from "@heroui/react";

export function DeleteDialog({
  isOpen,
  isBusy,
  title,
  children,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isBusy: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Backdrop className="bookster-modal-backdrop" isOpen={isOpen} variant="transparent">
      <AlertDialog.Container>
        <AlertDialog.Dialog className="bookster-confirm-dialog">
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{children}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button isDisabled={isBusy} onPress={onCancel} variant="tertiary">
              Cancel
            </Button>
            <Button isPending={isBusy} onPress={onConfirm} variant="danger">
              {confirmLabel}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
