import type { CSSProperties } from "react";
import { getBookColor, getBookInitials, getBookPatternIndex } from "../bookCover";

export function BookCover({ title, large = false }: { title: string; large?: boolean }) {
  const style = {
    "--book-color": getBookColor(title),
  } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      className={`bookster-cover ${large ? "bookster-cover--large" : ""} bookster-cover--pattern-${getBookPatternIndex(title)}`}
      style={style}
    >
      <span className="bookster-cover__spine" />
      <span className="bookster-cover__initials">{getBookInitials(title)}</span>
      <span className="bookster-cover__pages" />
    </span>
  );
}
