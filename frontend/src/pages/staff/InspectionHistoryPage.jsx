import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CalendarDays, ClipboardList, Plus, RotateCcw, SearchX } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import InspectionCard from '../../components/ui/InspectionCard';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Skeleton from '../../components/ui/Skeleton';
import TextField from '../../components/ui/TextField';
import { listInspections } from '../../services/inspectionService';
import {
  formatDayLabel,
  formatMonthYear,
  formatShortDate,
  getMonthStart,
  getWeekStart,
  toIsoDate,
} from '../../utils/format';
import { NEW_INSPECTION_PATH } from '../../utils/inspectionRoutes';

// O9 History: search by tree code, status (All / Drafts / Completed with counts),
// date chips (This week / This month / Pick dates), grouped by day, newest first.
// Design: docs/design/pod/staff/O9-history.html
const STATUS_VALUES = ['all', 'draft', 'completed'];
const STATUS_LABELS = { all: 'All', draft: 'Drafts', completed: 'Completed' };

const PERIOD_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Pick dates', icon: CalendarDays },
];

// Only accept values we know; anything else in the URL counts as "all".
function readOption(params, key, values, fallback) {
  const value = params.get(key);
  return values.includes(value) ? value : fallback;
}

// The from/to dates ("yyyy-mm-dd") for the chosen period. Empty = no limit.
function getDateRange(period, params, today) {
  const todayIso = toIsoDate(today);
  if (period === 'week') return { from: getWeekStart(today), to: todayIso };
  if (period === 'month') return { from: getMonthStart(today), to: todayIso };
  if (period === 'custom') return { from: params.get('from') ?? '', to: params.get('to') ?? '' };
  return { from: '', to: '' };
}

// Text for the line above the list, e.g. "October 2026" or "3 Oct – 12 Oct".
function describePeriod(period, range, today) {
  if (period === 'week') return 'This week';
  if (period === 'month') return formatMonthYear(today);
  if (period === 'custom' && (range.from || range.to)) {
    const from = range.from ? formatShortDate(range.from, today) : 'start';
    const to = range.to ? formatShortDate(range.to, today) : 'today';
    return `${from} – ${to}`;
  }
  return 'All dates';
}

// [{ date, items }] in the order given (the list is already newest first).
function groupByDay(inspections) {
  const groups = [];
  for (const inspection of inspections) {
    const last = groups.at(-1);
    if (last && last.date === inspection.visitDate) {
      last.items.push(inspection);
    } else {
      groups.push({ date: inspection.visitDate, items: [inspection] });
    }
  }
  return groups;
}

