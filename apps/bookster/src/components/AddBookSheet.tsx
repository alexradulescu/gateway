import {
  Button,
  Label,
  ListBox,
  Select,
  Tabs,
  TextArea,
  TextField,
  toast,
  type Key,
} from "@heroui/react";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { BOOKSTER_CSV_TEMPLATE, parseBookCsv, previewBookCsv } from "../csv";
import { cleanBooksterText } from "../domain";
import { useBookster } from "../context/useBookster";
import { booksterErrorMessage } from "../errors";
import type { BooksterCategoryId, BooksterLocationId } from "../types";
import { BookFields, type BookFormValue } from "./BookFields";
import { BookSheetFrame } from "./BookSheetFrame";
import { DiscardDialog } from "./DiscardDialog";

const emptyBook = (title = ""): BookFormValue => ({
  title,
  author: "",
  categoryIds: [],
  locationIds: [],
  isSample: false,
});

export function AddBookSheet({ initialTab = "single" }: { initialTab?: "single" | "bulk" }) {
  const { library, searchValue, setSearchValue } = useBookster();
  const capturedTitle = useRef(searchValue);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [book, setBook] = useState(() => emptyBook(capturedTitle.current));
  const [singleBaseline, setSingleBaseline] = useState(() => JSON.stringify(emptyBook()));
  const [errors, setErrors] = useState<Partial<Record<"title" | "author", string>>>({});
  const [tab, setTab] = useState(initialTab);
  const [csvContent, setCsvContent] = useState("");
  const [bulkLocationId, setBulkLocationId] = useState<string | null>(null);
  const [previewed, setPreviewed] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const addBook = useMutation(api.bookster.addBook);
  const addBookBatch = useMutation(api.bookster.addBookBatch);
  const navigate = useNavigate({ from: "/add" });
  const isDirty =
    JSON.stringify(book) !== singleBaseline || csvContent !== "" || bulkLocationId !== null;
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty && !isBusy,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });

  useEffect(() => setSearchValue(""), [setSearchValue]);
  useEffect(() => titleInputRef.current?.focus(), []);

  const parsed = useMemo(() => parseBookCsv(csvContent), [csvContent]);
  const preview = useMemo(() => previewBookCsv(parsed, library.books), [parsed, library.books]);

  const close = () => void navigate({ to: "/", resetScroll: false });
  const validate = () => {
    const next = {
      title: cleanBooksterText(book.title) ? undefined : "Title is required.",
      author: cleanBooksterText(book.author) ? undefined : "Author is required.",
    };
    setErrors(next);
    return !next.title && !next.author;
  };

  const submitSingle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsBusy(true);
    try {
      await addBook({
        title: book.title,
        author: book.author,
        categoryIds: book.categoryIds as BooksterCategoryId[],
        locationIds: book.locationIds as BooksterLocationId[],
        isSample: book.isSample,
      });
      toast(`“${cleanBooksterText(book.title)}” added`);
      const nextBook = {
        ...emptyBook(),
        categoryIds: book.categoryIds,
        locationIds: book.locationIds,
      };
      setBook(nextBook);
      setSingleBaseline(JSON.stringify(nextBook));
      setErrors({});
      window.requestAnimationFrame(() => titleInputRef.current?.focus());
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not add the book."));
    } finally {
      setIsBusy(false);
    }
  };

  const importCsv = async () => {
    if (preview.books.length === 0) return;
    setIsBusy(true);
    let imported = 0;
    let skipped = 0;
    try {
      for (let start = 0; start < preview.books.length; start += 100) {
        const batch = preview.books.slice(start, start + 100);
        const result = await addBookBatch({
          books: batch.map(({ title, author, isSample }) => ({ title, author, isSample })),
          locationId: bulkLocationId ? (bulkLocationId as BooksterLocationId) : undefined,
        });
        imported += result.imported;
        skipped += result.skipped;
        setProgress(Math.min(start + batch.length, preview.books.length));
      }
      toast(`Imported ${imported} books${skipped ? `; skipped ${skipped}` : ""}.`);
      setCsvContent("");
      setBulkLocationId(null);
      setPreviewed(false);
      setProgress(null);
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "The import stopped. You can safely retry."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <BookSheetFrame title="Add Book" hideTitle isBusy={isBusy} onRequestClose={close}>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key) === "bulk" ? "bulk" : "single")}
        >
          <Tabs.ListContainer className="bookster-tabs-container bookster-add-header-tabs">
            <Tabs.List aria-label="Add book method">
              <Tabs.Tab id="single">
                Single Book
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="bulk">
                Bulk CSV
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="single">
            <form className="bookster-form" onSubmit={submitSingle}>
              <BookFields
                categories={library.categories}
                errors={errors}
                locations={library.locations}
                onChange={setBook}
                titleInputRef={titleInputRef}
                value={book}
              />
              <Button fullWidth isPending={isBusy} type="submit">
                Add Book
              </Button>
            </form>
          </Tabs.Panel>
          <Tabs.Panel id="bulk">
            <div className="bookster-form">
              <div className="bookster-csv-note">
                <Info aria-hidden="true" size={18} />
                <span>CSV format: title, author, isSample</span>
                <Button
                  onPress={() => {
                    setCsvContent(BOOKSTER_CSV_TEMPLATE);
                    setPreviewed(false);
                  }}
                  size="sm"
                  variant="tertiary"
                >
                  Load template
                </Button>
              </div>
              <TextField
                value={csvContent}
                onChange={(value) => {
                  setCsvContent(value);
                  setPreviewed(false);
                }}
              >
                <Label>CSV Content</Label>
                <TextArea placeholder="Paste your CSV content here…" rows={7} variant="secondary" />
              </TextField>
              <Select
                fullWidth
                placeholder="Select location for all books"
                value={bulkLocationId}
                onChange={(key) => setBulkLocationId(key === null ? null : String(key as Key))}
              >
                <Label>Location (optional)</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {library.locations.map((location) => (
                      <ListBox.Item key={location._id} id={location._id} textValue={location.label}>
                        {location.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              {previewed ? (
                <output className="bookster-import-preview">
                  <strong>{preview.importable} ready to import</strong>
                  <span>{preview.existingDuplicates} already in Bookster</span>
                  <span>{preview.csvDuplicates} repeated in this CSV</span>
                  <span>{preview.invalid} missing required data</span>
                  {preview.errors.map((error) => (
                    <span key={error} className="bookster-error-copy">
                      {error}
                    </span>
                  ))}
                </output>
              ) : null}
              {progress !== null ? (
                <p className="bookster-progress">
                  Imported {progress} of {preview.books.length}…
                </p>
              ) : null}
              {previewed ? (
                <Button
                  fullWidth
                  isDisabled={preview.importable === 0}
                  isPending={isBusy}
                  onPress={importCsv}
                >
                  Confirm Import
                </Button>
              ) : (
                <Button
                  fullWidth
                  isDisabled={!csvContent.trim()}
                  onPress={() => setPreviewed(true)}
                >
                  Preview CSV
                </Button>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </BookSheetFrame>
      <DiscardDialog
        isOpen={blocker.status === "blocked"}
        onCancel={() => blocker.reset?.()}
        onDiscard={() => blocker.proceed?.()}
      />
    </>
  );
}
