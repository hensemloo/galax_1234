import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { TriangleAlert } from 'lucide-react';
import CheckPodSheet from '../../components/inspection/CheckPodSheet';
import Button from '../../components/ui/Button';
import CocoaPodIcon from '../../components/ui/CocoaPodIcon';
import ErrorState from '../../components/ui/ErrorState';
import PodLabel from '../../components/ui/PodLabel';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import StaffWizardLayout from '../../layouts/StaffWizardLayout';
import { getInspection, listDiseases } from '../../services/inspectionService';
import { formatShortDate, pluralPods } from '../../utils/format';
import { inspectionPath, isAnalysed, wizardStepPath } from '../../utils/inspectionRoutes';
import { canContinueReview, isAiUnsure } from '../../utils/inspectionRules';
import { summarisePods } from '../../utils/severity';

// O4: Review pods (step 3 of 4: Review). Owner: Jax (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O4-review-pods.html
// Tapping a row (or its Check / Change button) opens the O4b "Check pod" sheet.

// A pod the officer still has to check: AI unsure, not checked yet, still counted.
function needsCheck(pod) {
  return !pod.excluded && isAiUnsure(pod) && !pod.reviewed;
}

// The small tag under the label. Returns { text, className } or null.
function podTag(pod, aiName) {
  if (needsCheck(pod)) {
    return { text: 'AI unsure, please check', className: 'bg-sev-medium-bg text-sev-medium-text' };
  }
  if (pod.excluded) {
    return { text: 'Unclear photo · not counted', className: 'bg-sev-na-bg text-sev-na-text' };
  }
  if (pod.finalLabel !== pod.aiLabel) {
    return {
      text: `Checked · changed by you (AI said ${aiName})`,
      className: 'bg-primary-soft text-primary',
    };
  }
  if (isAiUnsure(pod) && pod.reviewed) {
    return { text: 'Checked by you', className: 'bg-primary-soft text-primary' };
  }
  return null;
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-16 w-full" />
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-21 w-full" />
      ))}
    </div>
  );
}

function ReviewPodsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [selectedPodId, setSelectedPodId] = useState(null);
  // The Check / Change button of each row, so focus can go back to it when the sheet closes.
  const buttonRefs = useRef({});

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

  function handleSheetClose() {
    const podId = selectedPodId;
    setSelectedPodId(null);
    buttonRefs.current[podId]?.focus();
  }

  // A completed inspection is locked: show its report instead.
  if (inspection?.status === 'completed') {
    return <Navigate to={inspectionPath(id)} replace />;
  }
  // Not analysed yet (or new photos were added since): go back to the photos step.
  if (inspection && !isAnalysed(inspection)) {
    return <Navigate to={wizardStepPath(id, 2)} replace />;
  }

  const pods = inspection?.pods ?? [];
  const diseaseName = (code) => diseases.find((item) => item.code === code)?.nameEn;
  // Live numbers from the current labels (same function as the summary, report and dashboard).
  const summary = summarisePods(pods);
  const toCheckCount = pods.filter(needsCheck).length;
  // Every photo excluded: nothing to count, so the summary would be empty.
  const allExcluded = pods.length > 0 && summary.counted === 0;
  const canContinue = pods.length > 0 && !allExcluded && canContinueReview(pods);
  const selectedIndex = pods.findIndex((pod) => pod.id === selectedPodId);
  const selectedPod = pods[selectedIndex];

  const subtitle = inspection && (
    <>
      {inspection.block.name} · <span className="font-mono">{inspection.tree.code}</span> ·{' '}
      {formatShortDate(inspection.visitDate)}
    </>
  );

  const footer =
    loadState === 'success' ? (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
          {allExcluded ? (
            <>
              <span>
                {pluralPods(summary.photos)} ·{' '}
                <span className="text-text-muted">{summary.excluded} excluded</span>
              </span>
              <span className="shrink-0 font-semibold text-text-muted">No pods counted</span>
            </>
          ) : (
            <>
              <span>
                {pluralPods(summary.counted)} ·{' '}
                <b>
                  {summary.infected} infected ({summary.percentInfected}%)
                </b>
                {summary.excluded > 0 && (
                  <span className="text-text-muted"> · {summary.excluded} excluded</span>
                )}
              </span>
              <SeverityBadge severity={summary.severity} demo className="shrink-0" />
            </>
          )}
        </div>
        <Button
          fullWidth
          disabled={!canContinue}
          onClick={() => navigate(wizardStepPath(id, 4))}
          className="min-h-13 text-[17px] font-semibold"
        >
          Continue to summary
        </Button>
        {allExcluded && (
          <p className="text-center text-xs text-text-muted">
            All pods are excluded.{' '}
            <Link to={wizardStepPath(id, 2)} className="font-semibold text-primary underline">
              Add clearer photos
            </Link>{' '}
            to continue.
          </p>
        )}
        {!allExcluded && toCheckCount > 0 && (
          <p className="text-center text-xs text-text-muted">
            Check {toCheckCount} more {toCheckCount === 1 ? 'pod' : 'pods'} to continue.
          </p>
        )}
      </div>
    ) : null;

  return (
    <StaffWizardLayout
      step={3}
      subtitle={subtitle}
      onBack={() => navigate(wizardStepPath(id, 2))}
      footer={footer}
    >
      {loadState === 'loading' && <ReviewSkeleton />}

      {loadState === 'error' && (
        <ErrorState
          title="Could not load this inspection"
          error={loadError}
          onRetry={handleRetry}
        />
      )}

      {loadState === 'success' && (
        <div className="space-y-3">
          {toCheckCount > 0 && (
            <p className="flex items-start gap-2.5 rounded-xl bg-sev-medium-bg px-3.5 py-3 text-sm leading-snug text-sev-medium-text">
              <TriangleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
              <span>
                <b>AI is unsure about {pluralPods(toCheckCount)}.</b> Check each one before you
                continue. Tap any pod to change its label.
              </span>
            </p>
          )}

          <ul className="space-y-3">
            {pods.map((pod, index) => {
              const name = `Pod ${index + 1}`;
              const mustCheck = needsCheck(pod);
              const tag = podTag(pod, diseaseName(pod.aiLabel) ?? pod.aiLabel);

              return (
                // The whole row opens the sheet (bigger tap area). Keyboard and screen-reader
                // users use the real <button> inside, so the row itself needs no role.
                <li
                  key={pod.id}
                  onClick={() => setSelectedPodId(pod.id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl bg-surface p-2.5 ${
                    mustCheck ? 'border-2 border-sev-medium-dot' : 'border border-border'
                  }`}
                >
                  <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded bg-primary-soft text-primary-light">
                    {pod.photoUrl ? (
                      <img src={pod.photoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <CocoaPodIcon className="size-8" />
                    )}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <span className="text-sm text-text-muted">
                      {name} · AI {Math.round(pod.aiConfidence * 100)}%
                    </span>
                    <PodLabel
                      label={pod.finalLabel}
                      name={diseaseName(pod.finalLabel)}
                      excluded={pod.excluded}
                    />
                    {tag && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${tag.className}`}
                      >
                        {tag.text}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    ref={(element) => {
                      buttonRefs.current[pod.id] = element;
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPodId(pod.id);
                    }}
                    className={`flex min-h-11 min-w-18 shrink-0 items-center justify-center rounded-[10px] px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      mustCheck
                        ? 'border border-sev-medium-text bg-sev-medium-text text-white'
                        : 'border border-primary/40 bg-surface text-primary hover:bg-bg'
                    }`}
                  >
                    {mustCheck ? 'Check' : 'Change'}
                    <span className="sr-only"> {name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedPod && (
        <CheckPodSheet
          key={selectedPod.id}
          inspectionId={id}
          pod={selectedPod}
          podName={`Pod ${selectedIndex + 1}`}
          diseases={diseases}
          onSaved={setInspection}
          onClose={handleSheetClose}
        />
      )}
    </StaffWizardLayout>
  );
}

export default ReviewPodsPage;
