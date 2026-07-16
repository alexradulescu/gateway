import { useId } from "react";
import { getBookColor, getBookInitials, getBookPatternIndex } from "../bookCover";

export function BookCover({ title, large = false }: { title: string; large?: boolean }) {
  const instanceId = useId().replaceAll(":", "");
  const clipId = `book-cover-${instanceId}`;
  const pageGradientId = `book-pages-${instanceId}`;
  const sheenGradientId = `book-sheen-${instanceId}`;
  const pattern = getBookPatternIndex(title);
  const coverColor = getBookColor(title);

  return (
    <span aria-hidden="true" className={`bookster-cover ${large ? "bookster-cover--large" : ""}`}>
      <svg viewBox="0 0 82 104" role="presentation">
        <defs>
          <clipPath id={clipId}>
            <path d="M9 14 59 6 59 87 9 96Z" />
          </clipPath>
          <linearGradient id={pageGradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#f8f3e9" />
            <stop offset="0.7" stopColor="#e9e1d4" />
            <stop offset="1" stopColor="#c9bead" />
          </linearGradient>
          <linearGradient id={sheenGradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.34" />
            <stop offset="0.42" stopColor="white" stopOpacity="0.04" />
            <stop offset="1" stopColor="#18231d" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <ellipse cx="42" cy="98" rx="31" ry="4.5" fill="rgb(0 0 0 / 0.2)" />
        <g transform="rotate(-2 41 52)">
          {/* The back cover is the front plane translated along one depth vector. */}
          <path
            d="M20 19 70 11 70 92 20 101Z"
            fill={coverColor}
            stroke="rgb(35 45 39 / 0.52)"
            strokeLinejoin="round"
            strokeWidth="1.1"
          />
          <path d="M20 19 70 11 70 92 20 101Z" fill="rgb(20 29 24 / 0.28)" />

          {/* A single parallelogram makes the page block read as real thickness. */}
          <path
            d="M59 9 69 14 69 89 59 84Z"
            fill={`url(#${pageGradientId})`}
            stroke="rgb(81 73 63 / 0.42)"
            strokeLinejoin="round"
            strokeWidth="0.8"
          />
          <g className="bookster-cover__page-lines">
            <path d="m60.5 19 7 3.5" />
            <path d="m60.5 28.5 7 3.5" />
            <path d="m60.5 38 7 3.5" />
            <path d="m60.5 47.5 7 3.5" />
            <path d="m60.5 57 7 3.5" />
            <path d="m60.5 66.5 7 3.5" />
            <path d="m60.5 76 7 3.5" />
          </g>

          {/* Front cover: one uninterrupted plane, tilted about nine degrees. */}
          <path
            d="M9 14 59 6 59 87 9 96Z"
            fill={coverColor}
            stroke="rgb(35 49 41 / 0.58)"
            strokeLinejoin="round"
            strokeWidth="1.15"
          />
          <g clipPath={`url(#${clipId})`} className="bookster-cover__pattern">
            <CoverPattern index={pattern} />
          </g>
          <path d="M9 14 59 6 59 87 9 96Z" fill={`url(#${sheenGradientId})`} />
          <path d="M9 14 16 13 16 95 9 96Z" fill="rgb(26 42 33 / 0.24)" />
          <path d="M17.5 13 17.5 94.5" stroke="rgb(25 45 34 / 0.3)" strokeWidth="0.9" />
          <path d="M10 14.3 58.5 6.6" stroke="rgb(255 255 255 / 0.55)" strokeWidth="0.8" />

          <g transform="rotate(-9 35 52)">
            <rect
              x="20.5"
              y="24"
              width="32"
              height="55"
              rx="1.2"
              fill="none"
              stroke="rgb(91 72 38 / 0.38)"
              strokeWidth="0.85"
            />
            <path d="M24 29h25M24 74h25" stroke="rgb(91 72 38 / 0.34)" strokeWidth="0.7" />
            <path d="m36.5 30 3.2 3.2-3.2 3.2-3.2-3.2Z" fill="rgb(91 72 38 / 0.38)" />
            <rect x="23" y="42" width="27" height="19" rx="1.5" fill="rgb(250 247 240 / 0.82)" />
            <rect
              x="25"
              y="44"
              width="23"
              height="15"
              rx="0.8"
              fill="none"
              stroke="rgb(47 64 55 / 0.28)"
              strokeWidth="0.7"
            />
            <text
              x="36.5"
              y="55.2"
              fill="#273931"
              fontFamily="Georgia, serif"
              fontSize="9.5"
              fontWeight="700"
              letterSpacing="0.65"
              textAnchor="middle"
            >
              {getBookInitials(title)}
            </text>
          </g>
        </g>
      </svg>
    </span>
  );
}

function CoverPattern({ index }: { index: number }) {
  if (index === 1) {
    return (
      <>
        <path d="m7 29 55-9M7 80l55-9" />
        <path d="m32 8 1 87" />
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <circle cx="34" cy="51" r="27" />
        <circle cx="34" cy="51" r="20" />
      </>
    );
  }
  if (index === 3) {
    return (
      <>
        <path d="m4 32 28-25 31 22M4 65l29 31 31-26" />
        <path d="m4 44 28-25 31 22M4 77l29 31 31-26" />
      </>
    );
  }
  if (index === 4) {
    return (
      <>
        <circle cx="23" cy="27" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="45" cy="25" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="22" cy="74" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="48" cy="70" r="1.25" fill="currentColor" stroke="none" />
      </>
    );
  }
  if (index === 5) {
    return <path d="m5 31 58-9M5 75l58-9M24 10l1 87M45 7l1 87" />;
  }
  return <path d="m2 22 65 58M2 39l52 47M18 8l49 43" />;
}
