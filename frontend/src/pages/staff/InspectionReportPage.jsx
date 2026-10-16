import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { Check, Download, House, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import CocoaPodIcon from '../../components/ui/CocoaPodIcon';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { downloadReport, getInspection } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import { NEW_INSPECTION_PATH, inspectionPath, resumePath } from '../../utils/inspectionRoutes';
import { SEVERITY_LABELS, summarisePods } from '../../utils/severity';

// O6: Report, shown right after confirming. Owner: Anisa (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O6-report.html
// This is the ONLY place an officer can download the PDF. The full report (O7) is view only.
const MAX_THUMBNAILS = 5;

// Severity text colour (written out so Tailwind can find the class names).
const SEVERITY_TEXT = {
  none: 'text-sev-none-text',
  low: 'text-sev-low-text',
  medium: 'text-sev-medium-text',
  high: 'text-sev-high-text',
  na: 'text-sev-na-text',
};

function ReportSkeleton() {
  return (
    <div className="space-y-3.5" aria-hidden="true">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

function InspectionReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let ignore = false;

    getInspection(id)
      .then((item) => {
        if (ignore) return;
        setInspection(item);
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

  async function handleDownload() {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // The print page: shows the A4 report and opens the browser's "Save as PDF" dialog.
      navigate(await downloadReport(id));
    } catch (error) {
      setDownloadError(error.userMessage ?? 'Could not download the report. Please try again.');
      setIsDownloading(false);
    }
  }

  // Not confirmed yet: carry on with the wizard instead.
  if (inspection?.status === 'draft') {
    return <Navigate to={resumePath(inspection)} replace />;
  }

  if (loadState === 'loading') return <ReportSkeleton />;

  if (loadState === 'error') {
    return (
      <ErrorState title="Could not load this report" error={loadError} onRetry={handleRetry} />
    );
  }

  const summary = summarisePods(inspection.pods);
  const severity = SEVERITY_TEXT[summary.severity] ? summary.severity : 'na';
  const thumbnails = inspection.pods.slice(0, MAX_THUMBNAILS);
  const photoCount = inspection.pods.length;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-3.5">
      <div
        role="status"
        className="flex items-center gap-2.5 rounded-xl bg-sev-none-bg px-3.5 py-3 text-sev-none-text"
      >
        <Check className="size-5.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="font-bold">Inspection confirmed</span>
          <span className="text-[13px]">Locked and sent to your supervisor</span>
        </div>
      </div>

      <Link
        to={inspectionPath(id)}
        className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4 text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
          <span className="text-[15px] font-bold">Your inspection report</span>
          <span className="text-xs font-semibold text-text-muted">A4 · 1 page</span>
        </span>

        <span className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <span className="text-text-muted">Farm</span>
          <span>{inspection.farm.name}</span>
          <span className="text-text-muted">Block · Tree</span>
          <span>
            {inspection.block.name} · <span className="font-mono">{inspection.tree.code}</span>
          </span>
          <span className="text-text-muted">Date · Officer</span>
          <span>
            {formatVisitDate(inspection.visitDate)} · {inspection.officer.name}
          </span>
          <span className="text-text-muted">Severity (DEMO)</span>
          <span className={`font-bold ${SEVERITY_TEXT[severity]}`}>
            {SEVERITY_LABELS[severity]}
            {typeof summary.percentInfected === 'number' && ` · ${summary.percentInfected}%`}
          </span>
        </span>

        <span className="grid grid-cols-5 gap-1" aria-hidden="true">
          {thumbnails.map((pod) => (
            <span
              key={pod.id}
              className={`flex h-11 items-center justify-center overflow-hidden rounded-sm bg-primary-soft text-primary-light ${
                pod.excluded ? 'opacity-50' : ''
              }`}
            >
              {pod.photoUrl ? (
                <img src={pod.photoUrl} alt="" className="size-full object-cover" />
              ) : (
                <CocoaPodIcon className="size-6" />
              )}
            </span>
          ))}
        </span>

        <span className="text-[11px] text-text-muted">
          {photoCount} pod {photoCount === 1 ? 'photo' : 'photos'} with AI label and final label ·
          summary · recommended action
        </span>
        <span className="border-t border-border pt-2 text-[13px] font-bold text-primary">
          Open full report ›
        </span>
      </Link>

      <Button
        variant="secondary"
        fullWidth
        loading={isDownloading}
        onClick={handleDownload}
        className="min-h-12.5 font-semibold"
      >
        {!isDownloading && <Download className="size-5" aria-hidden="true" />}
        Download PDF
      </Button>
      {downloadError && (
        <p role="alert" className="text-sm text-danger">
          {downloadError}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <Button
          fullWidth
          onClick={() => navigate('/staff')}
          className="min-h-13 text-[17px] font-semibold"
        >
          <House className="size-5" aria-hidden="true" />
          Back to My inspections
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(NEW_INSPECTION_PATH)}
          className="min-h-13 text-[17px] font-semibold"
        >
          <Plus className="size-5" aria-hidden="true" />
          Start next inspection
        </Button>
      </div>
    </div>
  );
}

export default InspectionReportPage;
