import { Modal } from "@heroui/react";

export function BookSheetFrame({
  title,
  isBusy,
  onRequestClose,
  children,
}: {
  title: string;
  isBusy: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal.Backdrop
      isDismissable={!isBusy}
      isKeyboardDismissDisabled={isBusy}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose();
      }}
      variant="blur"
    >
      <Modal.Container className="bookster-sheet-container" placement="bottom">
        <Modal.Dialog className="bookster-sheet">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
