// The CocoaCheck logo mark: a simple cocoa pod outline (from the design mockups).
// Decorative: always place visible text ("CocoaCheck") next to it.
// className: size and colour, e.g. "size-6 text-primary-light" (the stroke uses currentColor)
function CocoaPodIcon({ className = 'size-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9z" />
      <path d="M12 3v18M8.5 6.5c1 3 1 8 0 11M15.5 6.5c-1 3-1 8 0 11" />
    </svg>
  );
}

export default CocoaPodIcon;
