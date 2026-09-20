import { useId } from "react";
import { COVER_PATTERNS, getBookColor, getBookInitials, getBookPatternIndex } from "../bookCover";

export function BookCover({
  title,
  author,
  large = false,
  showTitle = false,
}: {
  title: string;
  author?: string;
  large?: boolean;
  showTitle?: boolean;
}) {
  const instanceId = useId().replaceAll(":", "");
  const clipId = `book-cover-${instanceId}`;
  const pattern = getBookPatternIndex(title);
  const titleSize = title.length > 36 ? "long" : title.length > 22 ? "medium" : "short";
  const frame = showTitle
    ? { height: 90, width: 60, x: 0, y: 0 }
    : { height: 84, width: 54, x: 3, y: 3 };

  return (
    <span
      aria-hidden="true"
      className={`bookster-cover${large ? " bookster-cover--large" : ""}${showTitle ? " bookster-cover--titled" : ""}`}
    >
      <svg viewBox="0 0 60 90" role="presentation">
        <defs>
          <clipPath id={clipId}>
            <rect {...frame} rx={showTitle ? 0 : 2.75} />
          </clipPath>
        </defs>

        <rect
          className="bookster-cover__face"
          fill={getBookColor(title)}
          height={frame.height}
          rx={showTitle ? 0 : 2.75}
          width={frame.width}
          x={frame.x}
          y={frame.y}
        />
        <g clipPath={`url(#${clipId})`} className="bookster-cover__pattern">
          <path d={COVER_PATTERNS[pattern]} />
        </g>
        <g className="bookster-cover__label">
          <rect height="20" rx="1.5" width="34" x="13" y="35" />
          <path d="M17 39h26M17 51h26" />
          <text x="30" y="48.4">
            {getBookInitials(title)}
          </text>
        </g>
      </svg>
      {showTitle ? (
        <span className="bookster-cover__title" data-title-size={titleSize}>
          {title}
          {author ? <span className="bookster-cover__author">{author}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
