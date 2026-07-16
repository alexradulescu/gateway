import {
  AlertDialog,
  Button,
  Input,
  Label,
  ListBox,
  Select,
  Tabs,
  TextField,
  toast,
  type Key,
} from "@heroui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft, Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { findDuplicateGroups } from "../domain";
import { useBookster } from "../context/useBookster";
import { booksterErrorMessage } from "../errors";
import type {
  BooksterBook,
  BooksterCategory,
  BooksterCategoryId,
  BooksterLocation,
  BooksterLocationId,
  BooksterSettingsTab,
  BooksterSortOrder,
  BooksterTheme,
} from "../types";

const tabLabels: Record<BooksterSettingsTab, string> = {
  config: "Config",
  categories: "Categories",
  locations: "Locations",
  duplicates: "Duplicates",
};
const duplicateDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function SettingsPage({ tab }: { tab: BooksterSettingsTab }) {
  const navigate = useNavigate({ from: "/settings/$tab" });
  return (
    <main className="bookster-settings">
      <header className="bookster-settings-header">
        <div className="bookster-glass bookster-settings-title">
          <Link aria-label="Back to books" className="bookster-icon-link" to="/">
            <ArrowLeft aria-hidden="true" size={18} />
          </Link>
          <h1>Settings</h1>
        </div>
        <Tabs
          className="bookster-settings-tabs"
          selectedKey={tab}
          onSelectionChange={(key) =>
            void navigate({ to: "/settings/$tab", params: { tab: String(key) }, replace: true })
          }
        >
          <Tabs.ListContainer className="bookster-glass bookster-settings-tabs__container">
            <Tabs.List aria-label="Bookster settings">
              {(Object.keys(tabLabels) as BooksterSettingsTab[]).map((key) => (
                <Tabs.Tab key={key} id={key}>
                  {tabLabels[key]}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </header>
      <section className="bookster-settings-content">
        {tab === "config" ? <ConfigSettings /> : null}
        {tab === "categories" ? <LabelSettings key="category" kind="category" /> : null}
        {tab === "locations" ? <LabelSettings key="location" kind="location" /> : null}
        {tab === "duplicates" ? <DuplicateSettings /> : null}
      </section>
    </main>
  );
}

const SORT_OPTIONS: Array<{ id: BooksterSortOrder; label: string }> = [
  { id: "dateAdded", label: "Date Added" },
  { id: "title", label: "Title" },
  { id: "author", label: "Author" },
  { id: "category", label: "Category" },
  { id: "location", label: "Location" },
];
const THEME_OPTIONS: Array<{ id: BooksterTheme; label: string }> = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function ConfigSettings() {
  const { library, theme, setTheme } = useBookster();
  const updateSortOrder = useMutation(api.bookster.updateSortOrder);
  const setSort = async (value: Key | Key[] | null) => {
    if (value === null || Array.isArray(value)) return;
    try {
      await updateSortOrder({ defaultSortOrder: String(value) as BooksterSortOrder });
      toast("Default sort order saved");
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not save the sort order."));
    }
  };
  return (
    <div className="bookster-settings-stack">
      <SettingSelect
        description="How books are sorted when you open the app."
        label="Default Sort Order"
        onChange={setSort}
        options={SORT_OPTIONS}
        value={library.settings.defaultSortOrder}
      />
      <SettingSelect
        description="Stored on this device, so another family member keeps their preference."
        label="Theme"
        onChange={(value) => {
          if (value !== null && !Array.isArray(value)) setTheme(String(value) as BooksterTheme);
        }}
        options={THEME_OPTIONS}
        value={theme}
      />
    </div>
  );
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: Key | Key[] | null) => void;
}) {
  return (
    <div className="bookster-setting-field">
      <Select fullWidth value={value} onChange={onChange}>
        <Label>{label}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                {option.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <p>{description}</p>
    </div>
  );
}

type LabelKind = "category" | "location";
type ManagedLabel = BooksterCategory | BooksterLocation;

function LabelSettings({ kind }: { kind: LabelKind }) {
  const { library } = useBookster();
  const items = kind === "category" ? library.categories : library.locations;
  const create = useMutation(
    kind === "category" ? api.bookster.createCategory : api.bookster.createLocation,
  );
  const update = useMutation(
    kind === "category" ? api.bookster.updateCategory : api.bookster.updateLocation,
  );
  const remove = useMutation(
    kind === "category" ? api.bookster.removeCategory : api.bookster.removeLocation,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ManagedLabel | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const singular = kind === "category" ? "Category" : "Location";
  const usage = (id: string) =>
    library.books.filter((book) =>
      kind === "category"
        ? book.categoryIds.includes(id as BooksterCategoryId)
        : book.locationIds.includes(id as BooksterLocationId),
    ).length;

  const save = async () => {
    if (!value.trim()) return;
    setIsBusy(true);
    try {
      if (editingId) {
        if (kind === "category")
          await update({ id: editingId as BooksterCategoryId, label: value });
        else await update({ id: editingId as BooksterLocationId, label: value });
        toast(`${singular} updated`);
      } else {
        await create({ label: value });
        toast(`${singular} added`);
      }
      setEditingId(null);
      setValue("");
      setIsAdding(false);
    } catch (error) {
      toast.danger(booksterErrorMessage(error, `Could not save the ${kind}.`));
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsBusy(true);
    try {
      if (kind === "category") await remove({ id: pendingDelete._id as BooksterCategoryId });
      else await remove({ id: pendingDelete._id as BooksterLocationId });
      toast(`${singular} deleted`);
      setPendingDelete(null);
    } catch (error) {
      toast.danger(booksterErrorMessage(error, `Could not delete the ${kind}.`));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="bookster-settings-stack">
      <div className="bookster-label-list">
        <div className="bookster-label-list__heading">
          <strong>Label</strong>
          <strong>Actions</strong>
        </div>
        {items.map((item) => (
          <div key={item._id} className="bookster-label-row">
            {editingId === item._id ? (
              <TextField className="bookster-inline-input" value={value} onChange={setValue}>
                <Label className="sr-only">Edit {kind}</Label>
                <Input variant="secondary" />
              </TextField>
            ) : (
              <span>{item.label}</span>
            )}
            <div className="bookster-row-actions">
              {editingId === item._id ? (
                <>
                  <Button
                    aria-label={`Save ${item.label}`}
                    isDisabled={!value.trim()}
                    isIconOnly
                    isPending={isBusy}
                    onPress={save}
                    size="sm"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    aria-label="Cancel edit"
                    isIconOnly
                    onPress={() => {
                      setEditingId(null);
                      setValue("");
                    }}
                    size="sm"
                    variant="tertiary"
                  >
                    <X size={16} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    aria-label={`Edit ${item.label}`}
                    isIconOnly
                    onPress={() => {
                      setEditingId(item._id);
                      setValue(item.label);
                      setIsAdding(false);
                    }}
                    size="sm"
                    variant="tertiary"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    aria-label={`Delete ${item.label}`}
                    isIconOnly
                    onPress={() => setPendingDelete(item)}
                    size="sm"
                    variant="danger-soft"
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {isAdding ? (
        <div className="bookster-new-label">
          <TextField value={value} onChange={setValue}>
            <Label className="sr-only">New {kind} name</Label>
            <Input placeholder={`New ${kind} name`} variant="secondary" />
          </TextField>
          <Button
            aria-label={`Save new ${kind}`}
            isDisabled={!value.trim()}
            isIconOnly
            isPending={isBusy}
            onPress={save}
          >
            <Check size={17} />
          </Button>
          <Button
            aria-label="Cancel"
            isIconOnly
            onPress={() => {
              setIsAdding(false);
              setValue("");
            }}
            variant="tertiary"
          >
            <X size={17} />
          </Button>
        </div>
      ) : (
        <Button
          fullWidth
          onPress={() => {
            setIsAdding(true);
            setEditingId(null);
            setValue("");
          }}
          variant="secondary"
        >
          <Plus size={17} />
          Add {singular}
        </Button>
      )}
      <AlertDialog.Backdrop isOpen={pendingDelete !== null} variant="blur">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="bookster-confirm-dialog">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete {pendingDelete?.label}?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                {usage(pendingDelete?._id ?? "")} book association
                {usage(pendingDelete?._id ?? "") === 1 ? "" : "s"} will be removed before this label
                is deleted.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button isDisabled={isBusy} onPress={() => setPendingDelete(null)} variant="tertiary">
                Cancel
              </Button>
              <Button isPending={isBusy} onPress={confirmDelete} variant="danger">
                Delete
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}

function DuplicateSettings() {
  const { library } = useBookster();
  const removeBook = useMutation(api.bookster.removeBook);
  const [hasChecked, setHasChecked] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BooksterBook | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const groups = useMemo(
    () => (hasChecked ? findDuplicateGroups(library.books) : []),
    [hasChecked, library.books],
  );
  const locationLabels = useMemo(
    () => new Map(library.allLocations.map((location) => [location._id, location.label])),
    [library.allLocations],
  );
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsBusy(true);
    try {
      await removeBook({ id: pendingDelete._id });
      toast("Book deleted");
      setPendingDelete(null);
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not delete the book."));
    } finally {
      setIsBusy(false);
    }
  };
  return (
    <div className="bookster-settings-stack">
      <p className="bookster-settings-intro">Check your library for books with the same title.</p>
      <Button fullWidth onPress={() => setHasChecked(true)} variant="secondary">
        <Search size={18} />
        Check for Duplicates
      </Button>
      {hasChecked && groups.length === 0 ? (
        <div className="bookster-clean-library">
          <Check size={24} />
          <div>
            <strong>No duplicates found!</strong>
            <span>Your library is clean.</span>
          </div>
        </div>
      ) : null}
      {groups.length > 0 ? (
        <div className="bookster-duplicate-groups">
          <p>
            Found {groups.length} duplicate group{groups.length === 1 ? "" : "s"}.
          </p>
          {groups.map((group) => (
            <section key={group.normalizedTitle} className="bookster-duplicate-group">
              <header>
                <strong>{group.displayTitle}</strong>
                <span>{group.books.length} copies</span>
              </header>
              {group.books.map((book) => (
                <div key={book._id} className="bookster-duplicate-book">
                  <div>
                    <strong>{book.author}</strong>
                    <span>{book.isSample ? "Sample" : "Full book"}</span>
                    <span>
                      {book.locationIds
                        .flatMap((id) => {
                          const label = locationLabels.get(id);
                          return label ? [label] : [];
                        })
                        .join(", ") || "No location"}
                    </span>
                    <span>{duplicateDateFormatter.format(book.dateAdded)}</span>
                  </div>
                  <Button
                    aria-label={`Delete ${book.title} by ${book.author}`}
                    isIconOnly
                    onPress={() => setPendingDelete(book)}
                    variant="danger-soft"
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : null}
      <AlertDialog.Backdrop isOpen={pendingDelete !== null} variant="blur">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="bookster-confirm-dialog">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete this copy?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                “{pendingDelete?.title}” by {pendingDelete?.author} will be permanently removed.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button isDisabled={isBusy} onPress={() => setPendingDelete(null)} variant="tertiary">
                Cancel
              </Button>
              <Button isPending={isBusy} onPress={confirmDelete} variant="danger">
                Delete
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
