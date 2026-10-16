// Square tile showing the indicative grade letter (never call it an "official grade").
// grade: "A" | "B" | "C"
// size: "sm" (32px) | "md" (48px) | "lg" (64px)
// showCaption: shows "Indicative Grade" under the tile
const SIZES = {
  sm: 'size-8 text-base',
  md: 'size-12 text-2xl',
  lg: 'size-16 text-3xl',
};

function GradeTile({ grade, size = 'md', showCaption = false }) {
  const tile = (
    <span
      role="img"
      aria-label={`Indicative Grade ${grade}`}
      className={`inline-flex shrink-0 items-center justify-center rounded bg-primary font-mono font-medium text-white ${SIZES[size] ?? SIZES.md}`}
    >
      <span aria-hidden="true">{grade}</span>
    </span>
  );

  if (!showCaption) return tile;

  return (
    <span className="inline-flex flex-col items-center gap-1.5">
      {tile}
      <span className="text-xs text-text-muted" aria-hidden="true">
        Indicative Grade
      </span>
    </span>
  );
}

export default GradeTile;
