import { Link } from 'react-router';
import SeverityBadge from '../ui/SeverityBadge';
import StatusChip from '../ui/StatusChip';
import { formatVisitDate } from '../../utils/format';
import { adminInspectionPath, adminReportPath } from '../../utils/inspectionRoutes';

// Supervisor table of inspections: Dashboard "Recent inspections" and the Inspections page.
// inspections: list from inspectionService, already sorted (newest first)
// caption: what the table shows, read by screen readers
//
// Drafts are not final yet: their counts show "—", severity shows "Pending", and there is
// no PDF link (the report exists only after the officer confirms).
// On narrow screens the table scrolls sideways inside its box; the page itself does not.
const COLUMNS = [
  'Date',
  'Block',
  'Tree',
  'Officer',
  'Pods counted',
  'Infected',
  'Severity',
  'Status',
];

const CELL = 'border-b border-border px-2 py-2 align-middle';
const LINK =
  'inline-flex min-h-11 items-center px-2 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// "4 (1 excl.)" or "5"
function formatPods(summary) {
  if (!summary) return '—';
  return summary.excluded ? `${summary.counted} (${summary.excluded} excl.)` : `${summary.counted}`;
}

// "1 · 25%" (no % when nothing was counted)
function formatInfected(summary) {
  if (!summary) return '—';
  return typeof summary.percentInfected === 'number'
    ? `${summary.infected} · ${summary.percentInfected}%`
    : `${summary.infected}`;
}

function InspectionTable({ inspections, caption }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-xs tracking-wide text-text-muted uppercase">
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-border px-2 py-2.5 font-semibold"
              >
                {column}
              </th>
            ))}
            <th scope="col" className="border-b border-border px-2 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((inspection) => {
            const isDraft = inspection.status === 'draft';
            const summary = isDraft ? null : inspection.summary;
            // Gives "View" / "PDF" a clear name for screen readers, e.g. "View A-01, 12 Oct 2026".
            const rowName = `${inspection.tree.code}, ${formatVisitDate(inspection.visitDate)}`;

            return (
              <tr key={inspection.id}>
                <td className={`${CELL} whitespace-nowrap`}>
                  {formatVisitDate(inspection.visitDate)}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>{inspection.block.name}</td>
                <td className={`${CELL} font-mono font-semibold`}>{inspection.tree.code}</td>
                <td className={CELL}>{inspection.officer.name}</td>
                <td className={CELL}>{formatPods(summary)}</td>
                <td className={CELL}>{formatInfected(summary)}</td>
                <td className={CELL}>
                  {isDraft ? (
                    <SeverityBadge severity="na" label="Pending" />
                  ) : (
                    <SeverityBadge severity={summary?.severity} />
                  )}
                </td>
                <td className={CELL}>
                  <StatusChip status={inspection.status} />
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  <Link to={adminInspectionPath(inspection.id)} className={LINK}>
                    View<span className="sr-only"> {rowName}</span>
                  </Link>
                  {!isDraft && (
                    <>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <Link to={adminReportPath(inspection.id)} className={LINK}>
                        PDF<span className="sr-only"> report {rowName}</span>
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InspectionTable;
