import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-react';

// Shows a preliminary assessment result as icon + text (never colour alone).
// result: "no_major_concerns" | "further_inspection" | "significant_concerns" | null (renders nothing)
// size: "sm" | "md"
const RESULTS = {
  no_major_concerns: {
    label: 'No Major Concerns',
    icon: CircleCheck,
    classes: 'border-success/25 bg-success/10 text-success',
  },
  further_inspection: {
    label: 'Further Inspection',
    icon: TriangleAlert,
    classes: 'border-warning/25 bg-warning/10 text-warning',
  },
  significant_concerns: {
    label: 'Significant Concerns',
    icon: OctagonAlert,
    classes: 'border-danger/25 bg-danger/10 text-danger',
  },
};

const SIZES = {
  sm: { badge: 'gap-1 px-2 py-0.5 text-xs', icon: 'size-3.5' },
  md: { badge: 'gap-1.5 px-2.5 py-1 text-sm', icon: 'size-4' },
};

function ResultBadge({ result, size = 'md' }) {
  const config = RESULTS[result];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = SIZES[size] ?? SIZES.md;

  return (
    <span
      className={`inline-flex items-center rounded-sm border font-medium ${sizeClasses.badge} ${config.classes}`}
    >
      <Icon className={sizeClasses.icon} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default ResultBadge;
