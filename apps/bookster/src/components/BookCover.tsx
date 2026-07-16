import { useId } from "react";
import { getBookColor, getBookInitials, getBookPatternIndex } from "../bookCover";

export function BookCover({ title, large = false }: { title: string; large?: boolean }) {
  const clipId = `book-cover-${useId().replaceAll(":", "")}`;
  const pattern = getBookPatternIndex(title);

  return (
    <span aria-hidden="true" className={`bookster-cover ${large ? "bookster-cover--large" : ""}`}>
      <svg viewBox="0 0 68 92" role="presentation">
        <ellipse cx="34" cy="84" rx="25" ry="4" fill="rgb(0 0 0 / 0.14)" />
        <g transform="rotate(-2 34 46)">
          <path
            d="M13 10 49 13 58 18 58 74 49 82 13 78Z"
            fill="#d8d1c5"
            stroke="rgb(64 60 53 / 0.28)"
            strokeWidth="0.8"
          />
          <path d="M13 10 49 13 58 18 22 15Z" fill="#f7f2e9" />
          <path d="M49 13 58 18 58 74 49 82Z" fill="#e8e1d6" />
          <path d="M13 73 49 77 58 70 58 74 49 82 13 78Z" fill="#c9c1b5" />
          <g stroke="rgb(90 82 70 / 0.27)" strokeWidth="0.65">
            <path d="m51 28 5 2" />
            <path d="m51 40 5 2" />
            <path d="m51 52 5 2" />
            <path d="m51 64 5 2" />
          </g>

          <clipPath id={clipId}>
            <path d="M8 7 51 11 51 79 8 75Z" />
          </clipPath>
          <path
            d="M8 7 51 11 51 79 8 75Z"
            fill={getBookColor(title)}
            stroke="rgb(48 61 53 / 0.42)"
            strokeWidth="0.9"
          />
          <g clipPath={`url(#${clipId})`} className="bookster-cover__pattern">
            <CoverPattern index={pattern} />
          </g>
          <path d="M8 7 14 8 14 76 8 75Z" fill="rgb(45 65 54 / 0.2)" />
          <path d="M15 9 15 76" stroke="rgb(45 65 54 / 0.32)" strokeWidth="0.8" />
          <path d="M9 8 50 12" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.8" />
          <rect x="21" y="36" width="20" height="16" rx="1.5" fill="rgb(250 247 240 / 0.68)" />
          <rect
            x="23"
            y="38"
            width="16"
            height="12"
            rx="0.8"
            fill="none"
            stroke="rgb(47 64 55 / 0.25)"
            strokeWidth="0.7"
          />
          <text
            x="31"
            y="47.5"
            fill="#293a34"
            fontFamily="Georgia, serif"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.6"
            textAnchor="middle"
          >
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
        <path d="M8 24 51 28M8 58 51 62" />
        <path d="M27 8 27 77" />
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <circle cx="30" cy="44" r="24" />
        <circle cx="30" cy="44" r="18" />
      </>
    );
  }
  if (index === 3) {
    return (
      <>
        <path d="m4 28 24-20 27 24M4 54l24 22 27-18" />
        <path d="m4 40 24-20 27 24M4 66l24 22 27-18" />
      </>
    );
  }
  if (index === 4) {
    return (
      <>
        <circle cx="22" cy="25" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="37" cy="28" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="61" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="41" cy="66" r="1.2" fill="currentColor" stroke="none" />
      </>
    );
  }
  if (index === 5) {
    return <path d="M8 22h43M8 66h43M21 8v69M39 10v69" />;
  }
  return <path d="M4 18 54 68M4 32l43 43M17 8l38 38" />;
}
