import { useLayoutEffect, useRef } from 'react';
import CocoaPodIcon from '../ui/CocoaPodIcon';
import { formatDateTime, formatVisitDate, pluralPods } from '../../utils/format';
import {
  DISCLAIMER,
  formatPercentInfected,
  formatPrevious,
  formatSeverityScale,
  getDiseaseName,
  getPodNote,
  getRecommendedActions,
} from '../../utils/reportHelpers';
import { SEVERITY_LABELS, summarisePods } from '../../utils/severity';

// The A4 "Cocoa Pod Inspection Report" (1 page). Used by the print page (officer Download PDF)
// and later the supervisor's report view. Design: docs/design/pod/staff/PDF-report-A4.html
//
// inspection: the inspection object from inspectionService
// diseases: the disease table from listDiseases() (names + recommended actions)
// generatedAt: when the report was generated (Date or ISO string), shown in the footer
//
// Print-friendly: near-black text on white, real borders, severity written in words (the
// coloured box is extra). No cocoa background pattern. Fits one A4 page (186 x 273 mm inside
// the 12 mm page margins from styles/index.css) with up to 10 pods:
// - with 7 or more pods the layout is tighter (smaller photos, rows and gaps)
// - if it is STILL too tall (e.g. 10 pods + a 500-character note), the report shrinks itself a
//   little with CSS zoom, so it stays on one page without cutting any text.
const DENSE_FROM = 7;

// Height of the printable area: 297 mm A4 - 2 x 12 mm margins = 273 mm, in CSS px (96 px per inch),
// minus a few px of safety.
const PAGE_HEIGHT_PX = (273 * 96) / 25.4 - 4;

// Light background of the severity box (written out so Tailwind can find the class names).
const SEVERITY_BG = {
  none: 'bg-sev-none-bg',
  low: 'bg-sev-low-bg',
  medium: 'bg-sev-medium-bg',
  high: 'bg-sev-high-bg',
  na: 'bg-sev-na-bg',
};

// Borders a bit darker than the screen border token, so they still show on a grayscale print.
const LINE = 'border-text-muted/60';

