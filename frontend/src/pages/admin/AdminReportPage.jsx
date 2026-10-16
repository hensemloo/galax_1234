import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { Printer, SearchX } from 'lucide-react';
import InspectionReport from '../../components/inspection/InspectionReport';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { getInspection, listDiseases } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import { ADMIN_INSPECTIONS_PATH, adminInspectionPath } from '../../utils/inspectionRoutes';

// Admin · Layer 1: Report view (/admin/inspections/:id/report).
// Design: docs/design/pod/admin/A4-report-view.html
// The same A4 report as the officer's Download PDF (components/inspection/InspectionReport.jsx),
// shown as a white sheet. ONE "Print / Save as PDF" button opens the browser's print dialog (in the
// browser, Print and Download PDF are the same dialog, so the mockup's two buttons are merged).
// On paper only the report is printed: the header here and the admin sidebar/top bar are
// .no-print, and the sheet's shadow and padding are removed (the @page margins replace them).
// Supervisors can open any officer's report. A draft has no report -> back to the detail page.

function ReportSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-16 w-full max-w-xl" />
      <Skeleton className="mx-auto h-[600px] w-full max-w-[210mm]" />
    </div>
  );
}

function AdminReportPage() {
  const { id } = useParams();

  const [inspection, setInspection] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
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

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  // Not confirmed yet: there is no report. Show the inspection detail instead.
  if (inspection?.status === 'draft') {
    return <Navigate to={adminInspectionPath(inspection.id)} replace />;
  }

  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <ReportSkeleton />
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
              title="Report not found"
              message="This inspection may have been removed, or the link is wrong."
            />
            <Link
              to={ADMIN_INSPECTIONS_PATH}
              className="flex min-h-11 items-center justify-center font-semibold text-primary hover:underline"
            >
              Back to inspections
            </Link>
          </Card>
        ) : (
          <ErrorState title="Could not load this report" error={loadError} onRetry={handleRetry} />
        )}
      </div>
    );
  }

  const detailPath = adminInspectionPath(inspection.id);
  const visitDate = formatVisitDate(inspection.visitDate);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="no-print flex flex-col gap-5">
        <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/admin" className="font-medium text-primary hover:underline">
                Dashboard
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            {/* Plain text for now: the tree history page comes in Layer 2. */}
            <li>Tree {inspection.tree.code}</li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={detailPath} className="font-medium text-primary hover:underline">
                {visitDate}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Report</li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-text">
              Inspection report · <span className="font-mono">{inspection.tree.code}</span>
            </h1>
            <p className="text-text-muted">
              {inspection.block.name} · {visitDate} · Officer {inspection.officer.name} · A4, 1 page
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to={detailPath}
              className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Button as="span" variant="secondary">
                Back to inspection
              </Button>
            </Link>
            <Button onClick={() => window.print()}>
              <Printer className="size-5" aria-hidden="true" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* On screen: a white A4 sheet on a darker backdrop (scrolls sideways if the window is
          narrow). On paper: no backdrop, shadow or padding, just the report. */}
      <div className="overflow-x-auto rounded-xl bg-primary-soft px-4 py-8 print:overflow-visible print:rounded-none print:bg-transparent print:p-0">
        <div className="mx-auto w-[210mm] border border-border bg-surface p-[12mm] shadow-lg print:w-auto print:border-0 print:p-0 print:shadow-none">
          <InspectionReport inspection={inspection} diseases={diseases} generatedAt={generatedAt} />
        </div>
      </div>
    </div>
  );
}

export default AdminReportPage;
