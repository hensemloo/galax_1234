import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import BlockTileGrid from '../../components/inspection/BlockTileGrid';
import InspectionTable from '../../components/inspection/InspectionTable';
import SeverityLegend from '../../components/inspection/SeverityLegend';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SelectField from '../../components/ui/SelectField';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import {
  getDashboard,
  listBlocks,
  listFarms,
  listOfficers,
} from '../../services/inspectionService';
import { formatShortDate } from '../../utils/format';
import { ADMIN_INSPECTIONS_PATH, adminInspectionPath } from '../../utils/inspectionRoutes';
import { DEFAULT_PERIOD, getPeriodOptions } from '../../utils/period';
import { DISCLAIMER, formatSeverityScale } from '../../utils/reportHelpers';

// Admin · Layer 1: Dashboard (/admin). Design: docs/design/pod/admin/A1-dashboard.html
// Layer 1: summary cards, Trees needing attention, Recent inspections.
// Layer 2: Block overview tiles (Farm filter only: a block's colour is its trees' LATEST status).
// (The charts = Layer 3 are added later.)

// plural(1, 'draft') -> "1 draft", plural(2, 'draft') -> "2 drafts"
function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7" aria-hidden="true">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function SummaryCards({ kpis, periodLabel }) {
  const percent = typeof kpis.percentInfected === 'number' ? ` · ${kpis.percentInfected}%` : '';

  return (
    <section
      aria-label="Summary"
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
    >
      <StatCard
        label="Inspections completed"
        value={kpis.completed}
        sub={`${periodLabel} · ${plural(kpis.draftsPending, 'draft')} pending`}
      />
      <StatCard
        label="Pods checked"
        value={kpis.podsChecked}
        sub={`${plural(kpis.podsExcluded, 'photo')} excluded as unclear`}
      />
      <StatCard
        label="Pods infected"
        value={`${kpis.podsInfected}${percent}`}
        sub="Final labels confirmed by officers"
      />
      <StatCard
        label="Trees Medium or High"
        value={kpis.treesNeedingAttention}
        sub={`Across ${plural(kpis.blocksNeedingAttention, 'block')}`}
      />
    </section>
  );
}

function BlockOverview({ blocks }) {
  return (
    <section aria-labelledby="blocks-heading">
      <Card className="flex flex-col gap-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="blocks-heading" className="text-base font-semibold text-text">
              Block overview
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              Colour = highest latest severity of any tree in the block. Click a block to see its
              trees.
            </p>
          </div>
          <SeverityLegend />
        </div>
        <BlockTileGrid blocks={blocks} />
      </Card>
    </section>
  );
}

