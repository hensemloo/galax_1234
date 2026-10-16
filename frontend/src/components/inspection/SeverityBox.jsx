import { formatPercentInfected } from '../../utils/reportHelpers';
import { SEVERITY_LABELS } from '../../utils/severity';

// Big coloured box with the inspection's severity, e.g. "SEVERITY (DEMO) · Medium · 25% of pods
// infected". The level is always written in words, so the colour is never the only signal.
// Used on the Summary (O5) and the Full report (O7). The A4 report has its own print version.
// summary: from summarisePods (needs severity and percentInfected)
// layout: 'inline' (O5: level and % on one line, bigger) | 'stacked' (O7: % under the level)
//
// Full class names are written out so Tailwind can find them (no `bg-sev-${x}-bg`).
const STYLES = {
  none: 'bg-sev-none-bg text-sev-none-text',
  low: 'bg-sev-low-bg text-sev-low-text',
  medium: 'bg-sev-medium-bg text-sev-medium-text',
  high: 'bg-sev-high-bg text-sev-high-text',
  na: 'bg-sev-na-bg text-sev-na-text',
};

function SeverityBox({ summary, layout = 'inline' }) {
  const key = STYLES[summary?.severity] ? summary.severity : 'na';
  const isInline = layout === 'inline';

  return (
    <section
      aria-label="Severity"
      className={`flex flex-col ${STYLES[key]} ${isInline ? 'gap-1.5 rounded-[14px] p-4' : 'gap-0.5 rounded-xl p-3.5'}`}
    >
      <span className={`font-bold tracking-wide uppercase ${isInline ? 'text-[13px]' : 'text-xs'}`}>
        Severity (DEMO)
      </span>
      <div className={isInline ? 'flex flex-wrap items-baseline gap-x-2.5' : 'flex flex-col'}>
        <span
          className={`font-bold ${isInline ? 'text-[32px] leading-tight' : 'text-[28px] leading-tight'}`}
        >
          {SEVERITY_LABELS[key]}
        </span>
        <span className={`font-semibold ${isInline ? 'text-lg' : 'text-[15px]'}`}>
          {formatPercentInfected(summary)}
        </span>
      </div>
    </section>
  );
}

export default SeverityBox;
