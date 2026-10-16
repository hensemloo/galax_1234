import { useEffect, useId, useRef } from 'react';
import Button from './Button';

// Centred "Are you sure?" box over a dimmed page, with Cancel and a confirm button.
// open: show or hide the dialog
// title: short question, e.g. "Log out?"
// message: one sentence explaining what will happen
// confirmLabel: text on the confirm button, e.g. "Log out" (default "Confirm")
// onConfirm: called when the confirm button is pressed
// onCancel: called on Cancel, the Escape key, or a click on the dimmed area
// loading: optional; shows a spinner on the confirm button and blocks closing while it runs
// error: optional message shown in the box when the action failed (the user can try again)
//
// Uses the browser's built-in <dialog> element: it keeps keyboard focus inside the box
// while open and gives focus back to the button that opened it when it closes.
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
  error,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  // Keep the real <dialog> in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus(); // safest choice first: Cancel
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The browser fires "cancel" when Escape is pressed. We let the parent decide (it sets open=false).
  function handleCancelEvent(event) {
    event.preventDefault();
    if (!loading) onCancel?.();
  }

  // A click on the dialog element itself (not its contents) means the dimmed backdrop was clicked.
  function handleClick(event) {
    if (event.target === dialogRef.current && !loading) {
      onCancel?.();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      onCancel={handleCancelEvent}
      onClick={handleClick}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded border-0 bg-surface p-0 text-text shadow-xl backdrop:bg-primary-dark/50"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {message && (
          <p id={messageId} className="mt-1 text-sm text-text-muted">
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-3 rounded bg-sev-high-bg px-3 py-2 text-sm text-sev-high-text"
          >
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            className="flex-1"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
