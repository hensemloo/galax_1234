// A row of small white boxes with one number each, e.g. "4 Pods counted · 1 Infected · 1 Excluded".
// Used on the Summary (O5, 3 boxes) and the Full report (O7, 4 boxes).
// items: [{ label, value, danger }] (danger: shows the number in red, e.g. Infected)
// compact: smaller, centred boxes (O7)
//
// Full class names are written out so Tailwind can find them.
const COLUMNS = { 3: 'grid-cols-3', 4: 'grid-cols-4' };

function CountTiles({ items, compact = false }) {
  return (
    <section
      aria-label="Counts"
      className={`grid ${COLUMNS[items.length] ?? 'grid-cols-3'} ${compact ? 'gap-2' : 'gap-2.5'}`}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex flex-col rounded-xl border border-border bg-surface ${
            compact ? 'items-center p-2' : 'gap-0.5 p-3'
          }`}
        >
          <span
            className={`font-bold ${compact ? 'text-xl' : 'text-2xl'} ${item.danger ? 'text-sev-high-text' : ''}`}
          >
            {item.value}
          </span>
          <span className={`text-text-muted ${compact ? 'text-xs' : 'text-[13px]'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </section>
  );
}

export default CountTiles;
