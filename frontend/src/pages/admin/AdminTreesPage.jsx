import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { RotateCcw, SearchX } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import SelectField from '../../components/ui/SelectField';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import { listFarms, listTrees } from '../../services/inspectionService';
import { TREE_STATUS_FILTERS, matchesTreeStatus } from '../../utils/blockSummary';
import { formatVisitDate } from '../../utils/format';
import { adminTreePath } from '../../utils/inspectionRoutes';
import { DISCLAIMER } from '../../utils/reportHelpers';

// Admin · Layer 2: Trees (/admin/trees). Every registered tree with its latest result.
// Tree status = its latest COMPLETED inspection (DEMO rule in utils/blockSummary.js).
// Filters live in the URL (?block=…&status=…&q=…), so a refresh or Back keeps them.
const STATUS_LABELS = { all: 'All', attention: 'Medium or High', na: 'Not inspected' };

const COLUMNS = [
  'Tree',
  'Block',
  'Latest severity',
  '% infected',
  'Last inspected',
  'Officer',
  'Inspections',
];

const CELL = 'border-b border-border px-2 py-2 align-middle';
const LINK =
  'inline-flex min-h-11 items-center px-2 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// Only accept values we know; anything else in the URL counts as "all".
function readStatus(params) {
  const value = params.get('status');
  return TREE_STATUS_FILTERS.includes(value) ? value : 'all';
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} className="h-11 w-full" />
      ))}
    </div>
  );
}

function TreesTable({ trees }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <caption className="sr-only">Trees and their latest inspection</caption>
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
          {trees.map((tree) => {
            const { latest } = tree;
            const percent =
              typeof latest?.percentInfected === 'number' ? `${latest.percentInfected}%` : '—';

            return (
              <tr key={tree.id}>
                <th scope="row" className={`${CELL} font-mono font-semibold`}>
                  {tree.code}
                </th>
                <td className={`${CELL} whitespace-nowrap`}>{tree.block.name}</td>
                <td className={CELL}>
                  <SeverityBadge severity={tree.status} />
                </td>
                <td className={CELL}>{percent}</td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {latest ? formatVisitDate(latest.visitDate) : '—'}
                </td>
                <td className={CELL}>{latest ? latest.officer.name : '—'}</td>
                <td className={CELL}>{tree.inspectionCount}</td>
                <td className={`${CELL} whitespace-nowrap`}>
                  <Link to={adminTreePath(tree.id)} className={LINK}>
                    History<span className="sr-only"> of tree {tree.code}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminTreesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const status = readStatus(searchParams);
  const blockId = searchParams.get('block') ?? '';

  const [farms, setFarms] = useState([]);
  const [trees, setTrees] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Options for the Block filter. If they fail, the filter still offers "All blocks".
  useEffect(() => {
    let ignore = false;
    listFarms()
      .then((list) => {
        if (!ignore) setFarms(list);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Load with every filter except status, so the status control can show counts for each status.
  // While typing, the old rows stay on screen until the new ones arrive (no flashing skeleton).
  useEffect(() => {
    let ignore = false;

    listTrees({ blockId, q: query })
      .then((items) => {
        if (ignore) return;
        setTrees(items);
        setLoadState('success');
      })
      .catch((loadError) => {
        if (ignore) return;
        setError(loadError);
        setLoadState('error');
      });

    return () => {
      ignore = true;
    };
  }, [blockId, query, reloadCount]);

  function handleRetry() {
    setLoadState('loading');
    setError(null);
    setReloadCount((count) => count + 1);
  }

  // Change filters in the URL. "replace" stops every keystroke adding a Back-button step.
  function setFilters(changes) {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        for (const [key, value] of Object.entries(changes)) {
          if (!value || value === 'all') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        return next;
      },
      { replace: true }
    );
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  const visible = trees.filter((tree) => matchesTreeStatus(tree.status, status));

  const statusOptions = TREE_STATUS_FILTERS.map((value) => ({
    value,
    label: `${STATUS_LABELS[value]} · ${trees.filter((tree) => matchesTreeStatus(tree.status, value)).length}`,
  }));
  const blockOptions = [
    { value: '', label: 'All blocks' },
    ...farms.flatMap((farm) =>
      farm.blocks.map((block) => ({ value: block.id, label: block.name }))
    ),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Trees</h1>
        <p className="mt-1 text-text-muted">
          Every registered tree and its latest completed inspection.
        </p>
      </div>

      <Card className="md:p-6">
        <div role="group" aria-label="Filters" className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <SearchField
              label="Search tree code"
              value={query}
              onChange={(text) => setFilters({ q: text })}
              placeholder="Search tree code, e.g. A-01"
            />
          </div>
          <SelectField
            label="Block"
            value={blockId}
            onChange={(value) => setFilters({ block: value })}
            options={blockOptions}
            className="min-w-40"
          />
          <div className="w-full md:w-auto md:min-w-96">
            <SegmentedControl
              label="Latest severity"
              options={statusOptions}
              value={status}
              onChange={(value) => setFilters({ status: value })}
            />
          </div>
        </div>

        <div className="mt-5">
          {loadState === 'loading' && <TableSkeleton />}

          {loadState === 'error' && (
            <ErrorState title="Could not load trees" error={error} onRetry={handleRetry} />
          )}

          {loadState === 'success' && (
            <>
              {/* role="status" announces the new count to screen readers when filters change */}
              <p role="status" className="mb-2 text-sm text-text-muted">
                {visible.length} {visible.length === 1 ? 'tree' : 'trees'}
              </p>

              {visible.length > 0 ? (
                <TreesTable trees={visible} />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No trees match these filters."
                  actionLabel="Clear filters"
                  actionIcon={RotateCcw}
                  actionVariant="text"
                  onAction={clearFilters}
                />
              )}
            </>
          )}
        </div>
      </Card>

      <p className="text-xs text-text-muted">
        Latest severity = the tree&apos;s latest completed inspection (drafts don&apos;t count).
        Thresholds are DEMO values. {DISCLAIMER}
      </p>
    </div>
  );
}

export default AdminTreesPage;
