import { describe, expect, test } from "bun:test";
import { parseBookCsv, previewBookCsv } from "./csv";

describe("Bookster CSV", () => {
  test("parses quoted rows and reports invalid and duplicate entries before import", () => {
    const parsed = parseBookCsv(`title,author,isSample
"Dune, Messiah","Herbert, Frank",false
Dune,Herbert Frank,true
,Missing,false
Dune,Herbert Frank,false`);

    expect(parsed.rows).toEqual([
      { title: "Dune, Messiah", author: "Herbert, Frank", isSample: false, rowNumber: 2 },
      { title: "Dune", author: "Herbert Frank", isSample: true, rowNumber: 3 },
      { title: "Dune", author: "Herbert Frank", isSample: false, rowNumber: 5 },
    ]);
    expect(parsed.invalid).toBe(1);

    const preview = previewBookCsv(parsed, [{ title: "Dune, Messiah", author: "Herbert, Frank" }]);
    expect(preview).toMatchObject({
      importable: 1,
      existingDuplicates: 1,
      csvDuplicates: 1,
      invalid: 1,
    });
    expect(preview.books[0]).toMatchObject({ title: "Dune", isSample: true });
  });

  test("does not confuse title and author pairs containing separators", () => {
    const parsed = parseBookCsv(`title,author,isSample
A,B|C,false`);
    const preview = previewBookCsv(parsed, [{ title: "A|B", author: "C" }]);

    expect(preview.importable).toBe(1);
    expect(preview.existingDuplicates).toBe(0);
  });
});
