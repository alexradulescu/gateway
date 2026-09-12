import { Button, toast } from "@heroui/react";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { cleanBooksterText } from "../domain";
import { useBookster } from "../context/useBookster";
import { booksterErrorMessage } from "../errors";
import { BookCover } from "./BookCover";
import { BookIdentityFields, BookMetadataFields, type BookFormValue } from "./BookFields";
import { BookSheetFrame } from "./BookSheetFrame";
import { DeleteDialog } from "./DeleteDialog";
import { DiscardDialog } from "./DiscardDialog";

const booksterDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function BookDetailSheet({
  bookId,
  returnTo = "/list",
}: {
  bookId: string;
  returnTo?: "/list" | "/shelf";
}) {
  const { library } = useBookster();
  const selected = library.books.find((book) => book._id === bookId);
  const [book, setBook] = useState<BookFormValue | null>(() =>
    selected
      ? {
          title: selected.title,
          author: selected.author,
          categoryIds: selected.categoryIds,
          locationIds: selected.locationIds,
          isSample: selected.isSample,
        }
      : null,
  );
  const [savedBook, setSavedBook] = useState(book);
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
      await updateBook({ id: selected._id, ...normalizedBook });
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
        <form className="bookster-form bookster-detail-form" onSubmit={submit}>
          <div className="bookster-detail-lead">
            <BookCover large title={book.title || selected.title} />
            <BookIdentityFields errors={errors} onChange={setBook} value={book} />
          </div>
          <BookMetadataFields
            categories={library.categories}
            locations={library.locations}
            onChange={setBook}
            showSampleDescription={false}
            value={book}
          />
          <p className="bookster-dates">
            <span>Added {booksterDateFormatter.format(selected.dateAdded)}</span>
            <span aria-hidden="true">|</span>
            <span>Updated {booksterDateFormatter.format(selected.lastUpdated)}</span>
          </p>
          <div className="bookster-detail-actions">
            <Button fullWidth isPending={isBusy} type="submit">
              Save
            </Button>
            <Button
              isPending={isBusy}
              onPress={() => setIsDeleteDialogOpen(true)}
              variant="danger-soft"
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
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        isBusy={isBusy}
        title={`Delete “${selected.title}”?`}
        confirmLabel="Delete Book"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteBook}
      >
        This book will be permanently removed from your library.
      </DeleteDialog>
    </>
  );
}
