import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { BookOpen, TriangleAlert } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import SeverityBadge from '../ui/SeverityBadge';
import Skeleton from '../ui/Skeleton';
import { listDiseases } from '../../services/inspectionService';
import { SEVERITY_SCALE } from '../../utils/severity';

// Disease guide content, shared by the officer Disease guide (/staff/diseases) and the supervisor
// Disease info page (/admin/diseases). Read-only.
// Design: docs/design/pod/admin/L2-disease-info.html (same content in the staff desktop version).
//
// The disease cards come from listDiseases() (the disease table), never hard-coded here.
// The severity table comes from SEVERITY_SCALE in utils/severity.js (built from SEVERITY_RULES).
// A hash in the URL (e.g. /staff/diseases#black_pod) scrolls to that disease once loaded.
//
// layout: 'desktop' (disease cards in 2 columns) | 'mobile' (one column, larger text)

const AI_LIMITS = [
  <>
    It only sees the <b>outside of the pod</b> in the photo.
  </>,
  'It only recognises the conditions listed above. Anything else may be labelled wrongly.',
  'Blurry, dark or cluttered photos reduce accuracy. Exclude unclear photos.',
  <>
    The <b>officer&apos;s final label</b> is what counts, not the AI&apos;s suggestion.
  </>,
  <>
    This is preliminary screening, <b>not an official diagnosis</b>.
  </>,
];

// Text for the source pill on each card. Anything not verified by LKM shows as DEMO.
const SOURCE_BADGES = {
  LKM: { label: 'Verified by LKM', classes: 'bg-sev-none-bg text-sev-none-text' },
  DEMO: { label: 'DEMO · to verify with LKM', classes: 'bg-sev-medium-bg text-sev-medium-text' },
};

const LAYOUTS = {
  desktop: {
    text: 'text-sm',
    cards: 'grid gap-5 lg:grid-cols-2',
    bottom: 'grid gap-5 lg:grid-cols-2',
  },
  mobile: {
    text: 'text-base',
    cards: 'flex flex-col gap-4',
    bottom: 'flex flex-col gap-4',
  },
};

const BOX = 'rounded-xl border border-border bg-surface p-4 md:p-6';
const FIELD_LABEL = 'text-xs font-bold tracking-wide uppercase';

function ExamplePhoto({ diseaseName, number }) {
  return (
    <div
      role="img"
      aria-label={`Example photo ${number} of ${diseaseName} (placeholder, no photo yet)`}
      className="flex h-32 items-center justify-center rounded-lg bg-sev-na-bg p-2 text-center text-xs font-semibold text-sev-na-text"
    >
      <span aria-hidden="true">Example photo {number}</span>
    </div>
  );
}