function Detail({ label, children }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function Count({ label, value }) {
  return (
    <div className={`flex flex-col justify-center rounded-md border ${LINE} px-3 py-2`}>
      <span className="text-[22px] leading-tight font-bold">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function InspectionReport({ inspection, diseases, generatedAt }) {
  const { pods } = inspection;
  // Same function as the Summary screen and dashboard, so the numbers always match.
  const summary = summarisePods(pods);
  const severity = SEVERITY_BG[summary.severity] ? summary.severity : 'na';
  const actions = getRecommendedActions(summary, diseases);
  const dense = pods.length >= DENSE_FROM;
  const cell = `border ${LINE} px-2 ${dense ? 'py-px' : 'py-1'}`;
  const isCompleted = inspection.status === 'completed';
  const articleRef = useRef(null);

  // Shrink to one page if needed. Measured again once the web fonts have loaded.
  useLayoutEffect(() => {
    const article = articleRef.current;
    let cancelled = false;
    function fitToPage() {
      if (cancelled || !article) return;
      article.style.zoom = '';
      const height = article.scrollHeight;
      article.style.zoom = height > PAGE_HEIGHT_PX ? String(PAGE_HEIGHT_PX / height) : '';
    }
    fitToPage();
    document.fonts?.ready.then(fitToPage);
    return () => {
      cancelled = true;
    };
  }, [inspection, diseases]);

  return (
    <article
      ref={articleRef}
      className={`flex min-h-[270mm] flex-col bg-surface text-[13px] leading-snug text-text ${
        dense ? 'gap-2.5' : 'gap-3.5'
      }`}
    >
      {/* Header */}
      <header className="flex items-end justify-between gap-4 border-b-2 border-primary-dark pb-2.5">
        <div className="flex items-center gap-2.5">
          <CocoaPodIcon className="size-8.5 text-primary-dark" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-primary-dark">
              COCOACHECK SABAH
            </span>
            <h1 className="text-[22px] font-bold">Cocoa Pod Inspection Report</h1>
          </div>
        </div>
        <div className="flex flex-col items-end text-xs text-text-muted">
          <span>
            Report no. <span className="font-mono font-semibold text-text">{inspection.id}</span>
          </span>
          <span>
            Status:{' '}
            <b className="text-text">
              {isCompleted ? 'Completed (locked)' : 'Draft (not confirmed)'}
            </b>
          </span>
        </div>
      </header>

      {/* Details */}
      <section
        aria-label="Inspection details"
        className={`grid grid-cols-3 gap-x-5 gap-y-2 rounded-md border ${LINE} px-3.5 py-3`}
      >
        <Detail label="Farm">{inspection.farm.name}</Detail>
        <Detail label="Block">{inspection.block.name}</Detail>
        <Detail label="Tree code">
          <span className="font-mono">{inspection.tree.code}</span>
        </Detail>
        <Detail label="Visit date">{formatVisitDate(inspection.visitDate)}</Detail>
        <Detail label="Field officer">{inspection.officer.name}</Detail>
        <Detail label="Previous inspection">{formatPrevious(inspection.previous)}</Detail>
      </section>

      {/* Severity + counts */}
      <section aria-label="Result" className="flex items-stretch gap-3.5">
        <div
          className={`print-exact flex w-58 shrink-0 flex-col gap-0.5 rounded-md border-2 border-text px-3.5 py-3 ${SEVERITY_BG[severity]}`}
        >
          <span className="text-xs font-bold tracking-wide">SEVERITY (DEMO)</span>
          <span className="text-[30px] leading-tight font-bold uppercase">
            {SEVERITY_LABELS[severity]}
          </span>
          <span className="text-sm font-semibold">{formatPercentInfected(summary)}</span>
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2.5">
          <Count label="Photos" value={summary.photos} />
          <Count label="Pods counted" value={summary.counted} />
          <Count label="Infected" value={summary.infected} />
          <Count label="Excluded" value={summary.excluded} />
        </div>
      </section>

      {/* Pod table */}
      <section aria-labelledby="report-pods-heading" className="flex flex-col gap-1.5">
        <h2 id="report-pods-heading" className="text-[15px] font-bold">
          Pod results
        </h2>
        <table className={`w-full border-collapse ${dense ? 'text-xs' : 'text-[13px]'}`}>
          <thead>
            <tr className="print-exact bg-sev-na-bg text-left">
              <th className={`${cell} w-16`}>Photo</th>
              <th className={cell}>Pod</th>
              <th className={cell}>AI suggestion</th>
              <th className={`${cell} text-right`}>Confidence</th>
              <th className={cell}>Final label (officer)</th>
              <th className={cell}>Note</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((pod, index) => {
              const name = `Pod ${index + 1}`;
              const aiName = getDiseaseName(diseases, pod.aiLabel);
              return (
                <tr key={pod.id}>
                  <td className={cell}>
                    <span
                      className={`flex items-center justify-center overflow-hidden rounded bg-sev-na-bg text-text-muted ${
                        dense ? 'size-7' : 'size-12'
                      } ${pod.excluded ? 'opacity-50' : ''}`}
                    >
                      {pod.photoUrl ? (
                        <img
                          src={pod.photoUrl}
                          alt={`${name} photo`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <CocoaPodIcon className={dense ? 'size-4.5' : 'size-7'} />
                      )}
                    </span>
                  </td>
                  <td className={`${cell} font-semibold`}>{name}</td>
                  <td className={cell}>{pod.aiLabel ? aiName : '—'}</td>
                  <td className={`${cell} text-right font-mono`}>
                    {typeof pod.aiConfidence === 'number'
                      ? `${Math.round(pod.aiConfidence * 100)}%`
                      : '—'}
                  </td>
                  <td className={`${cell} font-bold`}>
                    {pod.excluded ? 'Excluded' : getDiseaseName(diseases, pod.finalLabel)}
                  </td>
                  <td className={cell}>{getPodNote(pod, aiName)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-text-muted">
          Only the officer&apos;s final label is counted. AI agreed with the officer on{' '}
          {summary.aiAgreed} of {summary.counted} counted pods.
        </p>
      </section>

      {/* Recommended action */}
      <section
        aria-labelledby="report-action-heading"
        className={`flex flex-col gap-1 rounded-md border ${LINE} px-3.5 py-3`}
      >
        <h2 id="report-action-heading" className="text-[15px] font-bold">
          Recommended action{' '}
          <span className="text-xs font-semibold text-text-muted">
            (DEMO, to be verified by LKM)
          </span>
        </h2>
        {actions.map((item) => (
          <p key={item.code}>
            <b>
              {item.name} ({pluralPods(item.count)}):
            </b>{' '}
            {item.action}
          </p>
        ))}
      </section>

      {/* Officer notes */}
      <section aria-labelledby="report-notes-heading" className="flex flex-col gap-1">
        <h2 id="report-notes-heading" className="text-[15px] font-bold">
          Officer notes
        </h2>
        <p className="break-words whitespace-pre-line">{inspection.notes?.trim() || 'No notes.'}</p>
      </section>

      {/* Sign-off */}
      <section aria-label="Sign-off" className="mt-1.5 grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-1">
          <span className="h-8 border-b border-text" />
          <span className="text-xs text-text-muted">
            Field officer: {inspection.officer.name} · Date
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="h-8 border-b border-text" />
          <span className="text-xs text-text-muted">Reviewed by supervisor · Date</span>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`mt-auto flex flex-col gap-1.5 border-t ${LINE} pt-2 text-xs text-text-muted`}
      >
        <p>
          <b className="text-text">Severity scale (DEMO):</b> {formatSeverityScale()} of counted
          pods infected.
        </p>
        <p>
          <b className="text-text">Disclaimer:</b> {DISCLAIMER} AI suggestions were reviewed and
          confirmed by the field officer. Thresholds and actions are DEMO values until verified by
          Lembaga Koko Malaysia.
        </p>
        <div className="flex justify-between">
          <span>Generated by CocoaCheck Sabah · {formatDateTime(generatedAt)}</span>
          <span>Page 1 of 1</span>
        </div>
      </footer>
    </article>
  );
}

export default InspectionReport;
