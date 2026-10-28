import { Fragment, type ReactNode } from "react";

// Chapter text is plain prose: blank lines split paragraphs, a line of
// "***" (or "* * *") is a scene break, *text* is italic, **text** is bold.

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
                {inline(line)}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </>
  );
}
