import {
  Button,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  toast,
  type Key,
} from "@heroui/react";
import { useBlocker } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useBookster } from "../context/useBookster";
import { BOOKSTER_CSV_TEMPLATE, parseBookCsv, previewBookCsv } from "../csv";
import { booksterErrorMessage } from "../errors";
import type { BooksterLocationId } from "../types";
import { DiscardDialog } from "./DiscardDialog";

export function CsvImportSettings({ onBusyChange }: { onBusyChange: (isBusy: boolean) => void }) {
  const { library } = useBookster();
  const [csvContent, setCsvContent] = useState("");
  const [bulkLocationId, setBulkLocationId] = useState<string | null>(null);
  const [previewed, setPreviewed] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const addBookBatch = useMutation(api.bookster.addBookBatch);
  const isDirty = csvContent !== "" || bulkLocationId !== null;
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });
  const parsed = useMemo(() => parseBookCsv(csvContent), [csvContent]);
  const preview = useMemo(() => previewBookCsv(parsed, library.books), [parsed, library.books]);

  const importCsv = async () => {
    if (preview.books.length === 0) return;
    setIsBusy(true);
    onBusyChange(true);
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
      onBusyChange(false);
    }
  };

  return (
    <>
      <div className="bookster-form bookster-import-form">
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
          <Button fullWidth isDisabled={!csvContent.trim()} onPress={() => setPreviewed(true)}>
            Preview CSV
          </Button>
        )}
      </div>
      <DiscardDialog
        description={
          isBusy
            ? "Wait for the import to finish before leaving this page."
            : "Your CSV and import selections will be lost."
        }
        isDiscardDisabled={isBusy}
        isOpen={blocker.status === "blocked"}
        title={isBusy ? "Import in progress" : "Discard your changes?"}
        onCancel={() => blocker.reset?.()}
        onDiscard={() => blocker.proceed?.()}
      />
    </>
  );
}
