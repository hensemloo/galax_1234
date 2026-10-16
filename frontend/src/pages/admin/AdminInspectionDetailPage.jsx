import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Download, PencilLine, SearchX } from 'lucide-react';
import CountTiles from '../../components/inspection/CountTiles';
import RecommendedActionCard from '../../components/inspection/RecommendedActionCard';
import SeverityBox from '../../components/inspection/SeverityBox';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CocoaPodIcon from '../../components/ui/CocoaPodIcon';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PodLabel from '../../components/ui/PodLabel';
import Skeleton from '../../components/ui/Skeleton';
import { getInspection, listDiseases } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import {
  ADMIN_INSPECTIONS_PATH,
  adminBlockPath,
  adminReportPath,
  adminTreePath,
} from '../../utils/inspectionRoutes';
import { DISCLAIMER, getDiseaseName, getRecommendedActions } from '../../utils/reportHelpers';
import { summarisePods } from '../../utils/severity';

// Admin · Layer 1: Inspection detail (/admin/inspections/:id).
// Design: docs/design/pod/admin/A3-inspection-detail.html
// Uses the same components and helpers as the officer's Summary (O5) and Full report (O7), so the
// supervisor and the officer always see the same numbers and wording.
// Supervisors can open any officer's inspection. A draft shows only the header and photo count:
// no severity and no report until the officer confirms.
// The "Model: …" line from the mockup is left out until the backend stores a model version.

// photos(1) -> "1 photo", photos(5) -> "5 photos"
function photos(count) {
  return `${count} ${count === 1 ? 'photo' : 'photos'}`;
}

function Breadcrumb({ inspection }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/admin" className="font-medium text-primary hover:underline">
            Dashboard
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            to={adminBlockPath(inspection.block.id)}
            className="font-medium text-primary hover:underline"
          >
            {inspection.block.name}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            to={adminTreePath(inspection.tree.id)}
            className="font-medium text-primary hover:underline"
          >
            Tree {inspection.tree.code}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{formatVisitDate(inspection.visitDate)}</li>
      </ol>
    </nav>
  );
}

function PageHeader({ inspection }) {
  const isCompleted = inspection.status === 'completed';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-text">
          Inspection · Tree <span className="font-mono">{inspection.tree.code}</span>
        </h1>
        <p className="text-text-muted">
          {inspection.farm.name} · {inspection.block.name} · {formatVisitDate(inspection.visitDate)}{' '}
          · Officer {inspection.officer.name} ·{' '}
          {isCompleted ? (
            <span className="font-semibold text-sev-none-text">Completed (locked)</span>
          ) : (
            <span className="font-semibold text-primary">Draft</span>
          )}
        </p>
      </div>
      {isCompleted && (
        <Link
          to={adminReportPath(inspection.id)}
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Button as="span">
            <Download className="size-5" aria-hidden="true" />
            Download PDF report
          </Button>
        </Link>
      )}
    </div>
  );
}

function SummaryCard({ inspection, summary }) {
  return (
    <section aria-labelledby="summary-heading">
      <Card className="flex h-full flex-col gap-3.5 md:p-6">
        <h2 id="summary-heading" className="text-lg font-bold text-text">
          Summary
        </h2>
        <SeverityBox summary={summary} layout="stacked" />
        <CountTiles
          items={[
            { label: 'Pods counted', value: summary.counted },
            { label: 'Infected', value: summary.infected, danger: summary.infected > 0 },
            { label: 'Excluded', value: summary.excluded },
          ]}
        />
        <p className="text-sm break-words whitespace-pre-line text-text-muted">
          Officer notes: {inspection.notes?.trim() ? `"${inspection.notes.trim()}"` : 'No notes.'}
        </p>
      </Card>
    </section>
  );
}

// Tag under a pod card. Full class names are written out so Tailwind can find them.
function PodTag({ pod }) {
  if (pod.excluded) {
    return (
      <span className="w-fit rounded-full bg-sev-na-bg px-2 py-0.5 text-xs font-bold text-sev-na-text">
        Unclear photo · not counted
      </span>
    );
  }
  if (pod.changedByOfficer) {
    return (
      <span className="w-fit rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
        Changed by officer
      </span>
    );
  }
  return null;
}

