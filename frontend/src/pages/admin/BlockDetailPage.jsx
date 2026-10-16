import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { SearchX, TreeDeciduous } from 'lucide-react';
import TreeTile from '../../components/inspection/TreeTile';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import { getBlock } from '../../services/inspectionService';
import { formatVisitDate } from '../../utils/format';
import { ADMIN_BLOCKS_PATH } from '../../utils/inspectionRoutes';
import { SEVERITY_LABELS } from '../../utils/severity';

// Admin · Layer 2: Block detail (/admin/blocks/:blockId).
// Design: docs/design/pod/admin/L2-block-detail.html
// One tile per registered tree, coloured by its latest COMPLETED inspection (grey = not
// inspected). All numbers come from getBlock(); the DEMO rules are in utils/blockSummary.js.

// plural(1, 'tree') -> "1 tree", plural(8, 'tree') -> "8 trees"
function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-16 w-96 max-w-full" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function Breadcrumb({ farm, block }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/admin" className="font-medium text-primary hover:underline">
            Dashboard
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>{farm.name}</li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{block.name}</li>
      </ol>
    </nav>
  );
}

function PageHeader({ farm, block, totals }) {
  const lastInspected = totals.lastVisitDate
    ? `last inspected ${formatVisitDate(totals.lastVisitDate)}`
    : 'not inspected yet';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-text">{block.name}</h1>
        <p className="text-text-muted">
          {farm.name} · {plural(totals.treesRegistered, 'tree')} registered · {lastInspected}
        </p>
      </div>
      <SeverityBadge
        severity={totals.severity}
        label={`Block severity: ${SEVERITY_LABELS[totals.severity] ?? SEVERITY_LABELS.na}`}
        size="md"
      />
    </div>
  );
}

function BlockStats({ totals }) {
  const percent = typeof totals.percentInfected === 'number' ? ` · ${totals.percentInfected}%` : '';

  return (
    <section aria-label="Block summary" className="flex flex-col gap-2">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard
          label="Trees inspected"
          value={`${totals.treesInspected} of ${totals.treesRegistered}`}
        />
        <StatCard label="Pods checked" value={totals.podsChecked} />
        <StatCard label="Pods infected" value={`${totals.podsInfected}${percent}`} />
        <StatCard label="Trees Medium or High" value={totals.treesMediumOrHigh} />
      </div>
      {/* The dashboard counts every inspection in its period, so its numbers can differ. */}
      <p className="text-xs text-text-muted">
        Based on each tree&apos;s latest completed inspection.
      </p>
    </section>
  );
}

function TreesSection({ block, trees }) {
  return (
    <section aria-labelledby="trees-heading">
      <Card className="flex flex-col gap-4 md:p-6">
        <div>
          <h2 id="trees-heading" className="text-base font-semibold text-text">
            Trees in {block.name}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Each tile shows the tree&apos;s latest inspection. Click a tree to see its history.
          </p>
        </div>

        {trees.length === 0 ? (
          <EmptyState icon={TreeDeciduous} title="No trees registered in this block yet." />
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3.5">
            {trees.map((tree) => (
              <li key={tree.id} className="grid">
                <TreeTile tree={tree} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

function BlockDetailPage() {
  const { blockId } = useParams();

  const [data, setData] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    getBlock(blockId)
      .then((block) => {
        if (ignore) return;
        setData(block);
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
  }, [blockId, reloadCount]);

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
              title="Block not found"
              message="It may have been removed, or the link is wrong."
            />
            <Link
              to={ADMIN_BLOCKS_PATH}
              className="flex min-h-11 items-center justify-center font-semibold text-primary hover:underline"
            >
              Back to blocks
            </Link>
          </Card>
        ) : (
          <ErrorState title="Could not load this block" error={loadError} onRetry={handleRetry} />
        )}
      </div>
    );
  }

  const { farm, block, trees, totals } = data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumb farm={farm} block={block} />
      <PageHeader farm={farm} block={block} totals={totals} />
      <BlockStats totals={totals} />
      <TreesSection block={block} trees={trees} />
      <p className="text-xs text-text-muted">
        Block severity = highest latest severity among its trees (DEMO rule). Thresholds are DEMO
        values.
      </p>
    </div>
  );
}

export default BlockDetailPage;
