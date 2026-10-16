import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { SearchX, TreeDeciduous } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import { getTree, listDiseases } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import {
  ADMIN_TREES_PATH,
  adminBlockPath,
  adminInspectionPath,
  adminReportPath,
} from '../../utils/inspectionRoutes';
import { DISCLAIMER, getDiseaseName, getRecommendedActions } from '../../utils/reportHelpers';
import { SEVERITY_LABELS } from '../../utils/severity';
import {
  describeChange,
  describeChart,
  formatBarLabel,
  formatMonthShort,
} from '../../utils/treeHistory';

// Admin · Layer 2: Tree history (/admin/trees/:treeId).
// Design: docs/design/pod/admin/L2-tree-history.html
// Every COMPLETED inspection of one tree (drafts are not history): a bar chart of % pods infected,
// a "What changed" note from the last two visits, and a table with the same numbers.
// The chart is plain divs (no chart library). Screen readers get one summary sentence for the
// chart, and the table below has the same data.

const CHART_TITLE = '% pods infected over time';

// Bar colour = severity dot colour. Full class names so Tailwind can find them.
const BAR_COLOURS = {
  none: 'bg-sev-none-dot',
  low: 'bg-sev-low-dot',
  medium: 'bg-sev-medium-dot',
  high: 'bg-sev-high-dot',
  na: 'bg-sev-na-dot',
};

const CELL = 'border-b border-border px-2 py-2 align-middle';
const LINK =
  'inline-flex min-h-11 items-center px-2 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// plural(1, 'inspection') -> "1 inspection", plural(3, 'inspection') -> "3 inspections"
function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function formatPercent(percentInfected) {
  return typeof percentInfected === 'number' ? `${percentInfected}%` : '—';
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-16 w-96 max-w-full" />
      <div className="flex flex-wrap gap-5">
        <Skeleton className="h-72 min-w-0 flex-[1_1_360px]" />
        <Skeleton className="h-72 min-w-0 flex-[1_1_280px]" />
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

function Breadcrumb({ block, tree }) {
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
          <Link to={adminBlockPath(block.id)} className="font-medium text-primary hover:underline">
            {block.name}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">Tree {tree.code}</li>
      </ol>
    </nav>
  );
}

function PageHeader({ tree, block, farm, inspections }) {
  const latest = inspections.at(-1);
  const since = inspections.length
    ? `${plural(inspections.length, 'inspection')} since ${formatMonthShort(inspections[0].visitDate)}`
    : 'Not inspected yet';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-text">
          Tree <span className="font-mono">{tree.code}</span>
        </h1>
        <p className="text-text-muted">
          {farm.name} · {block.name} · {since}
        </p>
      </div>
      {latest ? (
        <SeverityBadge
          severity={latest.severity}
          label={`Latest: ${SEVERITY_LABELS[latest.severity] ?? SEVERITY_LABELS.na}`}
          percent={latest.percentInfected ?? undefined}
          size="md"
        />
      ) : (
        <SeverityBadge severity="na" size="md" />
      )}
    </div>
  );
}

