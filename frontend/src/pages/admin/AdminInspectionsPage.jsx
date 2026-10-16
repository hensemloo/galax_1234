import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { RotateCcw, SearchX } from 'lucide-react';
import InspectionTable from '../../components/inspection/InspectionTable';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import SelectField from '../../components/ui/SelectField';
import Skeleton from '../../components/ui/Skeleton';
import TextField from '../../components/ui/TextField';
import { listInspections, listOfficers } from '../../services/inspectionService';
import { toIsoDate } from '../../utils/format';
import { DISCLAIMER } from '../../utils/reportHelpers';

// Admin · Layer 1: Inspections (/admin/inspections). Every officer's inspections, newest first.
// Same table as the dashboard's "Recent inspections" (components/inspection/InspectionTable.jsx).
// Filters live in the URL (?q=…&status=…&officer=…&from=…&to=…), so a refresh or Back keeps them.
const STATUS_VALUES = ['all', 'draft', 'completed'];
const STATUS_LABELS = { all: 'All', draft: 'Drafts', completed: 'Completed' };

// Only accept values we know; anything else in the URL counts as "all".
function readStatus(params) {
  const value = params.get('status');
  return STATUS_VALUES.includes(value) ? value : 'all';
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

function AdminInspectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [today] = useState(() => toIsoDate(new Date()));

  const query = searchParams.get('q') ?? '';
  const status = readStatus(searchParams);
  const officerId = searchParams.get('officer') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const [officers, setOfficers] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Options for the Officer filter. If they fail, the filter still offers "All officers".
  useEffect(() => {
    let ignore = false;
    listOfficers()
      .then((list) => {
        if (!ignore) setOfficers(list);
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

    listInspections({ q: query, officerId, from, to })
      .then((items) => {
        if (ignore) return;
        setInspections(items);
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
  }, [query, officerId, from, to, reloadCount]);

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

  const counts = {
    all: inspections.length,
    draft: inspections.filter((item) => item.status === 'draft').length,
    completed: inspections.filter((item) => item.status === 'completed').length,
  };
  const visible = inspections.filter((item) => status === 'all' || item.status === status);

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: `${STATUS_LABELS[value]} · ${counts[value]}`,
  }));
  const officerOptions = [
    { value: '', label: 'All officers' },
    ...officers.map((officer) => ({ value: officer.id, label: officer.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Inspections</h1>
        <p className="mt-1 text-text-muted">
          Pod inspections from every field officer, newest first.
        </p>
      </div>

      <Card className="md:p-6">
        <div role="group" aria-label="Filters" className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <SearchField
              label="Search tree code, block or officer"
              value={query}
              onChange={(text) => setFilters({ q: text })}
              placeholder="Search tree code, block or officer"
            />
          </div>
          <div className="min-w-72">
            <SegmentedControl
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(value) => setFilters({ status: value })}
            />
          </div>
          <SelectField
            label="Officer"
            value={officerId}
            onChange={(value) => setFilters({ officer: value })}
            options={officerOptions}
            className="min-w-40"
          />
          <TextField
            label="From"
            type="date"
            value={from}
            max={to || today}
            onChange={(event) => setFilters({ from: event.target.value })}
            className="w-44"
          />
          <TextField
            label="To"
            type="date"
            value={to}
            min={from || undefined}
            max={today}
            onChange={(event) => setFilters({ to: event.target.value })}
            className="w-44"
          />
        </div>

        <div className="mt-5">
          {loadState === 'loading' && <TableSkeleton />}

          {loadState === 'error' && (
            <ErrorState title="Could not load inspections" error={error} onRetry={handleRetry} />
          )}

          {loadState === 'success' && (
            <>
              {/* role="status" announces the new count to screen readers when filters change */}
              <p role="status" className="mb-2 text-sm text-text-muted">
                {visible.length} {visible.length === 1 ? 'inspection' : 'inspections'} · newest
                first
              </p>

              {visible.length > 0 ? (
                <InspectionTable inspections={visible} caption="Inspections, newest first" />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No inspections match these filters."
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

      <p className="text-xs text-text-muted">Severity uses DEMO thresholds. {DISCLAIMER}</p>
    </div>
  );
}

export default AdminInspectionsPage;
