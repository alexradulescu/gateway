import { Button, SearchField } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LayoutGrid, List as ListIcon, Plus, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterBooksByCategories, searchBooks, sortBooks } from "../domain";
import { useBookster } from "../context/useBookster";
import type { BooksterBook, BooksterCategoryId } from "../types";
import { BookCover } from "./BookCover";

export function LibraryPage({ view = "shelf" }: { view?: "list" | "shelf" }) {
  const {
    library,
    searchValue,
    setSearchValue,
    selectedCategoryIds,
    toggleCategory,
    resetCategories,
  } = useBookster();
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchValue), 150);
    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const categoryLabels = useMemo(
    () => new Map(library.categories.map((category) => [category._id, category.label])),
    [library.categories],
  );
  const locationLabels = useMemo(
    () => new Map(library.locations.map((location) => [location._id, location.label])),
    [library.locations],
  );
  const visibleBooks = useMemo(() => {
    const sorted = sortBooks(
      library.books,
      library.settings.defaultSortOrder,
      categoryLabels,
      locationLabels,
    );
    const searched = searchBooks(sorted, debouncedSearch);
    return filterBooksByCategories(searched, selectedCategoryIds);
  }, [
    library.books,
    library.settings.defaultSortOrder,
    categoryLabels,
    locationLabels,
    debouncedSearch,
    selectedCategoryIds,
  ]);

  const columns = view === "shelf" ? 3 : 1;
  const virtualizer = useVirtualizer({
    count: Math.ceil(visibleBooks.length / columns),
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (view === "shelf" ? 240 : 116),
    overscan: 5,
    getItemKey: (index) => `${columns}-${visibleBooks[index * columns]._id}`,
  });

  const hasCategoryFilter = selectedCategoryIds.size > 0;
  const isSearching = debouncedSearch.trim().length >= 2;

  return (
    <main className="bookster-library">
      <header className="bookster-floating-header" data-scrolled={hasScrolled}>
        <div className="bookster-title-bar">
          <h1>Bookster</h1>
          <div className="bookster-title-actions">
            <Link
              aria-label={view === "shelf" ? "Show book list" : "Show bookshelf"}
              className="bookster-icon-link"
              to={view === "shelf" ? "/list" : "/"}
            >
              {view === "shelf" ? (
                <ListIcon aria-hidden="true" size={20} />
              ) : (
                <LayoutGrid aria-hidden="true" size={19} />
              )}
            </Link>
            <Link aria-label="Open settings" className="bookster-icon-link" to="/settings">
              <Settings aria-hidden="true" size={20} />
            </Link>
          </div>
        </div>

        {library.categories.length > 0 ? (
          <div className="bookster-category-strip" aria-label="Category filters">
            <Button
              aria-pressed={!hasCategoryFilter}
              className="bookster-filter-pill"
              onPress={resetCategories}
              size="sm"
              variant={!hasCategoryFilter ? "primary" : "outline"}
            >
              All
            </Button>
            {library.categories.map((category) => {
              const selected = selectedCategoryIds.has(category._id);
              return (
                <Button
                  key={category._id}
                  aria-pressed={selected}
                  className="bookster-filter-pill"
                  onPress={() => toggleCategory(category._id as BooksterCategoryId)}
                  size="sm"
                  variant={selected ? "primary" : "outline"}
                >
                  {category.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </header>

      <div
        ref={scrollRef}
        className="bookster-library-scroll"
        id="bookster-library-scroll"
        onScroll={(event) => setHasScrolled(event.currentTarget.scrollTop > 0)}
      >
        {visibleBooks.length === 0 ? (
          <LibraryEmptyState
            hasCategoryFilter={hasCategoryFilter}
            searchValue={searchValue}
            isSearching={isSearching}
            onReset={() => {
              setSearchValue("");
              resetCategories();
            }}
            addTo={view === "shelf" ? "/shelf/add" : "/add"}
          />
        ) : (
          <div
            className={view === "shelf" ? "bookster-shelf-space" : "bookster-virtual-space"}
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                className={view === "shelf" ? "bookster-shelf-row" : "bookster-virtual-row"}
                data-index={virtualRow.index}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {visibleBooks
                  .slice(virtualRow.index * columns, (virtualRow.index + 1) * columns)
                  .map((book) =>
                    view === "shelf" ? (
                      <BookshelfBook key={book._id} book={book} />
                    ) : (
                      <BookRow
                        key={book._id}
                        book={book}
                        categoryLabels={categoryLabels}
                        locationLabels={locationLabels}
                      />
                    ),
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bookster-floating-footer">
        <SearchField
          aria-label="Search books"
          className="bookster-search"
          name="bookster-search"
          onChange={setSearchValue}
          value={searchValue}
        >
          <SearchField.Group className="bookster-glass bookster-search__group">
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search title or author…" />
            <SearchField.ClearButton aria-label="Clear search" />
          </SearchField.Group>
        </SearchField>
        <Link
          aria-label="Add book"
          className="bookster-add-button bookster-add-link"
          to={view === "shelf" ? "/shelf/add" : "/add"}
        >
          <Plus aria-hidden="true" size={20} />
        </Link>
      </footer>
    </main>
  );
}

function BookshelfBook({ book }: { book: BooksterBook }) {
  return (
    <Link
      aria-label={`${book.title} by ${book.author}`}
      className="bookster-shelf-book"
      params={{ bookId: book._id }}
      resetScroll={false}
      to="/shelf/books/$bookId"
    >
      <span className="bookster-shelf-book__cover">
        <BookCover large showTitle title={book.title} />
      </span>
      <span className="bookster-shelf-book__author">{book.author}</span>
    </Link>
  );
}

function BookRow({
  book,
  categoryLabels,
  locationLabels,
}: {
  book: BooksterBook;
  categoryLabels: ReadonlyMap<string, string>;
  locationLabels: ReadonlyMap<string, string>;
}) {
  const categories = book.categoryIds.flatMap((id) => categoryLabels.get(id) ?? []);
  const locations = book.locationIds.flatMap((id) => locationLabels.get(id) ?? []);
  return (
    <Link
      aria-label={`${book.title} by ${book.author}`}
      className="bookster-book-row"
      params={{ bookId: book._id }}
      resetScroll={false}
      to="/books/$bookId"
    >
      <BookCover title={book.title} />
      <span className="bookster-book-row__copy">
        <strong>{book.title}</strong>
        <span className="bookster-book-row__author">{book.author}</span>
        {book.isSample || categories.length > 0 || locations.length > 0 ? (
          <span className="bookster-badges">
            {book.isSample ? (
              <span className="bookster-badge bookster-badge--sample">Sample</span>
            ) : null}
            {locations.map((label) => (
              <span key={`location-${label}`} className="bookster-badge bookster-badge--location">
                {label}
              </span>
            ))}
            {categories.map((label) => (
              <span key={`category-${label}`} className="bookster-badge bookster-badge--category">
                {label}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function LibraryEmptyState({
  searchValue,
  isSearching,
  hasCategoryFilter,
  onReset,
  addTo,
}: {
  searchValue: string;
  isSearching: boolean;
  hasCategoryFilter: boolean;
  onReset: () => void;
  addTo: "/add" | "/shelf/add";
}) {
  const title = isSearching
    ? "No books found"
    : hasCategoryFilter
      ? "No books in this view"
      : "Your shelves are ready";
  const message = isSearching
    ? `No titles or authors match “${searchValue}”. Try another search or add it to your library.`
    : hasCategoryFilter
      ? "No books match these categories. Clear the filters to see your collection."
      : "A place for every book you love. Start with your first one.";
  return (
    <div className="bookster-empty-library">
      <span aria-hidden="true" className="bookster-empty-library__mark">
        B
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {isSearching || hasCategoryFilter ? (
        <Button onPress={onReset} variant="secondary">
          Clear filters
        </Button>
      ) : (
        <Link className="bookster-link-button" to={addTo}>
          Add your first book
        </Link>
      )}
    </div>
  );
}
