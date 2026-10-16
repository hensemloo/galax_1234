import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import CountTiles from '../../components/inspection/CountTiles';
import RecommendedActionCard from '../../components/inspection/RecommendedActionCard';
import SeverityBox from '../../components/inspection/SeverityBox';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StaffWizardLayout from '../../layouts/StaffWizardLayout';
import { confirmInspection, getInspection, listDiseases } from '../../services/inspectionService';
import { formatShortDate, pluralPods } from '../../utils/format';
import { reportPath, wizardStepPath } from '../../utils/inspectionRoutes';
import { canContinueReview } from '../../utils/inspectionRules';
import { DISCLAIMER, getDiseaseName, getRecommendedActions } from '../../utils/reportHelpers';
import { HEALTHY_LABEL, summarisePods } from '../../utils/severity';

// O5: Summary + Confirm (step 4 of 4: Summary). Owner: Anisa (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O5-summary-confirm.html
// Confirm locks the inspection, then the officer lands on the Report screen (O6).

function SummarySkeleton() {
  return (
    <div className="space-y-3.5" aria-hidden="true">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-3 gap-2.5">
        <Skeleton className="h-18" />
        <Skeleton className="h-18" />
        <Skeleton className="h-18" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

function InspectionSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

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

  function handleCancelDialog() {
    setIsDialogOpen(false);
    setConfirmError(null);
  }

  async function handleConfirm() {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await confirmInspection(id);
      // replace: the summary step leaves the history, so Back from the report can't reopen
      // the wizard of a locked inspection.
      navigate(reportPath(id), { replace: true });
    } catch (error) {
      setConfirmError(error.userMessage ?? 'Could not confirm the inspection. Please try again.');
      setIsConfirming(false);
    }
  }

  const goToReview = () => navigate(wizardStepPath(id, 3));
  const pods = inspection?.pods ?? [];
  // Same function as the review step, report and dashboard, so the numbers always match.
  const summary = summarisePods(pods);

  // Already confirmed (e.g. opened from an old link): show its report instead.
  if (inspection?.status === 'completed') {
    return <Navigate to={reportPath(id)} replace />;
  }
  // Not ready yet (unchecked "AI unsure" pods, or nothing counted): finish the review first.
  // The review step itself sends not-analysed drafts back to the photos step.
  if (inspection && (!canContinueReview(pods) || summary.counted === 0)) {
    return <Navigate to={wizardStepPath(id, 3)} replace />;
  }

  const actions = getRecommendedActions(summary, diseases);
  const healthyCount = summary.counted - summary.infected;

  const subtitle = inspection && (
    <>
      {inspection.block.name} · <span className="font-mono">{inspection.tree.code}</span> ·{' '}
      {formatShortDate(inspection.visitDate)} · {inspection.officer.name}
    </>
  );

  const footer =
    loadState === 'success' ? (
      <div className="flex flex-col gap-2">
        <p className="text-center text-[13px] text-text-muted">
          After confirming, this inspection can&apos;t be edited.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={goToReview} className="min-h-13 font-semibold">
            Back to review
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="min-h-13 font-semibold">
            Confirm
          </Button>
        </div>
      </div>
    ) : null;

  return (
    <StaffWizardLayout step={4} subtitle={subtitle} onBack={goToReview} footer={footer}>
      {loadState === 'loading' && <SummarySkeleton />}

      {loadState === 'error' && (
        <ErrorState
          title="Could not load this inspection"
          error={loadError}
          onRetry={handleRetry}
        />
      )}

      {loadState === 'success' && (
        <div className="flex flex-col gap-3.5">
          <SeverityBox summary={summary} layout="inline" />

          <CountTiles
            items={[
              { label: 'Pods counted', value: summary.counted },
              { label: 'Infected', value: summary.infected, danger: summary.infected > 0 },
              { label: 'Excluded', value: summary.excluded },
            ]}
          />

          <section
            aria-labelledby="found-heading"
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3.5"
          >
            <h2 id="found-heading" className="text-base font-bold">
              Found
            </h2>
            <ul className="flex flex-col gap-2 text-[15px]">
              {summary.diseases.map((item) => (
                <li key={item.code} className="flex justify-between gap-3">
                  <span>{getDiseaseName(diseases, item.code)}</span>
                  <span className="font-semibold">{pluralPods(item.count)}</span>
                </li>
              ))}
              {healthyCount > 0 && (
                <li className="flex justify-between gap-3">
                  <span>{getDiseaseName(diseases, HEALTHY_LABEL)}</span>
                  <span className="font-semibold">{pluralPods(healthyCount)}</span>
                </li>
              )}
            </ul>
            <p className="text-[13px] text-text-muted">
              AI agreed with you on {summary.aiAgreed} of {summary.counted} counted pods.
            </p>
          </section>

          <RecommendedActionCard actions={actions} showNames={actions.length > 1} />

          <p className="text-xs leading-snug text-text-muted">
            {DISCLAIMER} Thresholds and actions are DEMO values.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={isDialogOpen}
        title="Confirm inspection?"
        message="Once confirmed, this inspection is locked and sent to your supervisor."
        confirmLabel="Confirm"
        loading={isConfirming}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={handleCancelDialog}
      />
    </StaffWizardLayout>
  );
}

export default InspectionSummaryPage;
