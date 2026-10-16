import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ClipboardList, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import InspectionCard from '../../components/ui/InspectionCard';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { listInspections } from '../../services/inspectionService';
import { getFirstName } from '../../utils/format';
import { NEW_INSPECTION_PATH } from '../../utils/inspectionRoutes';

// O1 Home: greeting, New inspection button, Drafts, Recent (last 3 completed) + "See all in History".
// Design: docs/design/pod/staff/O1-home.html
const MAX_RECENT = 3;

const SECTION_HEADING_CLASSES = 'text-sm font-bold tracking-wide text-text-muted uppercase';

function HomeSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="mt-4 h-4 w-24" />
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-16 w-full" />
      ))}
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Load when the page opens, and again after "Try again".
  // `ignore` stops a slow, out-of-date response from overwriting newer state after the page closes.
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

  // listInspections already returns newest first.
  const drafts = inspections.filter((item) => item.status === 'draft');
  const recent = inspections.filter((item) => item.status === 'completed').slice(0, MAX_RECENT);
  const firstName = getFirstName(user?.name);

  return (
    <>
      <header>
        {firstName && <p className="text-sm text-text-muted">Hello, {firstName}</p>}
        <h1 className="text-2xl font-bold text-text">My inspections</h1>
      </header>

      <Link
        to={NEW_INSPECTION_PATH}
        className="mt-5 flex min-h-14 items-center justify-center gap-2.5 rounded-xl bg-primary text-lg font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Plus className="size-6" aria-hidden="true" />
        New inspection
      </Link>

      {loadState === 'loading' && <HomeSkeleton />}

      {loadState === 'error' && (
        <ErrorState
          title="Could not load inspections"
          error={error}
          onRetry={handleRetry}
          className="mt-6"
        />
      )}

      {loadState === 'success' && inspections.length === 0 && (
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

      {loadState === 'success' && inspections.length > 0 && (
        <>
          {drafts.length > 0 && (
            <section aria-labelledby="drafts-heading" className="mt-6">
              <h2 id="drafts-heading" className={SECTION_HEADING_CLASSES}>
                Drafts ({drafts.length})
              </h2>
              <ul className="mt-2.5 space-y-2.5">
                {drafts.map((inspection) => (
                  <li key={inspection.id}>
                    <InspectionCard inspection={inspection} showDate />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="recent-heading" className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-heading" className={SECTION_HEADING_CLASSES}>
                Recent
              </h2>
              <Link
                to="/staff/inspections"
                className="flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
              >
                See all in History ›
              </Link>
            </div>

            {recent.length > 0 ? (
              <ul className="mt-1 space-y-2.5">
                {recent.map((inspection) => (
                  <li key={inspection.id}>
                    <InspectionCard inspection={inspection} showDate />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-text-muted">
                No completed inspections yet. Finish a draft to see it here.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default HomePage;
