// DEV ONLY: shows every shared UI component in every variant, at /dev/components.
// The route is registered only when running `npm run dev` (see routes/AppRouter.jsx).
import { useState } from 'react';
import { ClipboardList, Plus, RotateCcw, SearchX } from 'lucide-react';
import AiTag from '../../components/ui/AiTag';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ProgressBar from '../../components/ui/ProgressBar';
import PodLabel from '../../components/ui/PodLabel';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import SeverityBadge from '../../components/ui/SeverityBadge';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import StatusChip from '../../components/ui/StatusChip';
import TextField from '../../components/ui/TextField';
import { inspections } from '../../mocks/mockData';
import {
  formatDate,
  formatDateTime,
  formatDayLabel,
  formatVisitDate,
  getFirstName,
  getGreeting,
} from '../../utils/format';
import { resumePath } from '../../utils/inspectionRoutes';
import { getSeverity } from '../../utils/severity';

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-mono text-sm font-medium text-text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function ComponentsPreviewPage() {
  const [text, setText] = useState('');
  const [lastAction, setLastAction] = useState('none');
  const [segment, setSegment] = useState('all');
  const [search, setSearch] = useState('');
  const [retries, setRetries] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogResult, setDialogResult] = useState('none');

  const helperExamples = [
    ['formatDate("2026-10-01")', formatDate('2026-10-01')],
    ['formatDateTime("2026-10-01T10:42:00+08:00")', formatDateTime('2026-10-01T10:42:00+08:00')],
    ['formatDate(null)', formatDate(null)],
    ['getGreeting(09:00)', getGreeting(new Date(2026, 9, 8, 9, 0))],
    ['getGreeting(12:00)', getGreeting(new Date(2026, 9, 8, 12, 0))],
    ['getGreeting(17:59)', getGreeting(new Date(2026, 9, 8, 17, 59))],
    ['getGreeting(18:00)', getGreeting(new Date(2026, 9, 8, 18, 0))],
    ['getFirstName("Nur Aisyah Rahman")', getFirstName('Nur Aisyah Rahman')],
    ['formatVisitDate("2026-10-12")', formatVisitDate('2026-10-12')],
    [
      'formatDayLabel("2026-10-12", today 13 Oct)',
      formatDayLabel('2026-10-12', new Date(2026, 9, 13)),
    ],
    ...[0, 10, 25, 50, null].map((percent) => [`getSeverity(${percent})`, getSeverity(percent)]),
    ...inspections.map((item) => [
      `resumePath(${item.id}: ${item.tree.code}, ${item.status})`,
      resumePath(item),
    ]),
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <header>
        <p className="font-mono text-xs text-text-muted">/dev/components (dev only)</p>
        <h1 className="mt-1 text-2xl font-semibold text-text">UI components</h1>
      </header>

      <Section title="Button">
        <Row>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text</Button>
        </Row>
        <Row>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button loading>Loading</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button variant="secondary" size="sm">
            Small secondary
          </Button>
          <Button as="span" variant="secondary" size="sm">
            as=&quot;span&quot; (inside a link)
          </Button>
        </Row>
        <Button fullWidth>Full width</Button>
      </Section>

      <Section title={`SegmentedControl (value: ${segment})`}>
        <SegmentedControl
          label="Filter by status"
          options={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={segment}
          onChange={setSegment}
        />
      </Section>

      <Section title="SearchField">
        <SearchField
          label="Search tree code"
          value={search}
          onChange={setSearch}
          placeholder="Search tree code, e.g. A-01"
        />
      </Section>

      <Section title={`ConfirmDialog (last result: ${dialogResult})`}>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <ConfirmDialog
          open={dialogOpen}
          title="Log out?"
          message="You will need to sign in again to continue."
          confirmLabel="Log out"
          onConfirm={() => {
            setDialogResult('confirmed');
            setDialogOpen(false);
          }}
          onCancel={() => {
            setDialogResult('cancelled');
            setDialogOpen(false);
          }}
        />
      </Section>

      <Section title={`ErrorState (retries: ${retries})`}>
        <ErrorState
          title="Could not load inspections"
          error={{ userMessage: 'Network error. Please try again.' }}
          onRetry={() => setRetries((count) => count + 1)}
        />
        <ErrorState title="Error without a userMessage (fallback text)" error={null} />
      </Section>

      <Section title="TextField">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Tree code"
            required
            placeholder="A-01"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <TextField label="Pods checked" suffix="pods" inputMode="numeric" defaultValue="5" />
          <TextField label="Tree code" required error="Tree code is required." defaultValue="" />
          <TextField label="Password" type="password" showPasswordToggle defaultValue="demo1234" />
        </div>
      </Section>

      <Section title="Card">
        <Card>Card with content only.</Card>
        <Card title="Card title">Card with a title.</Card>
        <Card
          title="Recent inspections"
          action={
            <Button variant="text" className="min-h-0 px-0">
              See all
            </Button>
          }
        >
          Card with a title and an action.
        </Card>
      </Section>

      <Section title="SeverityBadge">
        <Row>
          {['none', 'low', 'medium', 'high', 'na'].map((severity) => (
            <SeverityBadge key={severity} severity={severity} />
          ))}
        </Row>
        <Row>
          <SeverityBadge severity="none" percent={0} />
          <SeverityBadge severity="low" percent={17} />
          <SeverityBadge severity="medium" percent={25} demo />
          <SeverityBadge severity="high" percent={75} size="md" demo />
        </Row>
      </Section>

      <Section title="PodLabel">
        <Row>
          <PodLabel label="healthy" name="Healthy" confidence={0.95} />
          <PodLabel label="black_pod" name="Black pod rot" confidence={0.52} />
          <PodLabel label="black_pod" />
          <PodLabel label="healthy" excluded confidence={0.48} />
          <PodLabel label={null} />
        </Row>
      </Section>

      <Section title="StatusChip">
        <Row>
          <StatusChip status="draft" />
          <StatusChip status="completed" />
        </Row>
      </Section>

      <Section title="StatCard">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Photos" value={5} />
          <StatCard label="Counted" value={4} />
          <StatCard label="Infected" value={1} />
        </div>
      </Section>

      <Section title="AiTag">
        <Row>
          <AiTag />
        </Row>
      </Section>

      <Section title="ProgressBar">
        <ProgressBar value={0} />
        <ProgressBar value={33} />
        <ProgressBar value={67} label="Step 4 of 6" />
        <ProgressBar value={100} />
      </Section>

      <Section title="Skeleton">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Section>

      <Section title={`EmptyState (last action: ${lastAction})`}>
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No inspections yet"
            message="Start your first pod inspection."
            actionLabel="New inspection"
            actionIcon={Plus}
            onAction={() => setLastAction('New inspection')}
          />
        </Card>
        <Card>
          <EmptyState
            icon={SearchX}
            title="No matching inspections"
            message="Try a different search or filter."
            actionLabel="Clear filters"
            actionIcon={RotateCcw}
            actionVariant="text"
            onAction={() => setLastAction('Clear filters')}
          />
        </Card>
      </Section>

      <Section title="utils/format.js, utils/severity.js and utils/inspectionRoutes.js">
        <Card>
          <dl className="divide-y divide-border font-mono text-xs">
            {helperExamples.map(([call, result]) => (
              <div key={call} className="flex flex-wrap justify-between gap-2 py-2">
                <dt className="text-text-muted">{call}</dt>
                <dd className="text-text">{result}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </Section>
    </main>
  );
}

export default ComponentsPreviewPage;
