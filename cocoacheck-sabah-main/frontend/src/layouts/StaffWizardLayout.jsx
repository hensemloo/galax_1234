import { useNavigate } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';

const TOTAL_STEPS = 6;

// Layout for the 6-step "new assessment" wizard. No tab bar.
// Each wizard page wraps itself:
//   <StaffWizardLayout step={2} title="Upload image">...</StaffWizardLayout>
// onBack: optional; defaults to going back one page in the browser history.
function StaffWizardLayout({ step, title, onBack, children }) {
  const navigate = useNavigate();
  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  }

  // LATER: ask "Discard this draft?" before leaving once drafts are saved.
  function handleClose() {
    navigate('/staff');
  }

  return (
    <div className="min-h-dvh bg-bg">
      {/* LATER (desktop): add a staff sidebar here, e.g. <StaffSidebar className="hidden lg:flex" />. */}

      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. Replace with lg: styles later. */}
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center gap-1 px-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="flex size-12 shrink-0 items-center justify-center rounded text-text hover:bg-bg"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="text-xs font-medium text-text-muted">
              Step {step} of {TOTAL_STEPS}
            </p>
            <h1 className="truncate text-base font-semibold text-text">{title}</h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-12 shrink-0 items-center justify-center rounded text-text hover:bg-bg"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div
          className="h-1 bg-border"
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div
            className="h-full bg-accent transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. Replace with lg: styles later. */}
      {/* pb-28 keeps content clear of sticky action bars at the bottom of wizard steps. */}
      <main className="mx-auto w-full max-w-[480px] px-4 pt-6 pb-28">{children}</main>
    </div>
  );
}

export default StaffWizardLayout;
