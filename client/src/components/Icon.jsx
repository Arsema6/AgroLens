const PATHS = {
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="9.5" r="1.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C11 4 5 8 5 15v5" />
      <path d="M20 4c0 9-5 13-11 13" />
    </>
  ),
  bug: (
    <>
      <ellipse cx="12" cy="14" rx="5" ry="6" />
      <path d="M12 8V5M9 5l-2-2M15 5l2-2M7 12H4M7 16H4M17 12h3M17 16h3" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 10.5A6 6 0 016 13.5C6 9.5 12 3 12 3z" />,
  flask: (
    <>
      <path d="M9 3h6v5l4 9a3 3 0 01-2.7 4H7.7A3 3 0 015 17l4-9z" />
      <path d="M7 14h10" />
    </>
  ),
  shears: (
    <>
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="M8.5 16L17 4M15.5 16L7 4" />
    </>
  ),
  seed: (
    <>
      <path d="M12 21c-4 0-7-3-7-7s3-8 7-11c4 3 7 7 7 11s-3 7-7 7z" />
      <path d="M12 21V9" />
    </>
  ),
  hand: (
    <>
      <path d="M9 11V5a1.5 1.5 0 013 0v6" />
      <path d="M12 11V4.5a1.5 1.5 0 013 0V11" />
      <path d="M15 11V7a1.5 1.5 0 013 0v7a7 7 0 01-7 7H10a5 5 0 01-5-5v-4a1.5 1.5 0 013 0" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 108-8 8 8 0 00-6.9 4" />
      <path d="M4 4v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  check: <path d="M4 13l5 5L20 6" />,
  warning: (
    <>
      <path d="M12 3l9 17H3z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 11-2.3-5.7" />
      <path d="M20 4v5h-5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
};

/**
 * Inline SVG icon set. Icons carry the meaning on every screen, so text is optional and each
 * glyph keeps a thick stroke that survives being viewed on a phone in bright sun.
 */
export default function Icon({ name, className = 'h-6 w-6', title }) {
  const path = PATHS[name] ?? PATHS.leaf;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {path}
    </svg>
  );
}
