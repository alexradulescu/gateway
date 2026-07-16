import Papa from "papaparse";
import { cleanBooksterText, normalizeBooksterText } from "./domain";

export type CsvBook = {
  title: string;
  author: string;
  isSample: boolean;
  rowNumber: number;
};

export type ParsedBookCsv = {
  rows: CsvBook[];
  invalid: number;
  errors: string[];
};

export function parseBookCsv(content: string): ParsedBookCsv {
  const result: ParsedBookCsv = { rows: [], invalid: 0, errors: [] };
  if (!content.trim()) return { ...result, errors: ["CSV content is empty"] };

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });
  const headers = parsed.meta.fields ?? [];
  if (!headers.includes("title") || !headers.includes("author")) {
    return {
      ...result,
      errors: [`Missing required headers. Expected title, author, isSample.`],
    };
  }

  parsed.data.forEach((row, index) => {
    const title = cleanBooksterText(row.title ?? "");
    const author = cleanBooksterText(row.author ?? "");
    if (!title || !author) {
      result.invalid += 1;
      return;
    }
    const rawSample = cleanBooksterText(row.issample ?? "").toLowerCase();
    result.rows.push({
      title,
      author,
      isSample: rawSample === "true" || rawSample === "1",
      rowNumber: index + 2,
    });
  });

  for (const error of parsed.errors) {
    result.errors.push(`Row ${(error.row ?? 0) + 2}: ${error.message}`);
  }
  return result;
}

function duplicateKey(book: { title: string; author: string }) {
  return JSON.stringify([normalizeBooksterText(book.title), normalizeBooksterText(book.author)]);
}

export function previewBookCsv(
  parsed: ParsedBookCsv,
  existingBooks: { title: string; author: string }[],
) {
  const existing = new Set(existingBooks.map(duplicateKey));
  const seen = new Set<string>();
  const books: CsvBook[] = [];
  let existingDuplicates = 0;
  let csvDuplicates = 0;

  for (const book of parsed.rows) {
    const key = duplicateKey(book);
    if (existing.has(key)) {
      existingDuplicates += 1;
    } else if (seen.has(key)) {
      csvDuplicates += 1;
    } else {
      seen.add(key);
      books.push(book);
    }
  }

  return {
    books,
    importable: books.length,
    existingDuplicates,
    csvDuplicates,
    invalid: parsed.invalid,
    errors: parsed.errors,
  };
}

export const BOOKSTER_CSV_TEMPLATE = `title,author,isSample
"The Great Gatsby","F. Scott Fitzgerald",false
"1984","George Orwell",true`;
