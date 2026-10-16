// Small box with one number, e.g. "Pods counted 4".
// label: short muted text above the value
// value: the number or short text to show (mono font)
// sub: optional muted line under the value, e.g. "1 draft pending"
// className: extra classes, e.g. a min width inside a scroll row
function StatCard({ label, value, sub, className = '' }) {
  return (
    <div
      className={`flex min-h-24 flex-col justify-between gap-3 rounded border border-border bg-surface p-4 ${className}`}
    >
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-mono text-3xl font-medium text-text">{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export default StatCard;
