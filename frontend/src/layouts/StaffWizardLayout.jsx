import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { TOTAL_WIZARD_STEPS, WIZARD_STEPS } from '../utils/inspectionRoutes';
import { goBack } from '../utils/navigation';

// Layout for the 4-step inspection wizard (O2–O5): Details, Photos, Review, Summary.
// No tab bar: a back arrow and "Step X of 4" instead. Each wizard page wraps itself:
//
//   <StaffWizardLayout step={2} subtitle="Block A · A-01 · 12 Oct" footer={<Button>…</Button>}>
//     …page content…
//   </StaffWizardLayout>
//
// step: 1-4 (sets the header title and the progress bar)
// subtitle: optional line under the title, e.g. "Block A · A-01 · 12 Oct"
// onBack: optional; default = back one page (or Home if the page was opened directly)
// footer: optional actions pinned to the bottom of the screen (e.g. "Analyse 5 pods")
function StaffWizardLayout({ step, subtitle, onBack, footer, children }) {
  const navigate = useNavigate();
  const current = WIZARD_STEPS.find((item) => item.number === step) ?? WIZARD_STEPS[0];

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      goBack(navigate, '/staff');
    }
  }

  return (
    <div className="cc-bg flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 bg-primary-dark text-white">
        {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. */}
        <div className="mx-auto flex min-h-15 w-full max-w-[480px] items-center gap-1 px-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{current.title}</h1>
            {subtitle && <p className="truncate text-sm text-white/80">{subtitle}</p>}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 pt-3.5">
        <p className="text-sm font-semibold text-text-muted">
          Step {current.number} of {TOTAL_WIZARD_STEPS} · {current.label}
        </p>
        <div
          role="progressbar"
          aria-label="Inspection progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL_WIZARD_STEPS}
          aria-valuenow={current.number}
          aria-valuetext={`Step ${current.number} of ${TOTAL_WIZARD_STEPS}: ${current.label}`}
          className="mt-1.5 grid grid-cols-4 gap-1.5"
        >
          {WIZARD_STEPS.map((item) => (
            <span
              key={item.number}
              className={`h-1.5 rounded-full ${item.number <= current.number ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. */}
      <main className="mx-auto w-full max-w-[480px] flex-1 px-4 pt-4 pb-8">{children}</main>

      {footer && (
        <div className="sticky bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-[480px] px-4 pt-3 pb-5">{footer}</div>
        </div>
      )}
    </div>
  );
}

export default StaffWizardLayout;
