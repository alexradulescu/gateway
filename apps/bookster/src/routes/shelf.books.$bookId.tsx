import { createFileRoute } from "@tanstack/react-router";
import { BookDetailSheet } from "../components/BookDetailSheet";

export const Route = createFileRoute("/shelf/books/$bookId")({ component: ShelfBookDetailRoute });

function ShelfBookDetailRoute() {
  const { bookId } = Route.useParams();
  return <BookDetailSheet bookId={bookId} returnTo="/shelf" />;
}
