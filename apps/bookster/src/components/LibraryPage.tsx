import { Button, SearchField } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterBooksByCategories, searchBooks, sortBooks } from "../domain";
import { useBookster } from "../context/useBookster";
import type { BooksterBook, BooksterCategoryId } from "../types";
import { BookCover } from "./BookCover";

export function LibraryPage() {
  const {
    library,
    searchValue,
    setSearchValue,
    selectedCategoryIds,
    toggleCategory,
    resetCategories,
  } = useBookster();
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
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

  const virtualizer = useVirtualizer({
    count: visibleBooks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 92,
    overscan: 8,
    getItemKey: (index) => visibleBooks[index]._id,
  });

  const hasCategoryFilter = selectedCategoryIds.size > 0;
  const isSearching = debouncedSearch.trim().length >= 2;

  return (
    <main className="bookster-library">
      <header className="bookster-floating-header">
        <div className="bookster-glass bookster-title-bar">
          <div>
            <p className="bookster-eyebrow">Family library</p>
            <h1>Bookster</h1>
          </div>
          <Link aria-label="Open settings" className="bookster-icon-link" to="/settings">
            <Settings aria-hidden="true" size={20} />
          </Link>
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

      <div ref={scrollRef} className="bookster-library-scroll" id="bookster-library-scroll">
        {visibleBooks.length === 0 ? (
          <LibraryEmptyState
            hasCategoryFilter={hasCategoryFilter}
            searchValue={searchValue}
            isSearching={isSearching}
          />
        ) : (
          <div className="bookster-virtual-space" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const book = visibleBooks[virtualRow.index];
              return (
                <div
                  key={book._id}
                  ref={virtualizer.measureElement}
                  className="bookster-virtual-row"
                  data-index={virtualRow.index}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <BookRow
                    book={book}
                    categoryLabels={categoryLabels}
                    locationLabels={locationLabels}
                    index={virtualRow.index}
                  />
                </div>
              );
            })}
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
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Link aria-label="Add book" className="bookster-add-button bookster-add-link" to="/add">
          <Plus aria-hidden="true" size={20} />
        </Link>
      </footer>
    </main>
  );
}

function BookRow({
  book,
  categoryLabels,
  locationLabels,
  index,
}: {
  book: BooksterBook;
  categoryLabels: ReadonlyMap<string, string>;
  locationLabels: ReadonlyMap<string, string>;
  index: number;
}) {
  const categories = book.categoryIds.flatMap((id) => categoryLabels.get(id) ?? []);
  const locations = book.locationIds.flatMap((id) => locationLabels.get(id) ?? []);
  return (
    <Link
      aria-label={`${book.title} by ${book.author}`}
      className="bookster-book-row"
      data-stripe={index % 2 === 0 ? "even" : "odd"}
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
}: {
  searchValue: string;
  isSearching: boolean;
  hasCategoryFilter: boolean;
}) {
  const title = isSearching
    ? "No matching volume"
    : hasCategoryFilter
      ? "No books in this view"
      : "Your shelves are ready";
  const message = isSearching
    ? `No “${searchValue}” book exists yet. Are you buying it?`
    : hasCategoryFilter
      ? "The enabled categories do not contain any books. Choose All to reset the view."
      : "No books here yet. Add one with the button below.";
  return (
    <div className="bookster-empty-library">
      <span aria-hidden="true" className="bookster-empty-library__mark">
        B
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
