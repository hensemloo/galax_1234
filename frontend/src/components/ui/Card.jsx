// White box with a 1px border, used to group content on a page.
// title: optional heading shown at the top (rendered as an h2)
// action: optional element on the right of the title, e.g. a "See all" link
// className: extra classes, e.g. "mt-4"
function Card({ title, action, className = '', children }) {
  return (
    <div className={`rounded border border-border bg-surface p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