function DiseaseCard({ disease }) {
  const source = SOURCE_BADGES[disease.source] ?? SOURCE_BADGES.DEMO;
  const headingId = `disease-${disease.code}-heading`;

  return (
    // id = disease code, so /staff/diseases#black_pod can scroll here. scroll-mt keeps the
    // heading clear of the sticky header.
    <article
      id={disease.code}
      aria-labelledby={headingId}
      className={`${BOX} flex scroll-mt-20 flex-col gap-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={headingId} className="text-xl font-bold text-text">
            {disease.nameEn}
          </h2>
          <p className="text-text-muted">
            {disease.nameMs} · code{' '}
            <span className="font-mono font-semibold break-all">{disease.code}</span>
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${source.classes}`}>
          {source.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <ExamplePhoto diseaseName={disease.nameEn} number={1} />
        <ExamplePhoto diseaseName={disease.nameEn} number={2} />
      </div>

      <dl className="flex flex-col gap-3">
        <div>
          <dt className={`${FIELD_LABEL} text-text-muted`}>Cause</dt>
          <dd className="mt-1 leading-relaxed">{disease.cause}</dd>
        </div>
        <div>
          <dt className={`${FIELD_LABEL} text-text-muted`}>How it looks on the pod</dt>
          <dd className="mt-1 leading-relaxed">{disease.looks}</dd>
        </div>
        <div className="rounded-lg bg-primary-soft p-3.5">
          <dt className={`${FIELD_LABEL} text-primary`}>Recommended action</dt>
          <dd className="mt-1 leading-relaxed">{disease.action}</dd>
        </div>
      </dl>
    </article>
  );
}

function CardsSkeleton({ className }) {
  return (
    <div className={className} aria-hidden="true">
      {[0, 1].map((item) => (
        <Skeleton key={item} className="h-96 w-full rounded-xl" />
      ))}
    </div>
  );
}

function SeverityTable() {
  return (
    <section aria-labelledby="severity-levels-heading" className={`${BOX} flex flex-col gap-3`}>
      <h2 id="severity-levels-heading" className="text-lg font-bold text-text">
        Severity levels (DEMO)
      </h2>
      <p className="text-text-muted">
        Based on % of counted pods on the tree that are infected. Excluded photos are not counted.
      </p>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-xs tracking-wide text-text-muted uppercase">
            <th scope="col" className="border-b border-border px-2 py-2 font-semibold">
              Severity
            </th>
            <th scope="col" className="border-b border-border px-2 py-2 font-semibold">
              % pods infected
            </th>
          </tr>
        </thead>
        <tbody>
          {SEVERITY_SCALE.map((level) => (
            <tr key={level.severity}>
              <td className="border-b border-border px-2 py-2.5">
                <SeverityBadge severity={level.severity} />
              </td>
              <td className="border-b border-border px-2 py-2.5">{level.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AiLimits() {
  return (
    <section aria-labelledby="ai-limits-heading" className={`${BOX} flex flex-col gap-3`}>
      <h2 id="ai-limits-heading" className="text-lg font-bold text-text">
        What the AI can and can&apos;t do
      </h2>
      <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed">
        {AI_LIMITS.map((item, index) => (
          // Fixed list that never reorders, so the index is a safe key.
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function DiseaseGuide({ layout = 'desktop' }) {
  const styles = LAYOUTS[layout] ?? LAYOUTS.desktop;
  const { hash } = useLocation();

  const [diseases, setDiseases] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    listDiseases()
      .then((list) => {
        if (ignore) return;
        setDiseases(list);
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

  // After the cards appear, scroll to the disease named in the hash (e.g. "#black_pod").
  useEffect(() => {
    if (loadState !== 'success' || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [loadState, hash]);

  function handleRetry() {
    setLoadState('loading');
    setError(null);
    setReloadCount((count) => count + 1);
  }

  return (
    <div className={`flex flex-col gap-6 text-text ${styles.text}`}>
      <p className="max-w-3xl leading-relaxed text-text-muted">
        The pod conditions CocoaCheck&apos;s AI can suggest, what they look like, and the
        recommended action. The AI only gives the label; the advice below comes from this table, not
        from the AI.
      </p>

      <div className="flex items-start gap-3 rounded-xl bg-sev-medium-bg p-3.5 leading-relaxed text-sev-medium-text">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          <b>DEMO content.</b> Descriptions and recommended actions are placeholders until verified
          by Lembaga Koko Malaysia (LKM). Read-only in this version.
        </p>
      </div>

      <section aria-label="Diseases">
        {loadState === 'loading' && <CardsSkeleton className={styles.cards} />}

        {loadState === 'error' && (
          <ErrorState
            title="Could not load the disease table"
            error={error}
            onRetry={handleRetry}
          />
        )}

        {loadState === 'success' &&
          (diseases.length > 0 ? (
            <div className={styles.cards}>
              {diseases.map((disease) => (
                <DiseaseCard key={disease.code} disease={disease} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No diseases in the table yet."
              message="The disease list is added after the LKM field trip."
            />
          ))}
      </section>

      <div className={styles.bottom}>
        <SeverityTable />
        <AiLimits />
      </div>

      <p className="text-xs text-text-muted">
        Disease list depends on the final AI dataset; more conditions may be added after the LKM
        field trip.
      </p>
    </div>
  );
}

export default DiseaseGuide;
