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
import { errorMessage, useThingsData } from "../context/ThingsDataContext";
import { ItemOverlayPortalProvider } from "../context/ItemOverlayPortalContext";
import type { OpenedGroup } from "../types";
import { AddGroupItemRow } from "./AddGroupItemRow";
import { ConfirmAction } from "./ConfirmAction";
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

  function close() {
    navigate({ to: "/" });
  }

  // The drawer is open because its route is matched; navigation is the only source of open state.
  return (
    <ItemOverlayPortalProvider value={overlayPortal}>
      <Drawer.Backdrop
        variant="blur"
        isDismissable={false}
        isOpen
        onOpenChange={(open) => !open && close()}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog
            className="things-frosted things-group-drawer"
            aria-busy={isLoading || undefined}
          >
            <div ref={setOverlayPortal} className="things-item-overlay-root" />
            <GroupDrawerHeader
              key={groupId}
              actionGroupId={!isLoading ? openedGroup?.group._id : undefined}
              groupName={groupName}
              isDisabled={isLoading || openedGroup === null}
              onClose={close}
            />
            <Drawer.Body className="things-group-drawer__body">
              <div className="things-group-drawer__content" inert={isLoading || undefined}>
                <GroupSwitcher currentGroupId={groupId} />
                {openedGroup ? (
                  <>
                    <section aria-label="To do" className="things-item-section">
                      <h3 className="things-item-section__label">To do</h3>
                      <div className="things-item-group things-active-list">
                        {openedGroup.activeItems.length === 0 ? (
                          <p className="things-empty">Nothing active yet.</p>
                        ) : (
                          <SortableList
                            items={openedGroup.activeItems}
                            failureMessage="Could not save the item order."
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
                              />
                            )}
                          />
                        )}
                      </div>
                    </section>
                    <AddGroupItemRow group={openedGroup.group} />
                    <DoneSection openedGroup={openedGroup} />
                  </>
                ) : isLoading ? (
                  <div className="things-drawer-placeholder" aria-hidden="true" />
                ) : (
                  <p className="things-drawer-message">That group does not exist.</p>
                )}
              </div>
              <ThingsBusyOverlay isBusy={isLoading} label={`Opening ${groupName}`} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
      {children}
    </ItemOverlayPortalProvider>
  );
}

function GroupDrawerHeader({
  actionGroupId,
  groupName,
  isDisabled,
  onClose,
}: {
  actionGroupId?: OpenedGroup["group"]["_id"];
  groupName: string;
  isDisabled: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate({ from: "/$groupId" });
  const renameGroup = useMutation(api.things.renameGroup);
  const deleteGroup = useMutation(api.things.deleteGroup);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(groupName);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const errorId = useId();
  const renameFormRef = useRef<HTMLFormElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renamePendingRef = useRef(false);

  useEffect(() => {
    if (isEditing) renameInputRef.current?.focus();
  }, [isEditing]);

  function cancelRename() {
    if (isSaving) return;
    setName(groupName);
    setError("");
    setIsEditing(false);
  }

  async function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renamePendingRef.current || !actionGroupId) return;
    renamePendingRef.current = true;
    setError("");
    setIsSaving(true);
    try {
      await renameGroup({ groupId: actionGroupId, name });
      setIsEditing(false);
    } catch (caught) {
      setError(errorMessage(caught, "Could not rename the group."));
    } finally {
      renamePendingRef.current = false;
      setIsSaving(false);
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
        isDisabled={isSaving}
        onPress={onClose}
      >
        <X aria-hidden="true" size={19} />
      </Button>
      <div className="things-drawer-title-wrap">
        {isEditing ? (
          <form ref={renameFormRef} aria-busy={isSaving || undefined} onSubmit={submitRename}>
            <TextField
              aria-label="Group name"
              isInvalid={Boolean(error)}
              isDisabled={isSaving}
              value={name}
              onChange={setName}
            >
              <Input
                ref={renameInputRef}
                aria-label="Group name"
                aria-describedby={error ? errorId : undefined}
                variant="secondary"
                onBlur={cancelRename}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    cancelRename();
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
            onClick={() => setIsEditing(true)}
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

function GroupSwitcher({ currentGroupId }: { currentGroupId: string }) {
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
          navigate({ to: "/$groupId", params: { groupId: nextGroupId }, replace: true });
          scrollRef.current?.scrollTo({ left: 0, top: 0 });
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
