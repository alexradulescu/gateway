import { Modal } from "@heroui/react";

export function BookSheetFrame({
  title,
  hideTitle = false,
  isBusy,
  onRequestClose,
  children,
}: {
  title: string;
  hideTitle?: boolean;
  isBusy: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal.Backdrop
      className="bookster-modal-backdrop"
      isDismissable={!isBusy}
      isKeyboardDismissDisabled={isBusy}
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose();
      }}
      variant="transparent"
    >
      <Modal.Container className="bookster-sheet-container" placement="bottom">
        <Modal.Dialog className="bookster-sheet">
          <Modal.CloseTrigger />
          <Modal.Header className={hideTitle ? "bookster-sheet-header--custom" : undefined}>
            <Modal.Heading className={hideTitle ? "sr-only" : undefined}>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
