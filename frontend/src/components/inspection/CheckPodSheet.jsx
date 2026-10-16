import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { TriangleAlert, X } from 'lucide-react';
import Button from '../ui/Button';
import CocoaPodIcon from '../ui/CocoaPodIcon';
import { updatePod } from '../../services/inspectionService';
import { isAiUnsure } from '../../utils/inspectionRules';
import { HEALTHY_LABEL } from '../../utils/severity';

// O4b: "Check pod" bottom sheet, opened from a row on the Review step (O4).
// Design: docs/design/pod/staff/O4b-check-pod-sheet.html
//
// The parent renders it only while a pod is selected (give it key={pod.id}), so it opens on mount.
// inspectionId: id of the draft inspection
// pod: the pod being checked; podName: e.g. "Pod 5"
// diseases: the disease table from listDiseases() (one radio per disease)
// onSaved(updatedInspection): called after updatePod succeeds (the sheet then closes)
// onClose(): called when the sheet closes (X, Escape, backdrop click, or after Save)
//
// Uses the browser's <dialog> like ConfirmDialog: focus is kept inside while it is open.
const EXCLUDE_VALUE = 'exclude';

// Healthy first, then the diseases in table order.
function sortHealthyFirst(diseases) {
  return [...diseases].sort(
    (a, b) => Number(b.code === HEALTHY_LABEL) - Number(a.code === HEALTHY_LABEL)
  );
}

function CheckPodSheet({ inspectionId, pod, podName, diseases, onSaved, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const [choice, setChoice] = useState(pod.excluded ? EXCLUDE_VALUE : pod.finalLabel);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const unsure = isAiUnsure(pod);
  const aiName = diseases.find((item) => item.code === pod.aiLabel)?.nameEn ?? pod.aiLabel;
  const confidence = Math.round((pod.aiConfidence ?? 0) * 100);

  // Open as a modal when the sheet mounts. showModal() moves focus to the first focusable
  // element inside (the Close button).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Close the <dialog> first (so the page is usable again), then tell the parent.
  function requestClose() {
    if (isSaving) return;
    dialogRef.current?.close();
    onClose();
  }

  // Escape fires "cancel". We close through requestClose so nothing is saved.
  function handleCancelEvent(event) {
    event.preventDefault();
    requestClose();
  }

  // A click on the <dialog> itself (not its contents) means the dimmed backdrop was clicked.
  function handleClick(event) {
    if (event.target === dialogRef.current) requestClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    const changes =
      choice === EXCLUDE_VALUE
        ? { finalLabel: pod.finalLabel, excluded: true }
        : { finalLabel: choice, excluded: false };
    try {
      const updated = await updatePod(inspectionId, pod.id, changes);
      onSaved(updated);
      dialogRef.current?.close();
      onClose();
    } catch (error) {
      // Keep the sheet open so the officer can try again.
      setSaveError(error);
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancelEvent}
      onClick={handleClick}
      className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[20px] border-0 bg-surface p-0 text-text shadow-xl backdrop:bg-primary-dark/60"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <span className="h-1.5 w-11 self-center rounded-full bg-border" aria-hidden="true" />

        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-bold">
            Check {podName}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <X className="size-5" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <div className="relative h-55 overflow-hidden rounded-xl bg-primary-soft">
          {pod.photoUrl ? (
            <img src={pod.photoUrl} alt={`${podName} photo`} className="size-full object-contain" />
          ) : (
            <span className="flex size-full items-center justify-center text-primary-light">
              <CocoaPodIcon className="size-16" />
            </span>
          )}
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-text/70 px-2 py-0.5 text-sm font-bold text-white">
            {podName}
          </span>
        </div>

        <p
          className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-sm ${
            unsure ? 'bg-sev-medium-bg text-sev-medium-text' : 'bg-bg text-text'
          }`}
        >
          <span>
            AI suggests <b>{aiName}</b>
          </span>
          <span className="shrink-0 font-bold">
            {confidence}%{unsure && ' · unsure'}
          </span>
        </p>

        <fieldset className="flex flex-col gap-2" disabled={isSaving}>
          <legend className="mb-2 text-sm font-bold">Your final label</legend>

          {sortHealthyFirst(diseases).map((disease) => {
            const isHealthy = disease.code === HEALTHY_LABEL;
            return (
              <label
                key={disease.code}
                className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-border px-3.5 has-checked:border-primary has-checked:bg-primary-soft has-checked:ring-1 has-checked:ring-primary"
              >
                <input
                  type="radio"
                  name="finalLabel"
                  value={disease.code}
                  checked={choice === disease.code}
                  onChange={() => setChoice(disease.code)}
                  className="size-5 shrink-0 accent-primary"
                />
                <span
                  className={`font-semibold ${isHealthy ? 'text-sev-none-text' : 'text-sev-high-text'}`}
                >
                  {disease.nameEn}
                </span>
                {!isHealthy && (
                  <Link
                    to={`/staff/diseases#${disease.code}`}
                    className="ml-auto shrink-0 py-2 text-sm text-primary underline"
                  >
                    What is this?
                  </Link>
                )}
              </label>
            );
          })}

          <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-border px-3.5 py-2 has-checked:border-primary has-checked:bg-primary-soft has-checked:ring-1 has-checked:ring-primary">
            <input
              type="radio"
              name="finalLabel"
              value={EXCLUDE_VALUE}
              checked={choice === EXCLUDE_VALUE}
              onChange={() => setChoice(EXCLUDE_VALUE)}
              className="size-5 shrink-0 accent-primary"
            />
            <span className="flex flex-col">
              <span className="font-semibold">Unclear photo, exclude</span>
              <span className="text-xs text-text-muted">Kept for the record, not counted</span>
            </span>
          </label>
        </fieldset>

        {saveError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Could not save. {saveError.userMessage ?? 'Check your internet and try again.'}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSaving} className="min-h-13 text-[17px]">
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </dialog>
  );
}

export default CheckPodSheet;
