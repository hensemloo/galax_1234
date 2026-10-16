import Button from './Button';

// Shown when a list has nothing in it (or a search finds nothing).
// icon: a lucide-react icon component, e.g. icon={ClipboardList}
// title: short heading, e.g. "No inspections yet"
// message: one sentence under the title
// actionLabel + onAction: optional button, e.g. "New inspection"
// actionIcon: optional lucide-react icon shown before the action label, e.g. actionIcon={Plus}
// actionVariant: Button variant for the action ("primary" | "secondary" | "text")
function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  actionVariant = 'primary',
}) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-border text-text-muted">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold text-text">{title}</p>
      {message && <p className="mt-1 max-w-xs text-sm text-text-muted">{message}</p>}
      {actionLabel && onAction && (
        <Button variant={actionVariant} onClick={onAction} className="mt-5">
          {ActionIcon && <ActionIcon className="size-4" aria-hidden="true" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