// One bar per inspection, oldest on the left. Height = % pods infected (0–100%);
// 0% (or nothing counted) still shows a thin 4px bar so every visit is visible.
function HistoryChart({ inspections }) {
  return (
    <section aria-labelledby="chart-heading" className="flex min-w-0 flex-[1_1_360px]">
      <Card className="flex w-full flex-col gap-3 md:p-6">
        <h2 id="chart-heading" className="text-lg font-bold text-text">
          {CHART_TITLE}
        </h2>
        <div className="overflow-x-auto">
          <div role="img" aria-label={describeChart(inspections)} className="min-w-fit">
            <div className="flex h-52 items-end gap-7 border-b border-border px-3">
              {inspections.map((entry) => (
                <div
                  key={entry.id}
                  className="flex h-full min-w-14 flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="text-sm font-semibold text-text">
                    {formatPercent(entry.percentInfected)}
                  </span>
                  {/* The value label sits above the bar, so the bar gets the rest of the height. */}
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className={`w-full max-w-16 rounded-t-md ${BAR_COLOURS[entry.severity] ?? BAR_COLOURS.na}`}
                      style={{ height: `${entry.percentInfected ?? 0}%`, minHeight: '4px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-7 px-3 pt-2">
              {inspections.map((entry) => (
                <span
                  key={entry.id}
                  className="min-w-14 flex-1 text-center text-xs text-text-muted"
                >
                  {formatBarLabel(entry, inspections)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function WhatChanged({ inspections, diseases }) {
  const latest = inspections.at(-1);
  const actions = getRecommendedActions(latest, diseases);
  const isDemo = actions.some((item) => item.source !== 'LKM');
  const showNames = actions.length > 1;

  return (
    <section aria-labelledby="change-heading" className="flex min-w-0 flex-[1_1_280px]">
      <Card className="flex w-full flex-col gap-3 md:p-6">
        <h2 id="change-heading" className="text-lg font-bold text-text">
          What changed
        </h2>
        <p className="leading-relaxed text-text">{describeChange(inspections, diseases)}</p>
        <div className="leading-relaxed text-text-muted">
          <p>Recommended action{isDemo ? ' (DEMO, to verify with LKM)' : ''}:</p>
          {actions.map((item) => (
            <p key={item.code}>
              {showNames && <b>{item.name}: </b>}
              {item.action}
            </p>
          ))}
        </div>
      </Card>
    </section>
  );
}

// "4 (1 excluded)" or "5"
function formatPods(entry) {
  return entry.excluded ? `${entry.counted} (${entry.excluded} excluded)` : `${entry.counted}`;
}

// "1 · 25%" (no % when nothing was counted)
function formatInfected(entry) {
  return typeof entry.percentInfected === 'number'
    ? `${entry.infected} · ${entry.percentInfected}%`
    : `${entry.infected}`;
}

// "Black pod rot (1)" or "—"
function formatDiseases(entry, diseases) {
  if (!entry.diseases?.length) return '—';
  return entry.diseases
    .map(({ code, count }) => `${getDiseaseName(diseases, code)} (${count})`)
    .join(', ');
}

function InspectionsTable({ tree, inspections, diseases }) {
  const newestFirst = [...inspections].reverse();

  return (
    <section aria-labelledby="list-heading">
      <Card className="flex flex-col gap-3.5 md:p-6">
        <h2 id="list-heading" className="text-lg font-bold text-text">
          All inspections of {tree.code}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Completed inspections of tree {tree.code}, newest first
            </caption>
            <thead>
              <tr className="text-xs tracking-wide text-text-muted uppercase">
                {['Date', 'Officer', 'Pods counted', 'Infected', 'Disease found', 'Severity'].map(
                  (column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-border px-2 py-2.5 font-semibold"
                    >
                      {column}
                    </th>
                  )
                )}
                <th scope="col" className="border-b border-border px-2 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {newestFirst.map((entry) => {
                const rowName = `${tree.code}, ${formatVisitDate(entry.visitDate)}`;
                return (
                  <tr key={entry.id}>
                    <td className={`${CELL} whitespace-nowrap`}>
                      {formatVisitDate(entry.visitDate)}
                    </td>
                    <td className={CELL}>{entry.officer.name}</td>
                    <td className={CELL}>{formatPods(entry)}</td>
                    <td className={CELL}>{formatInfected(entry)}</td>
                    <td className={CELL}>{formatDiseases(entry, diseases)}</td>
                    <td className={CELL}>
                      <SeverityBadge severity={entry.severity} />
                    </td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      <Link to={adminInspectionPath(entry.id)} className={LINK}>
                        View<span className="sr-only"> {rowName}</span>
                      </Link>
                      <span className="text-text-muted" aria-hidden="true">
                        ·
                      </span>
                      <Link to={adminReportPath(entry.id)} className={LINK}>
                        PDF<span className="sr-only"> report {rowName}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function TreeHistoryPage() {
  const { treeId } = useParams();

  const [data, setData] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([getTree(treeId), listDiseases()])
      .then(([tree, diseaseList]) => {
        if (ignore) return;
        setData(tree);
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
  }, [treeId, reloadCount]);

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-7xl">
        <HistorySkeleton />
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
              title="Tree not found"
              message="It may have been removed, or the link is wrong."
            />
            <Link
              to={ADMIN_TREES_PATH}
              className="flex min-h-11 items-center justify-center font-semibold text-primary hover:underline"
            >
              Back to trees
            </Link>
          </Card>
        ) : (
          <ErrorState title="Could not load this tree" error={loadError} onRetry={handleRetry} />
        )}
      </div>
    );
  }

  const { tree, block, farm, inspections } = data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumb block={block} tree={tree} />
      <PageHeader tree={tree} block={block} farm={farm} inspections={inspections} />

      {inspections.length === 0 ? (
        <Card>
          <EmptyState
            icon={TreeDeciduous}
            title="This tree hasn't been inspected yet."
            message="Its history appears here after an officer confirms an inspection."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-stretch gap-5">
            <HistoryChart inspections={inspections} />
            <WhatChanged inspections={inspections} diseases={diseases} />
          </div>
          <InspectionsTable tree={tree} inspections={inspections} diseases={diseases} />
        </>
      )}

      <p className="text-xs text-text-muted">
        Severity thresholds and recommended actions are DEMO values. {DISCLAIMER}
      </p>
    </div>
  );
}

export default TreeHistoryPage;
