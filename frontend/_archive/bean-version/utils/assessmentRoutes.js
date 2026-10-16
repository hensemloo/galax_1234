// The 6 wizard steps and their URLs. Keep in sync with routes/AppRouter.jsx.
// path(id) builds the URL for an assessment. Step 1 has no id yet (it creates the assessment).
export const WIZARD_STEPS = [
  { number: 1, title: 'Batch info', path: () => '/staff/assessments/new' },
  { number: 2, title: 'Upload image', path: (id) => `/staff/assessments/${id}/upload` },
  { number: 3, title: 'AI screening', path: (id) => `/staff/assessments/${id}/screening` },
  { number: 4, title: 'Measurements', path: (id) => `/staff/assessments/${id}/measurements` },
  { number: 5, title: 'Assessment result', path: (id) => `/staff/assessments/${id}/result` },
  { number: 6, title: 'Review and confirm', path: (id) => `/staff/assessments/${id}/review` },
];

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

// Where a card should link to when the user taps an assessment:
// - completed -> its detail page
// - draft -> the wizard step it stopped at (current_step)
// A draft already has an id, so batch info (step 1) was saved. Step 1, a missing or
// unknown current_step all fall back to the upload step, so we never create a duplicate.
export function getContinuePath(assessment) {
  const id = assessment?.id;
  if (!id) return '/staff/assessments';

  if (assessment.status === 'completed') {
    return `/staff/assessments/${id}`;
  }

  const step = WIZARD_STEPS.find((item) => item.number === assessment.current_step);
  if (!step || step.number === 1) {
    return WIZARD_STEPS[1].path(id);
  }
  return step.path(id);
}
