import type { ReactNode } from "react";
import "./child-cues.css";
const marks = {
  sound: (
    <>
      <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none" />
      <path d="M15 8q4 4 0 8m3-11q7 7 0 14" />
    </>
  ),
  quiet: (
    <>
      <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none" />
      <path d="m16 9 6 6m0-6-6 6" />
    </>
  ),
  stop: (
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      rx="3"
      fill="currentColor"
      stroke="none"
    />
  ),
  play: (
    <polygon
      points="7 5 19 12 7 19"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  pause: (
    <>
      <rect
        x="6"
        y="5"
        width="4.5"
        height="14"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="13.5"
        y="5"
        width="4.5"
        height="14"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  back: <path d="m15 5-7 7 7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  replay: (
    <>
      <path d="M4 11a8 8 0 1 1 1.6 6" />
      <path d="M4 4v7h7" />
    </>
  ),
  choose: (
    <>
      <path d="m4 15-1-9 11-2 1 4" />
      <rect x="7" y="8" width="13" height="13" rx="2.6" />
      <path d="m10 15 2.5 2.4 4.2-5" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  shelf: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  home: (
    <>
      <path d="m2 11 10-8 10 8M5 9v12h14V9" />
      <path d="M10 21v-7h4v7" />
    </>
  ),
} satisfies Record<string, ReactNode>;
export function ChildIcon({
  name,
  className = "",
}: {
  name: keyof typeof marks;
  className?: string;
}) {
  return (
    <svg
      className={"child-icon " + className}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {marks[name]}
    </svg>
  );
}
