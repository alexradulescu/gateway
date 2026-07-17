import { Button, toast } from "@heroui/react";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useBookster } from "../context/useBookster";
import { cleanBooksterText } from "../domain";
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

export function AddBookSheet({ returnTo = "/" }: { returnTo?: "/" | "/shelf" }) {
  const { library, searchValue, setSearchValue } = useBookster();
  const capturedTitle = useRef(searchValue);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [book, setBook] = useState(() => emptyBook(capturedTitle.current));
  const [baseline, setBaseline] = useState(() => JSON.stringify(emptyBook()));
  const [errors, setErrors] = useState<Partial<Record<"title" | "author", string>>>({});
  const [isBusy, setIsBusy] = useState(false);
  const addBook = useMutation(api.bookster.addBook);
  const navigate = useNavigate();
  const isDirty = JSON.stringify(book) !== baseline;
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty && !isBusy,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });

  useEffect(() => setSearchValue(""), [setSearchValue]);
  useEffect(() => titleInputRef.current?.focus(), []);

  const close = () => void navigate({ to: returnTo, resetScroll: false });
  const validate = () => {
    const next = {
      title: cleanBooksterText(book.title) ? undefined : "Title is required.",
      author: cleanBooksterText(book.author) ? undefined : "Author is required.",
    };
    setErrors(next);
    return !next.title && !next.author;
  };

  const submit = async (event: React.FormEvent) => {
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
      setBaseline(JSON.stringify(nextBook));
      setErrors({});
      window.requestAnimationFrame(() => titleInputRef.current?.focus());
    } catch (error) {
      toast.danger(booksterErrorMessage(error, "Could not add the book."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <BookSheetFrame title="Add Book" isBusy={isBusy} onRequestClose={close}>
        <form className="bookster-form" onSubmit={submit}>
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
      </BookSheetFrame>
      <DiscardDialog
        isOpen={blocker.status === "blocked"}
        onCancel={() => blocker.reset?.()}
        onDiscard={() => blocker.proceed?.()}
      />
    </>
  );
}
