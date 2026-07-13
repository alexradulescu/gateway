import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Button,
  Drawer,
  Input,
  ScrollShadow,
  Spinner,
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

export function GroupDrawer({
  children,
  openedGroup,
}: {
  children: ReactNode;
  openedGroup: OpenedGroup;
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
          <Drawer.Dialog className="things-glass things-glass--drawer things-group-drawer">
            <div ref={setOverlayPortal} className="things-item-overlay-root" />
            <GroupDrawerHeader openedGroup={openedGroup} onClose={close} />
            <Drawer.Body className="things-group-drawer__body">
              <GroupSwitcher currentGroupId={openedGroup.group._id} />
              <section aria-label="Active items" className="things-active-list">
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
              </section>
              <AddGroupItemRow group={openedGroup.group} />
              <DoneSection openedGroup={openedGroup} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
      {children}
    </ItemOverlayPortalProvider>
  );
}

function GroupDrawerHeader({
  openedGroup,
  onClose,
}: {
  openedGroup: OpenedGroup;
  onClose: () => void;
}) {
  const navigate = useNavigate({ from: "/$groupId" });
  const renameGroup = useMutation(api.things.renameGroup);
  const deleteGroup = useMutation(api.things.deleteGroup);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(openedGroup.group.name);
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
    setName(openedGroup.group.name);
    setError("");
    setIsEditing(false);
  }

  async function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renamePendingRef.current) return;
    renamePendingRef.current = true;
    setError("");
    setIsSaving(true);
    try {
      await renameGroup({ groupId: openedGroup.group._id, name });
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
      <button
        className="things-close-button"
        type="button"
        aria-label="Close group"
        disabled={isSaving}
        onClick={onClose}
      >
        <X aria-hidden="true" size={19} />
      </button>
      <div className="things-drawer-title-wrap">
        {isEditing ? (
          <form ref={renameFormRef} onSubmit={submitRename}>
            <TextField
              isInvalid={Boolean(error)}
              isDisabled={isSaving}
              value={name}
              onChange={setName}
            >
              <Input
                ref={renameInputRef}
                aria-label="Group name"
                aria-describedby={error ? errorId : undefined}
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
            {isSaving && <Spinner className="things-inline-spinner" color="accent" size="sm" />}
            {error && (
              <p id={errorId} className="things-field-error" role="alert">
                {error}
              </p>
            )}
          </form>
        ) : (
          <button className="things-drawer-title" type="button" onClick={() => setIsEditing(true)}>
            <Drawer.Heading>{openedGroup.group.name}</Drawer.Heading>
          </button>
        )}
      </div>
      <ConfirmAction
        title={`Delete ${openedGroup.group.name}?`}
        description="The group and all of its items will be removed. This cannot be undone."
        confirmLabel="Delete group"
        trigger={(open) => (
          <Button isIconOnly aria-label="Delete group" variant="danger-soft" onPress={open}>
            <Trash2 aria-hidden="true" size={18} />
          </Button>
        )}
        onConfirm={async () => {
          await deleteGroup({ groupId: openedGroup.group._id });
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
          <ToggleButton
            className="things-group-toggle things-glass--control"
            id={group._id}
            key={group._id}
          >
            {group.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </ScrollShadow>
  );
}