function TreesNeedingAttention({ trees, periodPhrase }) {
  return (
    <section aria-labelledby="attention-heading">
      <Card className="md:p-6">
        <h2 id="attention-heading" className="text-base font-semibold text-text">
          Trees needing attention
        </h2>
        <p className="mt-0.5 text-sm text-text-muted">Latest inspection is Medium or High</p>

        {trees.length === 0 ? (
          <EmptyState icon={ShieldCheck} title={`No trees need attention in ${periodPhrase}.`} />
        ) : (
          <ul className="mt-3">
            {trees.map((tree) => (
              <li key={tree.inspectionId} className="border-t border-border">
                <Link
                  to={adminInspectionPath(tree.inspectionId)}
                  className="flex min-h-11 flex-wrap items-center justify-between gap-2.5 px-1 py-3 hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-semibold text-text">{tree.tree.code}</span>
                    <span className="text-sm text-text-muted">
                      {tree.block.name} · {formatShortDate(tree.visitDate)} · {tree.officer.name}
                    </span>
                  </span>
                  <SeverityBadge severity={tree.severity} percent={tree.percentInfected} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

function RecentInspections({ inspections, periodPhrase }) {
  return (
    <Card
      className="md:p-6"
      title="Recent inspections"
      action={
        <Link
          to={ADMIN_INSPECTIONS_PATH}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
        >
          View all inspections
        </Link>
      }
    >
      {inspections.length === 0 ? (
        <EmptyState icon={ClipboardList} title={`No inspections in ${periodPhrase}.`} />
      ) : (
        <InspectionTable inspections={inspections} caption="Recent inspections, newest first" />
      )}
    </Card>
  );
}

function AdminDashboardPage() {
  // Read the clock once when the page opens (the Period options and their dates).
  const [periodOptions] = useState(() => getPeriodOptions(new Date()));

  // Filters. '' = all farms / all officers.
  const [farmId, setFarmId] = useState('');
  const [periodValue, setPeriodValue] = useState(DEFAULT_PERIOD);
  const [officerId, setOfficerId] = useState('');

  const [farms, setFarms] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [dashboard, setDashboard] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  const period =
    periodOptions.find((option) => option.value === periodValue) ??
    periodOptions.find((option) => option.value === DEFAULT_PERIOD);

  // Options for the Farm and Officer filters. If they fail, the filters still offer "All".
  useEffect(() => {
    let ignore = false;
    Promise.all([listFarms(), listOfficers()])
      .then(([farmList, officerList]) => {
        if (ignore) return;
        setFarms(farmList);
        setOfficers(officerList);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Load the dashboard, and again whenever a filter changes or after "Try again".
  useEffect(() => {
    let ignore = false;

    Promise.all([
      getDashboard({ farmId, officerId, from: period.from, to: period.to }),
      listBlocks({ farmId }),
    ])
      .then(([data, blockList]) => {
        if (ignore) return;
        setDashboard(data);
        setBlocks(blockList);
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
  }, [farmId, officerId, period.from, period.to, reloadCount]);

  // Show the skeleton again while new numbers load, so old numbers are never shown as new ones.
  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setLoadState('loading');
      setError(null);
    };
  }

  function handleRetry() {
    setLoadState('loading');
    setError(null);
    setReloadCount((count) => count + 1);
  }

  const farmOptions = [
    { value: '', label: 'All farms' },
    ...farms.map((farm) => ({ value: farm.id, label: farm.name })),
  ];
  const officerOptions = [
    { value: '', label: 'All officers' },
    ...officers.map((officer) => ({ value: officer.id, label: officer.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="mt-1 text-text-muted">
            Latest pod inspections across your farm. Severity uses DEMO thresholds.
          </p>
        </div>

        <div role="group" aria-label="Filters" className="flex flex-wrap gap-2.5">
          <SelectField
            label="Farm"
            value={farmId}
            onChange={changeFilter(setFarmId)}
            options={farmOptions}
            className="min-w-48"
          />
          <SelectField
            label="Period"
            value={periodValue}
            onChange={changeFilter(setPeriodValue)}
            options={periodOptions}
            className="min-w-40"
          />
          <SelectField
            label="Officer"
            value={officerId}
            onChange={changeFilter(setOfficerId)}
            options={officerOptions}
            className="min-w-40"
          />
        </div>
      </div>

      {loadState === 'loading' && <DashboardSkeleton />}

      {loadState === 'error' && (
        <ErrorState title="Could not load the dashboard" error={error} onRetry={handleRetry} />
      )}

      {loadState === 'success' && dashboard && (
        <>
          <SummaryCards kpis={dashboard.kpis} periodLabel={period.label} />
          <BlockOverview blocks={blocks} />
          <TreesNeedingAttention trees={dashboard.attention} periodPhrase={period.phrase} />
          <RecentInspections inspections={dashboard.recent} periodPhrase={period.phrase} />
        </>
      )}

      <p className="text-xs text-text-muted">
        Severity thresholds are DEMO values (by % of pods infected): {formatSeverityScale()}.{' '}
        {DISCLAIMER}
      </p>
    </div>
  );
}

export default AdminDashboardPage;
