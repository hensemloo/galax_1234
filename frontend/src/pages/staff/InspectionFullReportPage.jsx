import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import CountTiles from '../../components/inspection/CountTiles';
import RecommendedActionCard from '../../components/inspection/RecommendedActionCard';
import SeverityBox from '../../components/inspection/SeverityBox';
import CocoaPodIcon from '../../components/ui/CocoaPodIcon';
import ErrorState from '../../components/ui/ErrorState';
import PodLabel from '../../components/ui/PodLabel';
import Skeleton from '../../components/ui/Skeleton';
import { getInspection, listDiseases } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import { resumePath } from '../../utils/inspectionRoutes';
import {
  DISCLAIMER,
  formatPrevious,
  formatSeverityScale,
  getDiseaseName,
  getPodNote,
  getRecommendedActions,
} from '../../utils/reportHelpers';
import { summarisePods } from '../../utils/severity';

// O7: Full report, view only (phone layout of the A4 report). Owner: Anisa (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O7-full-report.html
// No Download or Share here: officers download only on the Report screen (O6) right after
// confirming. The header back arrow (StaffLayout) goes back one page, or Home if opened directly.

function Detail({ label, className = '', children }) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function FullReportSkeleton() {
  return (
    <div className="space-y-3.5" aria-hidden="true">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-24 w-full" />
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-19 w-full" />
      ))}
    </div>
  );
}

function InspectionFullReportPage() {
  const { id } = useParams();

  const [inspection, setInspection] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([getInspection(id), listDiseases()])
      .then(([item, diseaseList]) => {
        if (ignore) return;
        setInspection(item);
        setDiseases(diseaseList);
        setLoadState('success');
      })
      .catch((error) => {
        if (ignore) return;
        setLoadError(error);
        setLoadState('error');
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadCount]);

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  // Not confirmed yet: there is no report. Carry on with the wizard instead.
  if (inspection?.status === 'draft') {
    return <Navigate to={resumePath(inspection)} replace />;
  }

  if (loadState === 'loading') return <FullReportSkeleton />;

  if (loadState === 'error') {
    return (
      <ErrorState title="Could not load this report" error={loadError} onRetry={handleRetry} />
    );
  }

  // Same function as the Summary screen, A4 report and dashboard, so the numbers always match.
  const summary = summarisePods(inspection.pods);
  const actions = getRecommendedActions(summary, diseases);

  return (
    <div className="flex flex-col gap-3.5 text-[15px]">
      <div className="flex flex-col gap-0.5 border-b-2 border-primary-dark pb-2.5">
        <span className="text-xs font-semibold tracking-wide text-primary-dark">
          COCOACHECK SABAH
        </span>
        <h1 className="text-[21px] font-bold">Cocoa Pod Inspection Report</h1>
        <span className="text-[13px] text-text-muted">
          Report no. <span className="font-mono">{inspection.id}</span> · Completed (locked)
        </span>
      </div>

      <section
        aria-label="Inspection details"
        className="grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-xl border border-border bg-surface px-3.5 py-3"
      >
        <Detail label="Farm">{inspection.farm.name}</Detail>
        <Detail label="Block · Tree">
          {inspection.block.name} · <span className="font-mono">{inspection.tree.code}</span>
        </Detail>
        <Detail label="Visit date">{formatVisitDate(inspection.visitDate)}</Detail>
        <Detail label="Field officer">{inspection.officer.name}</Detail>
        <Detail label="Previous inspection" className="col-span-2">
          {formatPrevious(inspection.previous)}
        </Detail>
      </section>

      <SeverityBox summary={summary} layout="stacked" />

      <CountTiles
        compact
        items={[
          { label: 'Photos', value: summary.photos },
          { label: 'Counted', value: summary.counted },
          { label: 'Infected', value: summary.infected, danger: summary.infected > 0 },
          { label: 'Excluded', value: summary.excluded },
        ]}
      />

      <section aria-labelledby="pods-heading" className="flex flex-col gap-2">
        <h2 id="pods-heading" className="text-base font-bold">
          Pod results
        </h2>
        <ul className="flex flex-col gap-2">
          {inspection.pods.map((pod, index) => {
            const aiName = getDiseaseName(diseases, pod.aiLabel);
            const note = getPodNote(pod, aiName);
            return (
              <li
                key={pod.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5"
              >
                <span
                  className={`flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-soft text-primary-light ${
                    pod.excluded ? 'opacity-50' : ''
                  }`}
                >
                  {pod.photoUrl ? (
                    <img src={pod.photoUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <CocoaPodIcon className="size-7" />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13px] text-text-muted">
                    Pod {index + 1} · AI: {aiName} {Math.round(pod.aiConfidence * 100)}%
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    Final:
                    <PodLabel
                      label={pod.finalLabel}
                      name={getDiseaseName(diseases, pod.finalLabel)}
                      excluded={pod.excluded}
                    />
                  </span>
                  {note && <span className="text-xs text-primary">{note}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-text-muted">
          AI agreed with the officer on {summary.aiAgreed} of {summary.counted} counted pods.
        </p>
      </section>

      <RecommendedActionCard actions={actions} showNames />

      <section aria-labelledby="notes-heading" className="flex flex-col gap-1">
        <h2 id="notes-heading" className="text-base font-bold">
          Officer notes
        </h2>
        <p className="break-words whitespace-pre-line">{inspection.notes?.trim() || 'No notes.'}</p>
      </section>

      <div className="flex flex-col gap-1.5 border-t border-border pt-2.5 text-xs leading-relaxed text-text-muted">
        <p>
          <b className="text-text">Severity scale (DEMO):</b> {formatSeverityScale()}.
        </p>
        <p>{DISCLAIMER} Thresholds and actions are DEMO values until verified by LKM.</p>
      </div>
    </div>
  );
}

export default InspectionFullReportPage;
