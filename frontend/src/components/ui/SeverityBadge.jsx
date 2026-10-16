import { SEVERITY_LABELS } from '../../utils/severity';

// Pill showing a severity level as dot + text (never colour alone), e.g. "Medium · 25%".
// severity: 'none' | 'low' | 'medium' | 'high' | 'na' (unknown values show as 'na')
// percent: optional % of pods infected, shown after the label
// demo: adds "(DEMO)" while the thresholds are not verified by LKM
// size: 'sm' (lists, default) | 'md' (summary headers)
// label: optional text instead of the level name, e.g. "Pending" for a draft (severity "na")
// onTile: white see-through pill, for use on a tile that already has the severity background
//
// Full class names are written out so Tailwind can find them (no `bg-sev-${x}-bg`).
const STYLES = {
  none: { bg: 'bg-sev-none-bg', text: 'text-sev-none-text', dot: 'bg-sev-none-dot' },
  low: { bg: 'bg-sev-low-bg', text: 'text-sev-low-text', dot: 'bg-sev-low-dot' },
  medium: { bg: 'bg-sev-medium-bg', text: 'text-sev-medium-text', dot: 'bg-sev-medium-dot' },
  high: { bg: 'bg-sev-high-bg', text: 'text-sev-high-text', dot: 'bg-sev-high-dot' },
  na: { bg: 'bg-sev-na-bg', text: 'text-sev-na-text', dot: 'bg-sev-na-dot' },
};

const SIZES = {
  sm: 'gap-1.5 px-2.5 py-1 text-xs',
  md: 'gap-2 px-3 py-1.5 text-sm',
};

function SeverityBadge({
  severity,
  percent,
  label,
  demo = false,
  size = 'sm',
  onTile = false,
  className = '',
}) {
  const key = STYLES[severity] ? severity : 'na';
  const style = STYLES[key];
  const hasPercent = typeof percent === 'number';
  const background = onTile ? 'bg-surface/70' : style.bg;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${background} ${style.text} ${SIZES[size] ?? SIZES.sm} ${className}`}
    >
      <span className={`size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      {label ?? SEVERITY_LABELS[key]}
      {hasPercent && ` · ${percent}%`}
      {demo && ' (DEMO)'}
    </span>
  );
}

export default SeverityBadge;
