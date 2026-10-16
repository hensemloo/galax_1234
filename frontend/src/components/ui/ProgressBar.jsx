// Thin progress bar with an accent fill.
// value: 0-100 (values outside the range are clamped)
// label: what the bar measures, read by screen readers (default "Progress")
// className: extra classes, e.g. a width or margin
function ProgressBar({ value = 0, label = 'Progress', className = '' }) {
  const percent = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`h-1.5 overflow-hidden rounded-full bg-border ${className}`}
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default ProgressBar;
