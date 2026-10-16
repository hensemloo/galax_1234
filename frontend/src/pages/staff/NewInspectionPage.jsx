import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import SelectField from '../../components/ui/SelectField';
import Skeleton from '../../components/ui/Skeleton';
import TextField from '../../components/ui/TextField';
import StaffWizardLayout from '../../layouts/StaffWizardLayout';
import { createInspection, listFarms, lookupTree } from '../../services/inspectionService';
import { formatVisitDate, toIsoDate } from '../../utils/format';
import { wizardStepPath } from '../../utils/inspectionRoutes';
import { TREE_CODE_PATTERN } from '../../utils/inspectionRules';

// O2: New inspection (step 1 of 4: Details). Owner: Ain (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O2-new-inspection.html
const FORM_ID = 'new-inspection-form';
const LOOKUP_DELAY_MS = 400; // wait until the officer stops typing before checking the tree code

const LABEL_CLASSES = 'mb-1.5 block text-sm font-medium text-text';
const BOX_CLASSES =
  'w-full rounded border bg-surface px-3 text-base text-text outline-none focus:ring-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

function boxBorder(error) {
  return error
    ? 'border-danger focus:ring-danger/25'
    : 'border-border focus:border-primary focus:ring-primary/20';
}

// Small chip under the tree code: "Existing tree · last inspected …" or "New tree — will be created".
function TreeLookupChip({ lookup }) {
  if (lookup.status === 'checking') {
    return <p className="text-sm text-text-muted">Checking tree code…</p>;
  }
  if (lookup.status === 'error') {
    return (
      <p className="text-sm text-text-muted">
        Could not check this tree code. You can still continue.
      </p>
    );
  }
  if (lookup.tree) {
    const last = lookup.tree.lastVisitDate
      ? `last inspected ${formatVisitDate(lookup.tree.lastVisitDate)}`
      : 'never inspected';
    return (
      <span className="inline-flex items-center gap-2 rounded bg-sev-none-bg px-2.5 py-1.5 text-sm font-semibold text-sev-none-text">
        <Check className="size-4" aria-hidden="true" />
        Existing tree · {last}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded bg-primary-soft px-2.5 py-1.5 text-sm font-semibold text-primary">
      <Plus className="size-4" aria-hidden="true" />
      New tree — will be created
    </span>
  );
}

// Returns { field: message } for every problem. Empty object = form is OK.
function validate({ farmId, blockId, treeCode, visitDate }, today) {
  const errors = {};
  if (!farmId) errors.farm = 'Choose a farm.';
  if (!blockId) errors.block = 'Choose a block.';
  if (!treeCode) {
    errors.treeCode = 'Enter the tree code.';
  } else if (!TREE_CODE_PATTERN.test(treeCode)) {
    errors.treeCode = 'Use a letter, a dash and a number, e.g. A-01.';
  }
  if (!visitDate) {
    errors.visitDate = 'Pick the visit date.';
  } else if (visitDate > today) {
    // "yyyy-mm-dd" strings sort like dates, so > works here.
    errors.visitDate = 'The visit date cannot be in the future.';
  }
  return errors;
}

function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function NewInspectionPage() {
  const navigate = useNavigate();
  const today = toIsoDate(new Date());
  const dateHintId = useId();

  // Farms (with their blocks) for the two selects.
  const [farms, setFarms] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Form fields
  const [farmId, setFarmId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [treeCode, setTreeCode] = useState('');
  const [visitDate, setVisitDate] = useState(today);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Result of the last tree code check. `key` says which block + code it belongs to,
  // so an old result is never shown for a code the officer has changed since.
  const [lookup, setLookup] = useState({ key: '', status: 'idle', tree: null });

  useEffect(() => {
    let ignore = false;

    listFarms()
      .then((items) => {
        if (ignore) return;
        setFarms(items);
        // Only one farm? Choose it for the officer.
        if (items.length === 1) setFarmId(items[0].id);
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
  }, [reloadCount]);

  // Tree code "find or create": check only a complete code in a chosen block, ~400ms after typing stops.
  const lookupKey = blockId && TREE_CODE_PATTERN.test(treeCode) ? `${blockId}|${treeCode}` : '';

  useEffect(() => {
    if (!lookupKey) return undefined;
    let ignore = false;

    const timer = setTimeout(() => {
      lookupTree(blockId, treeCode)
        .then((tree) => {
          if (!ignore) setLookup({ key: lookupKey, status: 'done', tree });
        })
        .catch(() => {
          if (!ignore) setLookup({ key: lookupKey, status: 'error', tree: null });
        });
    }, LOOKUP_DELAY_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [lookupKey, blockId, treeCode]);

  // While the new check is still running, show "Checking…" instead of the old result.
  const shownLookup =
    lookup.key === lookupKey ? lookup : { key: lookupKey, status: 'checking', tree: null };

  const selectedFarm = farms.find((farm) => farm.id === farmId);
  const blocks = selectedFarm?.blocks ?? [];

  // Typing in a field clears its error message.
  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleFarmChange(value) {
    setFarmId(value);
    setBlockId(''); // blocks belong to a farm, so choose again
    clearError('farm');
  }

  function handleTreeCodeChange(event) {
    // Tree codes are stored in capitals and never contain spaces.
    setTreeCode(event.target.value.toUpperCase().replace(/\s/g, ''));
    clearError('treeCode');
  }

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate({ farmId, blockId, treeCode, visitDate }, today);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const created = await createInspection({ blockId, treeCode, visitDate, notes: notes.trim() });
      // replace: the browser Back button should not return to this form and create a second draft.
      navigate(wizardStepPath(created.id, 2), { replace: true });
    } catch (error) {
      setSaveError(error);
      setIsSaving(false);
    }
  }

  const footer =
    loadState === 'success' && farms.length > 0 ? (
      <Button type="submit" form={FORM_ID} fullWidth loading={isSaving}>
        {isSaving ? 'Saving…' : 'Next: add pod photos'}
      </Button>
    ) : null;

  return (
    // A new form has nothing to lose yet, so Back always goes Home.
    <StaffWizardLayout step={1} onBack={() => navigate('/staff')} footer={footer}>
      {loadState === 'loading' && <FormSkeleton />}

      {loadState === 'error' && (
        <ErrorState title="Could not load farms" error={loadError} onRetry={handleRetry} />
      )}

      {loadState === 'success' && farms.length === 0 && (
        <Card>
          <EmptyState
            title="No farms yet"
            message="Ask your supervisor to add a farm and blocks."
          />
        </Card>
      )}

      {loadState === 'success' && farms.length > 0 && (
        <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            label="Farm"
            required
            value={farmId}
            onChange={handleFarmChange}
            error={errors.farm}
            options={[
              { value: '', label: 'Choose a farm' },
              ...farms.map((farm) => ({ value: farm.id, label: farm.name })),
            ]}
          />

          <SelectField
            label="Block"
            required
            value={blockId}
            onChange={(value) => {
              setBlockId(value);
              clearError('block');
            }}
            disabled={!selectedFarm}
            error={errors.block}
            options={[
              { value: '', label: selectedFarm ? 'Choose a block' : 'Choose a farm first' },
              ...blocks.map((block) => ({ value: block.id, label: block.name })),
            ]}
          />

          <div className="space-y-2">
            <TextField
              label="Tree code"
              required
              value={treeCode}
              onChange={handleTreeCodeChange}
              placeholder="A-01"
              maxLength={10}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              error={errors.treeCode}
              className="[&_input]:font-mono [&_input]:text-lg [&_input]:font-semibold"
            />
            {/* aria-live: screen readers announce the chip when it changes. */}
            <div aria-live="polite">{lookupKey && <TreeLookupChip lookup={shownLookup} />}</div>
          </div>

          <div>
            <TextField
              label="Visit date"
              type="date"
              required
              value={visitDate}
              max={today}
              onChange={(event) => {
                setVisitDate(event.target.value);
                clearError('visitDate');
              }}
              error={errors.visitDate}
              // TextField links its own error message; link the hint only when there is no error.
              {...(!errors.visitDate && { 'aria-describedby': dateHintId })}
            />
            {!errors.visitDate && (
              <p id={dateHintId} className="mt-1.5 text-sm text-text-muted">
                Today by default. You can pick an earlier date, not a future one.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="inspection-notes" className={LABEL_CLASSES}>
              Notes (optional)
            </label>
            <textarea
              id="inspection-notes"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Some pods dark near the stalk"
              className={`resize-none py-2.5 placeholder:text-text-muted ${BOX_CLASSES} ${boxBorder()}`}
            />
          </div>

          {saveError && <ErrorState title="Could not create the inspection" error={saveError} />}
        </form>
      )}
    </StaffWizardLayout>
  );
}

export default NewInspectionPage;
