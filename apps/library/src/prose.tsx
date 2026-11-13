import { Fragment, type ReactNode } from "react";

// Chapter text is plain prose: blank lines split paragraphs, a line of
// "***" (or "* * *") is a scene break, *text* is italic, **text** is bold.

const OPENS_AFTER = /^$|[\s([{"'“‘]/;
const DASH_OR_EMPHASIS = /[—–*_-]/;
const WORDLIKE = /[\p{L}\p{N}]/u;
/** Words that start with an apostrophe (dropped letters, decades), never an opening quote. */
const ELISION = /^(?:\d\d(?!\d)|(?:em|cause|til|ere|course|tis|twas|n'|arry)(?![\p{L}]))/iu;

/** Straight quotes and apostrophes to typographic ones, decided by what precedes and follows.
 * A quote opens after the start, whitespace, a bracket or another opening quote when a
 * non-space follows; after a dash or emphasis marker it opens only before a letter or digit.
 * Known elisions ('em, 'til, '90s…) and possessives after emphasis are apostrophes. */
export function smartQuotes(text: string) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char !== '"' && char !== "'") {
      out += char;
      continue;
    }
    const prev = text[i - 1] ?? "";
    const next = text[i + 1] ?? "";
    const rest = text.slice(i + 1);
    const opensHere = OPENS_AFTER.test(prev) && next !== "" && !/\s/.test(next);
    const opensAfterMark = DASH_OR_EMPHASIS.test(prev) && WORDLIKE.test(next);
    if (char === "'") {
      const possessive = prev !== "" && !OPENS_AFTER.test(prev) && /^s(?![\p{L}])/u.test(rest);
      if (possessive || (OPENS_AFTER.test(prev) && ELISION.test(rest))) out += "’";
      else out += opensHere || opensAfterMark ? "‘" : "’";
    } else {
      out += opensHere || opensAfterMark ? "“" : "”";
    }
  }
  return out;
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function Prose({ body }: { body: string }) {
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, index) =>
        /^(\*\s*){3,}$/.test(block) ? (
          <div key={index} className="scene-break" role="separator">
            ◆
          </div>
        ) : (
          <p key={index}>
            {block.split("\n").map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inline(smartQuotes(line))}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </>
  );
}