function PeriodChips({ value, onChange }) {
  return (
    <div role="group" aria-label="Date" className="flex flex-wrap gap-2">
      {PERIOD_OPTIONS.map(({ value: option, label, icon: Icon }) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            // Tapping the selected chip again clears it (all dates).
            onClick={() => onChange(isSelected ? 'all' : option)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? 'border-primary bg-primary-soft font-bold text-primary'
                : 'border-border bg-surface font-semibold text-text hover:border-primary'
            }`}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="mt-4 space-y-2" aria-hidden="true">
      <Skeleton className="h-4 w-40" />
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-16 w-full" />
      ))}
    </div>
  );
}

function InspectionHistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read the clock once when the page opens (week / month ranges, "Yesterday" labels).
  const [today] = useState(() => new Date());

  const [inspections, setInspections] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Filters live in the URL (?q=…&status=…&period=…&from=…&to=…), so Back from a report keeps them.
  const query = searchParams.get('q') ?? '';
  const status = readOption(searchParams, 'status', STATUS_VALUES, 'all');
  const period = readOption(searchParams, 'period', ['week', 'month', 'custom'], 'all');
  const range = getDateRange(period, searchParams, today);

  // Load all of this officer's inspections once (the counts on the status control need them all),
  // and again after "Try again".
  useEffect(() => {
    let ignore = false;

    listInspections()
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
  }, [reloadCount]);

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

  function handlePeriodChange(value) {
    // Leaving "Pick dates" also clears its dates.
    setFilters(value === 'custom' ? { period: value } : { period: value, from: '', to: '' });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  // Filtering happens here in the browser for now (small lists).
  // LATER: send q/status/from/to to listInspections() when lists get long.
  const { counts, visible } = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matching = inspections
      .filter((item) => !search || item.tree.code.toLowerCase().includes(search))
      .filter((item) => !range.from || item.visitDate >= range.from)
      .filter((item) => !range.to || item.visitDate <= range.to);

    return {
      counts: {
        all: matching.length,
        draft: matching.filter((item) => item.status === 'draft').length,
        completed: matching.filter((item) => item.status === 'completed').length,
      },
      visible: matching.filter((item) => status === 'all' || item.status === status),
    };
  }, [inspections, query, status, range.from, range.to]);

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: `${STATUS_LABELS[value]} · ${counts[value]}`,
  }));

  const hasNoInspections = loadState === 'success' && inspections.length === 0;
  const showFilters = loadState !== 'error' && !hasNoInspections;
  const count = visible.length;

  return (
    <>
      {/* The header bar shows "History"; this heading is for screen readers. */}
      <h1 className="sr-only">History</h1>

      {showFilters && (
        // Full-width white panel under the header, as in the design.
        <div className="-mx-4 -mt-5 space-y-2.5 border-b border-border bg-surface px-4 py-3">
          <SearchField
            label="Search tree code"
            value={query}
            onChange={(text) => setFilters({ q: text })}
            placeholder="Search tree code, e.g. A-01"
          />
          <SegmentedControl
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(value) => setFilters({ status: value })}
          />
          <PeriodChips value={period} onChange={handlePeriodChange} />

          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="From"
                type="date"
                value={range.from}
                max={range.to || toIsoDate(today)}
                onChange={(event) => setFilters({ from: event.target.value })}
              />
              <TextField
                label="To"
                type="date"
                value={range.to}
                min={range.from || undefined}
                max={toIsoDate(today)}
                onChange={(event) => setFilters({ to: event.target.value })}
              />
            </div>
          )}
        </div>
      )}

      {loadState === 'loading' && <HistorySkeleton />}

      {loadState === 'error' && (
        <ErrorState
          title="Could not load inspections"
          error={error}
          onRetry={handleRetry}
          className="mt-6"
        />
      )}

      {hasNoInspections && (
        <Card className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No inspections yet"
            message="Start your first pod inspection."
            actionLabel="New inspection"
            actionIcon={Plus}
            onAction={() => navigate(NEW_INSPECTION_PATH)}
          />
        </Card>
      )}

      {loadState === 'success' && !hasNoInspections && (
        <>
          {/* role="status" announces the new count to screen readers when filters change */}
          <p role="status" className="mt-3 text-sm text-text-muted">
            {count} {count === 1 ? 'inspection' : 'inspections'} ·{' '}
            {describePeriod(period, range, today)} · newest first
          </p>

          {count > 0 ? (
            <div className="mt-3 space-y-4">
              {groupByDay(visible).map((group) => (
                <section key={group.date} aria-labelledby={`day-${group.date}`}>
                  <h2
                    id={`day-${group.date}`}
                    className="text-xs font-bold tracking-wide text-text-muted uppercase"
                  >
                    {formatDayLabel(group.date, today)}
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((inspection) => (
                      <li key={inspection.id}>
                        <InspectionCard inspection={inspection} draftAction="chip" />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No matching inspections"
              message="Try a different tree code, status or date."
              actionLabel="Clear filters"
              actionIcon={RotateCcw}
              actionVariant="text"
              onAction={clearFilters}
            />
          )}
        </>
      )}
    </>
  );
}

export default InspectionHistoryPage;
