import { useState } from "react";
import { AlertDialog, Button, Spinner } from "@heroui/react";
import { errorMessage } from "../context/ThingsDataContext";

type ConfirmActionProps = {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onError?: (message: string) => void;
};

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  onError,
}: ConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function confirm() {
    setIsPending(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      onError?.(errorMessage(error, "The action could not be completed."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog>
      <span className="things-confirm-trigger">{trigger(() => setIsOpen(true))}</span>
      <AlertDialog.Backdrop
        variant="blur"
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={isPending ? undefined : setIsOpen}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="things-frosted things-confirm-dialog">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{description}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" isDisabled={isPending} onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" isDisabled={isPending} onPress={confirm}>
                {isPending ? <Spinner color="current" size="sm" /> : confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
