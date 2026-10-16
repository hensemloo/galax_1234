import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Printer } from 'lucide-react';
import InspectionReport from '../../components/inspection/InspectionReport';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { getInspection, listDiseases } from '../../services/inspectionService';
import { resumePath } from '../../utils/inspectionRoutes';
import { goBack } from '../../utils/navigation';

// Print page for "Download PDF" (Phase 1: the browser's print dialog -> "Save as PDF").
// Opened from the Report screen (O6) through downloadReport(id). No StaffLayout: only the A4
// report on a white page. The print dialog opens once, as soon as the report has loaded.
// Officers can only open their own completed inspections (the service checks, the backend
// will too).

function InspectionPrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const hasPrinted = useRef(false);

  useEffect(() => {
    let ignore = false;

    Promise.all([getInspection(id), listDiseases()])
      .then(([item, diseaseList]) => {
        if (ignore) return;
        setInspection(item);
        setDiseases(diseaseList);
        setGeneratedAt(new Date());
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

  const isPrintable = loadState === 'success' && inspection?.status === 'completed';

  // The browser uses the page title as the PDF file name, e.g. "CocoaCheck_A-01_2026-10-12".
  useEffect(() => {
    if (!isPrintable) return undefined;
    const previousTitle = document.title;
    document.title = `CocoaCheck_${inspection.tree.code}_${inspection.visitDate}`;
    return () => {
      document.title = previousTitle;
    };
  }, [isPrintable, inspection]);

  // Open the print dialog once, after the fonts are ready (so the layout is final).
  useEffect(() => {
    if (!isPrintable || hasPrinted.current) return;
    hasPrinted.current = true;
    document.fonts.ready.then(() => window.print());
  }, [isPrintable]);

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  // Not confirmed yet: no report. Carry on with the wizard instead.
  if (inspection?.status === 'draft') {
    return <Navigate to={resumePath(inspection)} replace />;
  }

  return (
    <div className="min-h-dvh bg-surface text-text">
      <div className="no-print sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[210mm] items-center justify-between gap-2 px-2 py-2">
          <Button variant="text" onClick={() => goBack(navigate, '/staff')}>
            <ChevronLeft className="size-5" aria-hidden="true" />
            Back
          </Button>
          {isPrintable && (
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" />
              Print / Save as PDF
            </Button>
          )}
        </div>
      </div>

      {loadState === 'loading' && (
        <div className="mx-auto max-w-[210mm] space-y-4 p-4" aria-hidden="true">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      )}

      {loadState === 'error' && (
        <div className="mx-auto max-w-md p-4">
          <ErrorState title="Could not load this report" error={loadError} onRetry={handleRetry} />
        </div>
      )}

      {isPrintable && (
        // On screen: an A4-wide sheet (scrolls sideways on a phone). On paper: the @page margins
        // from styles/index.css replace the padding.
        <div className="overflow-x-auto print:overflow-visible">
          <div className="mx-auto w-[210mm] p-[12mm] print:w-auto print:p-0">
            <InspectionReport
              inspection={inspection}
              diseases={diseases}
              generatedAt={generatedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InspectionPrintPage;