function PodCard({ pod, number, diseases }) {
  const name = `Pod ${number}`;
  const confidence =
    typeof pod.aiConfidence === 'number' ? ` · ${Math.round(pod.aiConfidence * 100)}%` : '';

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg">
      <div
        className={`flex h-35 items-center justify-center bg-primary-soft text-primary-light ${
          pod.excluded ? 'opacity-50' : ''
        }`}
      >
        {pod.photoUrl ? (
          <img src={pod.photoUrl} alt={`${name} photo`} className="size-full object-cover" />
        ) : (
          <CocoaPodIcon className="size-12" />
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <span className="font-bold">{name}</span>
        <span className="text-sm text-text-muted">
          AI: {pod.aiLabel ? getDiseaseName(diseases, pod.aiLabel) : 'Not analysed'}
          {confidence}
        </span>
        <span className="flex flex-wrap items-center gap-1 text-sm">
          Final:
          <PodLabel
            label={pod.finalLabel}
            name={getDiseaseName(diseases, pod.finalLabel)}
            excluded={pod.excluded}
          />
        </span>
        <PodTag pod={pod} />
      </div>
    </li>
  );
}

function PodsSection({ pods, diseases }) {
  return (
    <section aria-labelledby="pods-heading">
      <Card className="flex flex-col gap-4 md:p-6">
        <div className="flex flex-col gap-0.5">
          <h2 id="pods-heading" className="text-lg font-bold text-text">
            Pods ({photos(pods.length)})
          </h2>
          <p className="text-sm text-text-muted">
            AI label vs officer&apos;s final label. The final label is what counts.
          </p>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {pods.map((pod, index) => (
            <PodCard key={pod.id} pod={pod} number={index + 1} diseases={diseases} />
          ))}
        </ul>
      </Card>
    </section>
  );
}

function DraftNotice({ inspection }) {
  return (
    <Card className="flex items-start gap-3 md:p-6">
      <PencilLine className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-text">Draft — not confirmed yet</h2>
        <p className="text-sm text-text-muted">
          {photos(inspection.pods.length)} added. Severity, recommended action and the PDF report
          appear after the officer reviews the pods and confirms the inspection.
        </p>
      </div>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-16 w-full max-w-xl" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function AdminInspectionDetailPage() {
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

  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <DetailSkeleton />
      </div>
    );
  }

  if (loadState === 'error') {
    const isNotFound = loadError?.response?.status === 404;
    return (
      <div className="mx-auto max-w-xl">
        {isNotFound ? (
          <Card>
            <EmptyState
              icon={SearchX}
              title="Inspection not found"
              message="It may have been removed, or the link is wrong."
            />
            <Link
              to={ADMIN_INSPECTIONS_PATH}
              className="flex min-h-11 items-center justify-center font-semibold text-primary hover:underline"
            >
              Back to inspections
            </Link>
          </Card>
        ) : (
          <ErrorState
            title="Could not load this inspection"
            error={loadError}
            onRetry={handleRetry}
          />
        )}
      </div>
    );
  }

  const isCompleted = inspection.status === 'completed';
  // Same function as the officer's Summary, the A4 report and the dashboard.
  const summary = summarisePods(inspection.pods);
  const actions = getRecommendedActions(summary, diseases);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumb inspection={inspection} />
      <PageHeader inspection={inspection} />

      {isCompleted ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <SummaryCard inspection={inspection} summary={summary} />
            <RecommendedActionCard actions={actions} showNames badge="DEMO · to verify with LKM" />
          </div>

          <PodsSection pods={inspection.pods} diseases={diseases} />

          <section aria-labelledby="ai-check-heading">
            <Card className="flex flex-wrap items-center gap-x-6 gap-y-1 md:px-6">
              <h2 id="ai-check-heading" className="font-bold text-text">
                AI check
              </h2>
              <p className="text-sm">
                AI agreed with officer on{' '}
                <b>
                  {summary.aiAgreed} of {summary.counted}
                </b>{' '}
                counted pods
              </p>
            </Card>
          </section>
        </>
      ) : (
        <DraftNotice inspection={inspection} />
      )}

      <p className="text-xs text-text-muted">
        {DISCLAIMER} Severity thresholds and recommended actions are DEMO values.
      </p>
    </div>
  );
}

export default AdminInspectionDetailPage;
