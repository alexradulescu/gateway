import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Button,
  Drawer,
  Input,
  ScrollShadow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  toast,
} from "@heroui/react";
import { Trash2, X } from "lucide-react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import { cleanVisibleText } from "../../../../convex/thingsDomain";
import { errorMessage, useThingsData } from "../context/ThingsDataContext";
import { ItemOverlayPortalProvider } from "../context/ItemOverlayPortalContext";
import type { OpenedGroup } from "../types";
import { AddGroupItemRow } from "./AddGroupItemRow";
import { ConfirmAction } from "./ConfirmAction";
import { DiscardChangesDialog, useDiscardGuard } from "./DiscardChangesDialog";
import { DoneSection } from "./DoneSection";
import { GroupItemRow } from "./GroupItemRow";
import { SortableList } from "./SortableList";
import { ThingsBusyOverlay } from "./ThingsBusyOverlay";

export function GroupDrawer({
  children,
  groupId,
  groupName,
  isLoading,
  openedGroup,
}: {
  children: ReactNode;
  groupId: string;
  groupName: string;
  isLoading: boolean;
  openedGroup: OpenedGroup | null;
}) {
  const navigate = useNavigate({ from: "/$groupId" });
  const reorderItems = useMutation(api.things.reorderGroupItems);
  const [overlayPortal, setOverlayPortal] = useState<HTMLElement | null>(null);
  const [renameName, setRenameName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isRenamePending, setRenamePending] = useState(false);
  const [addItemName, setAddItemName] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState("");
  const [isAddItemPending, setAddItemPending] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(new Set());
  const [isReordering, setIsReordering] = useState(false);
  const [isItemOverlayOpen, setItemOverlayOpen] = useState(false);
  const isDirty =
    (isRenaming && cleanVisibleText(renameName) !== groupName) ||
    addItemName.length > 0 ||
    addItemQuantity.length > 0;
  const isPending =
    isLoading || isRenamePending || isAddItemPending || isReordering || pendingItemIds.size > 0;
  const discardGuard = useDiscardGuard({
    isBlocked: isPending || isItemOverlayOpen,
    isDirty,
  });

  function runOrConfirmDiscard(action: () => void) {
    discardGuard.run(() => {
      setIsRenaming(false);
      setRenamePending(false);
      setAddItemName("");
      setAddItemQuantity("");
      setAddItemPending(false);
      action();
    });
  }

  function requestClose() {
    runOrConfirmDiscard(() => void navigate({ to: "/" }));
  }

  function setItemPending(itemId: string, pending: boolean) {
    setPendingItemIds((current) => {
      const next = new Set(current);
      if (pending) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  // The drawer is open because its route is matched; navigation is the only source of open state.
  return (
    <ItemOverlayPortalProvider value={{ portal: overlayPortal, setItemOverlayOpen }}>
      <Drawer.Backdrop
        variant="blur"
        isDismissable={!isPending && !isItemOverlayOpen && !discardGuard.isOpen}
        isKeyboardDismissDisabled={isPending || isItemOverlayOpen || discardGuard.isOpen}
        isOpen
        onOpenChange={(open) => !open && requestClose()}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog
            className="things-frosted things-group-drawer"
            aria-busy={isLoading || undefined}
          >
            <GroupDrawerHeader
              key={groupId}
              actionGroupId={!isLoading ? openedGroup?.group._id : undefined}
              groupName={groupName}
              isDisabled={isLoading}
              isCloseDisabled={isPending || isItemOverlayOpen}
              isEditing={isRenaming}
              name={renameName}
              onClose={requestClose}
              onEditingChange={setIsRenaming}
              onNameChange={setRenameName}
              onPendingChange={setRenamePending}
            />
            <Drawer.Body className="things-group-drawer__body">
              <div className="things-group-drawer__content" inert={isLoading || undefined}>
                <GroupSwitcher currentGroupId={groupId} runOrConfirmDiscard={runOrConfirmDiscard} />
                {openedGroup ? (
                  <>
                    <section aria-label="To do" className="things-item-section">
                      <h3 className="things-item-section__label">To do</h3>
                      <div className="things-item-group things-active-list">
                        <AddGroupItemRow
                          group={openedGroup.group}
                          name={addItemName}
                          quantity={addItemQuantity}
                          onNameChange={setAddItemName}
                          onPendingChange={setAddItemPending}
                          onQuantityChange={setAddItemQuantity}
                        />
                        {openedGroup.activeItems.length === 0 ? (
                          <p className="things-empty">Nothing active yet.</p>
                        ) : (
                          <SortableList
                            items={openedGroup.activeItems}
                            failureMessage="Could not save the item order."
                            onPendingChange={setIsReordering}
                            onReorder={async (items) => {
                              await reorderItems({
                                groupId: openedGroup.group._id,
                                itemIds: items.map((item) => item._id),
                              });
                            }}
                            renderItem={(item, handle) => (
                              <GroupItemRow
                                groupId={openedGroup.group._id}
                                handle={handle}
                                isCompleted={false}
                                item={item}
                                onPendingChange={setItemPending}
                              />
                            )}
                          />
                        )}
                      </div>
                    </section>
                    <DoneSection
                      key={openedGroup.group._id}
                      openedGroup={openedGroup}
                      onItemPendingChange={setItemPending}
                    />
                  </>
                ) : (
                  <div className="things-drawer-placeholder" aria-hidden="true" />
                )}
              </div>
              <ThingsBusyOverlay isBusy={isLoading} label={`Opening ${groupName}`} />
            </Drawer.Body>
          </Drawer.Dialog>
          <div ref={setOverlayPortal} className="things-item-overlay-root" />
        </Drawer.Content>
      </Drawer.Backdrop>
      {children}
      <DiscardChangesDialog
        isOpen={discardGuard.isOpen}
        onDiscard={discardGuard.discard}
        onKeepEditing={discardGuard.keepEditing}
      />
    </ItemOverlayPortalProvider>
  );
}

function GroupDrawerHeader({
  actionGroupId,
  groupName,
  isDisabled,
  isCloseDisabled,
  isEditing,
  name,
  onClose,
  onEditingChange,
  onNameChange,
  onPendingChange,
}: {
  actionGroupId?: OpenedGroup["group"]["_id"];
  groupName: string;
  isDisabled: boolean;
  isCloseDisabled: boolean;
  isEditing: boolean;
  name: string;
  onClose: () => void;
  onEditingChange: (isEditing: boolean) => void;
  onNameChange: (name: string) => void;
  onPendingChange: (isPending: boolean) => void;
}) {
  const navigate = useNavigate({ from: "/$groupId" });
  const renameGroup = useMutation(api.things.renameGroup);
  const deleteGroup = useMutation(api.things.deleteGroup);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const errorId = useId();
  const renameFormRef = useRef<HTMLFormElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renamePendingRef = useRef(false);
  const isDirty = isEditing && cleanVisibleText(name) !== groupName;

  useEffect(() => {
    if (isEditing) renameInputRef.current?.focus();
  }, [isEditing]);

  function cancelRename() {
    if (isSaving) return;
    onNameChange(groupName);
    setError("");
    onEditingChange(false);
  }

  async function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renamePendingRef.current || !actionGroupId) return;
    renamePendingRef.current = true;
    setError("");
    setIsSaving(true);
    onPendingChange(true);
    try {
      await renameGroup({ groupId: actionGroupId, name });
      onEditingChange(false);
    } catch (caught) {
      setError(errorMessage(caught, "Could not rename the group."));
    } finally {
      renamePendingRef.current = false;
      setIsSaving(false);
      onPendingChange(false);
    }
  }

  return (
    <Drawer.Header className="things-drawer-header">
      <Button
        isIconOnly
        className="things-close-button"
        size="sm"
        variant="ghost"
        aria-label="Close group"
        isDisabled={isCloseDisabled}
        onPress={onClose}
      >
        <X aria-hidden="true" size={22} />
      </Button>
      <div className="things-drawer-title-wrap">
        {isEditing ? (
          <form ref={renameFormRef} aria-busy={isSaving || undefined} onSubmit={submitRename}>
            <TextField
              aria-label="Group name"
              isInvalid={Boolean(error)}
              isDisabled={isSaving}
              value={name}
              onChange={onNameChange}
            >
              <Input
                ref={renameInputRef}
                aria-label="Group name"
                aria-describedby={error ? errorId : undefined}
                autoComplete="off"
                name="groupName"
                variant="secondary"
                onBlur={() => {
                  if (!isDirty) cancelRename();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (isDirty) onClose();
                    else cancelRename();
                    return;
                  }
                  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                  event.preventDefault();
                  renameFormRef.current?.requestSubmit();
                }}
              />
            </TextField>
            <ThingsBusyOverlay isBusy={isSaving} label="Renaming group" />
            {error && (
              <p id={errorId} className="things-field-error" role="alert">
                {error}
              </p>
            )}
          </form>
        ) : (
          <button
            className="things-drawer-title"
            type="button"
            disabled={isDisabled}
            onClick={() => {
              onNameChange(groupName);
              onEditingChange(true);
            }}
          >
            <Drawer.Heading>{groupName}</Drawer.Heading>
          </button>
        )}
      </div>
      <ConfirmAction
        title={`Delete ${groupName}?`}
        description="The group and all of its items will be removed. This cannot be undone."
        confirmLabel="Delete group"
        trigger={(open) => (
          <Button
            isIconOnly
            aria-label="Delete group"
            className="things-delete-group-button"
            isDisabled={isDisabled}
            size="sm"
            variant="ghost"
            onPress={open}
          >
            <Trash2 aria-hidden="true" size={18} />
          </Button>
        )}
        onConfirm={async () => {
          if (!actionGroupId) return;
          await deleteGroup({ groupId: actionGroupId });
          await navigate({ to: "/" });
        }}
        onError={(message) => toast.danger(message)}
      />
    </Drawer.Header>
  );
}

function GroupSwitcher({
  currentGroupId,
  runOrConfirmDiscard,
}: {
  currentGroupId: string;
  runOrConfirmDiscard: (action: () => void) => void;
}) {
  const { home } = useThingsData();
  const navigate = useNavigate({ from: "/$groupId" });
  const scrollRef = useRef<HTMLDivElement>(null);

  if (home.groups.length < 2) return null;

  return (
    <ScrollShadow ref={scrollRef} className="things-group-switcher" orientation="horizontal">
      <ToggleButtonGroup
        className="things-group-chips"
        isDetached
        disallowEmptySelection
        selectedKeys={new Set([currentGroupId])}
        selectionMode="single"
        size="sm"
        onSelectionChange={(keys) => {
          const nextGroupId = [...keys][0];
          if (typeof nextGroupId !== "string" || nextGroupId === currentGroupId) return;
          runOrConfirmDiscard(() => {
            void navigate({
              to: "/$groupId",
              params: { groupId: nextGroupId },
              replace: true,
            });
            scrollRef.current?.scrollTo({ left: 0, top: 0 });
          });
        }}
      >
        {home.groups.map((group) => (
          <ToggleButton className="things-group-toggle" id={group._id} key={group._id}>
            {group.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </ScrollShadow>
  );
}
