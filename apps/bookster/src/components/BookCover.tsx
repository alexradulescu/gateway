import { useId } from "react";
import { getBookColor, getBookInitials, getBookPatternIndex } from "../bookCover";

export function BookCover({ title, large = false }: { title: string; large?: boolean }) {
  const instanceId = useId().replaceAll(":", "");
  const clipId = `book-cover-${instanceId}`;
  const pattern = getBookPatternIndex(title);

  return (
    <span aria-hidden="true" className={`bookster-cover ${large ? "bookster-cover--large" : ""}`}>
      <svg viewBox="0 0 60 90" role="presentation">
        <defs>
          <clipPath id={clipId}>
            <rect height="84" rx="2.75" width="54" x="3" y="3" />
          </clipPath>
        </defs>

        <rect
          className="bookster-cover__face"
          fill={getBookColor(title)}
          height="84"
          rx="2.75"
          width="54"
          x="3"
          y="3"
        />
        <g clipPath={`url(#${clipId})`} className="bookster-cover__pattern">
          <CoverPattern index={pattern} />
        </g>
        <g className="bookster-cover__label">
          <rect height="20" rx="1.5" width="34" x="13" y="35" />
          <path d="M17 39h26M17 51h26" />
          <text x="30" y="48.4">
            {getBookInitials(title)}
          </text>
        </g>
      </svg>
    </span>
  );
}

function CoverPattern({ index }: { index: number }) {
  if (index === 1) {
    return (
      <>
        <path d="M3 20h54M3 70h54M20 3v84M40 3v84" />
        <path d="m30 8 8 8-8 8-8-8Zm0 58 8 8-8 8-8-8Z" />
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <circle cx="30" cy="19" r="12" />
        <circle cx="30" cy="71" r="12" />
        <path d="M3 32h54M3 58h54" />
      </>
    );
  }
  if (index === 3) {
    return (
      <>
        <path d="M3 27 27 3m30 24L33 3M3 63l24 24m30-24L33 87" />
        <path d="M3 17 17 3m40 14L43 3M3 73l14 14m40-14L43 87" />
      </>
    );
  }
  if (index === 4) {
    return (
      <>
        <path d="M3 15h12V3m30 0v12h12M3 75h12v12m30 0V75h12" />
        <path d="m30 8 7 7-7 7-7-7Zm0 60 7 7-7 7-7-7Z" />
      </>
    );
  }
  if (index === 5) {
    return (
      <>
        <path d="M3 29 30 3l27 26M3 61l27 26 27-26" />
        <path d="M9 29 30 9l21 20M9 61l21 20 21-20" />
      </>
    );
  }
  return (
    <>
      <path d="M3 29 30 3l27 26M3 61l27 26 27-26" />
      <path d="M3 19 19 3m38 16L41 3M3 71l16 16m38-16L41 87" />
    </>
  );
}
