import { Check, PencilLine } from 'lucide-react';

// Shows whether an inspection is still a draft or completed (locked), as icon + text.
// status: "draft" | "completed" (anything else renders nothing)
const STATUSES = {
  draft: {
    label: 'Draft',
    icon: PencilLine,
    classes: 'border-transparent bg-primary-soft text-primary',
  },
  completed: {
    label: 'Completed',
    icon: Check,
    classes: 'border-primary bg-transparent text-primary',
  },
};

function StatusChip({ status }) {
  const config = STATUSES[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${config.classes}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default StatusChip;
