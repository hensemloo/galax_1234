import { TOTAL_WIZARD_STEPS } from './assessmentRoutes';

// Helpers for showing lists of assessments (dashboard, history).

// Sort comparator, newest first: by assessment date, then by id so the order is stable.
// Usage: [...assessments].sort(compareNewestFirst)
export function compareNewestFirst(a, b) {
  return (
    (b.assessment_date ?? '').localeCompare(a.assessment_date ?? '') ||
    (b.id ?? '').localeCompare(a.id ?? '')
  );
}

// Returns current_step if it is a valid wizard step (1-6), otherwise null (then hide "Step X of 6").
export function getValidStep(assessment) {
  const step = assessment?.current_step;
  return Number.isInteger(step) && step >= 1 && step <= TOTAL_WIZARD_STEPS ? step : null;
}
