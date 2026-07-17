import { AlertDialog, Button, toast } from "@heroui/react";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { cleanBooksterText } from "../domain";
import { useBookster } from "../context/useBookster";
import { booksterErrorMessage } from "../errors";
import type { BooksterCategoryId, BooksterLocationId } from "../types";
import { BookCover } from "./BookCover";
import { BookIdentityFields, BookMetadataFields, type BookFormValue } from "./BookFields";
import { BookSheetFrame } from "./BookSheetFrame";
import { DiscardDialog } from "./DiscardDialog";

const booksterDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function BookDetailSheet({
  bookId,
  returnTo = "/",
}: {
  bookId: string;
  returnTo?: "/" | "/shelf";
}) {
  const { library } = useBookster();
  const selected = library.books.find((book) => book._id === bookId);
  const initial = useMemo<BookFormValue | null>(
    () =>
      selected
        ? {
            title: selected.title,
            author: selected.author,
            categoryIds: selected.categoryIds,
            locationIds: selected.locationIds,
            isSample: selected.isSample,
          }
        : null,
    [selected],
  );
  const [book, setBook] = useState<BookFormValue | null>(initial);
  const [savedBook, setSavedBook] = useState<BookFormValue | null>(initial);
  const [errors, setErrors] = useState<Partial<Record<"title" | "author", string>>>({});
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateBook = useMutation(api.bookster.updateBook);
  const removeBook = useMutation(api.bookster.removeBook);
  const navigate = useNavigate();
  const isDirty = Boolean(book && savedBook && JSON.stringify(book) !== JSON.stringify(savedBook));
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty && !isBusy,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });

  const close = () => void navigate({ to: returnTo, resetScroll: false });
  if (!selected || !book) {
    return (
      <BookSheetFrame title="Book not found" isBusy={false} onRequestClose={close}>
        <div className="bookster-missing-book">
          <p>This volume may have been deleted on another device.</p>
          <Button onPress={close}>Back to the library</Button>
        </div>
      </BookSheetFrame>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = {
      title: cleanBooksterText(book.title) ? undefined : "Title is required.",
      author: cleanBooksterText(book.author) ? undefined : "Author is required.",
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.author) return;
    setIsBusy(true);
    try {
      const normalizedBook = {
        ...book,
        title: cleanBooksterText(book.title),
        author: cleanBooksterText(book.author),
      };
      await updateBook({
        id: selected._id,
        title: normalizedBook.title,
        author: normalizedBook.author,
        categoryIds: normalizedBook.categoryIds as BooksterCategoryId[],
        locationIds: normalizedBook.locationIds as BooksterLocationId[],
        isSample: normalizedBook.isSample,
      });
      setBook(normalizedBook);
      setSavedBook(normalizedBook);
      toast("Book saved");
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not save the book."));
    } finally {
      setIsBusy(false);
    }
  };

  const deleteBook = async () => {
    setIsBusy(true);
    try {
      await removeBook({ id: selected._id });
      toast("Book deleted");
      setIsDeleteDialogOpen(false);
      close();
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not delete the book."));
      setIsBusy(false);
    }
  };

  return (
    <>
      <BookSheetFrame title={selected.title} isBusy={isBusy} onRequestClose={close}>
        <form className="bookster-form" onSubmit={submit}>
          <div className="bookster-detail-lead">
            <BookCover large title={book.title || selected.title} />
            <BookIdentityFields errors={errors} onChange={setBook} value={book} />
          </div>
          <BookMetadataFields
            categories={library.categories}
            locations={library.locations}
            onChange={setBook}
            value={book}
          />
          <div className="bookster-dates">
            <span>Date Added: {booksterDateFormatter.format(selected.dateAdded)}</span>
            <span>Last Updated: {booksterDateFormatter.format(selected.lastUpdated)}</span>
          </div>
          <div className="bookster-detail-actions">
            <Button fullWidth isPending={isBusy} type="submit">
              Save
            </Button>
            <Button
              isPending={isBusy}
              onPress={() => setIsDeleteDialogOpen(true)}
              variant="outline"
            >
              Delete
            </Button>
          </div>
        </form>
      </BookSheetFrame>
      <DiscardDialog
        isOpen={blocker.status === "blocked"}
        onCancel={() => blocker.reset?.()}
        onDiscard={() => blocker.proceed?.()}
      />
      <AlertDialog.Backdrop
        className="bookster-modal-backdrop"
        isOpen={isDeleteDialogOpen}
        variant="transparent"
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="bookster-confirm-dialog">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete “{selected.title}”?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>This book will be permanently removed from your library.</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                isDisabled={isBusy}
                onPress={() => setIsDeleteDialogOpen(false)}
                variant="tertiary"
              >
                Cancel
              </Button>
              <Button isPending={isBusy} onPress={deleteBook} variant="danger">
                Delete Book
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}
