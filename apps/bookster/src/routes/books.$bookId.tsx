import { createFileRoute } from "@tanstack/react-router";
import { BookDetailSheet } from "../components/BookDetailSheet";

export const Route = createFileRoute("/books/$bookId")({ component: BookDetailRoute });

function BookDetailRoute() {
  const { bookId } = Route.useParams();
  return <BookDetailSheet bookId={bookId} />;
}
