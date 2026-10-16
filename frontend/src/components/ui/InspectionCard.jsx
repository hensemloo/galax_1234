import { Link } from 'react-router';
import { formatShortDate } from '../../utils/format';
import { isAnalysed, resumePath } from '../../utils/inspectionRoutes';
import SeverityBadge from './SeverityBadge';
import StatusChip from './StatusChip';

// One inspection in a list (officer Home and History). The whole card is a link:
// completed -> full report, draft -> the wizard step where it stopped (see resumePath).
// inspection: the inspection object from inspectionService
// showDate: adds the visit date to the second line (Home). History groups by day, so it doesn't.
// draftAction: what drafts show on the right: 'continue' ("Continue ›", Home) | 'chip' (Draft chip, History)

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// Second line of the card, e.g. "12 Oct · 4 pods · 25% infected" or "3 photos · not analysed yet".
function getDetailLine(inspection, showDate) {
  const parts = [];
  if (showDate) parts.push(formatShortDate(inspection.visitDate));

  const photoCount = inspection.pods?.length ?? 0;
  if (inspection.status === 'completed' && inspection.summary) {
    parts.push(plural(inspection.summary.counted, 'pod'));
    if (inspection.summary.percentInfected !== null) {
      parts.push(`${inspection.summary.percentInfected}% infected`);
    }
  } else if (photoCount === 0) {
    parts.push('no photos yet');
  } else {
    parts.push(plural(photoCount, 'photo'));
    parts.push(isAnalysed(inspection) ? 'ready to review' : 'not analysed yet');
  }
  return parts.join(' · ');
}

function InspectionCard({ inspection, showDate = false, draftAction = 'continue' }) {
  const isDraft = inspection.status === 'draft';

  return (
    <Link
      to={resumePath(inspection)}
      className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3.5 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isDraft ? 'border-dashed border-sev-medium-dot' : 'border-border'
      }`}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-bold text-text">
          <span className="sr-only">
            {isDraft ? 'Continue draft, tree ' : 'Open report, tree '}
          </span>
          <span className="font-mono">{inspection.tree.code}</span> · {inspection.block.name}
        </span>
        <span className="text-sm text-text-muted">{getDetailLine(inspection, showDate)}</span>
      </span>

      {isDraft && draftAction === 'continue' && (
        <span
          className="shrink-0 text-sm font-bold whitespace-nowrap text-primary"
          aria-hidden="true"
        >
          Continue ›
        </span>
      )}
      {isDraft && draftAction === 'chip' && <StatusChip status="draft" />}
      {!isDraft && <SeverityBadge severity={inspection.summary?.severity} className="shrink-0" />}
    </Link>
  );
}

export default InspectionCard;
