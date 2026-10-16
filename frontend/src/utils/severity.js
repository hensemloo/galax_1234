// The ONE place that turns pod labels into counts, % infected and severity.
// Summary, report and dashboard all call these functions so they always show the same result.
// The backend will use the same rules later (keep them in sync).
//
// Severity is judged by % of counted pods on the tree whose final label is a disease.
// The numbers below are DEMO values until Lembaga Koko Malaysia (LKM) verifies them.
// After the field trip, change the numbers here, not the code that uses them.

// DEMO thresholds (in %):
//   None   = exactly 0%
//   Low    = more than 0%, under mediumFrom (20%)
//   Medium = mediumFrom (20%) up to under highFrom (50%)   -> 20–49%
//   High   = highFrom (50%) or more
export const SEVERITY_RULES = {
  source: 'DEMO',
  mediumFrom: 20,
  highFrom: 50,
};

// Severity levels from best to worst. 'na' = not analysed / nothing counted yet.
export const SEVERITY_LEVELS = ['none', 'low', 'medium', 'high'];

export const SEVERITY_LABELS = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  na: 'Not inspected',
};

// Human-readable scale for legends and the disease guide, built from SEVERITY_RULES.
export const SEVERITY_SCALE = [
  { severity: 'none', range: '0%' },
  { severity: 'low', range: `More than 0%, under ${SEVERITY_RULES.mediumFrom}%` },
  {
    severity: 'medium',
    range: `${SEVERITY_RULES.mediumFrom}% to ${SEVERITY_RULES.highFrom - 1}%`,
  },
  { severity: 'high', range: `${SEVERITY_RULES.highFrom}% or more` },
];

// The label for a healthy pod. Every other final label counts as a disease.
export const HEALTHY_LABEL = 'healthy';

// getSeverity(0) -> 'none'
// getSeverity(10) -> 'low'
// getSeverity(25) -> 'medium'   (the A-01 example: 1 of 4 counted pods infected)
// getSeverity(50) -> 'high'
// getSeverity(null) -> 'na'     (nothing counted, e.g. every photo excluded)
export function getSeverity(percentInfected) {
  if (typeof percentInfected !== 'number' || Number.isNaN(percentInfected)) return 'na';
  if (percentInfected <= 0) return 'none';
  if (percentInfected < SEVERITY_RULES.mediumFrom) return 'low';
  if (percentInfected < SEVERITY_RULES.highFrom) return 'medium';
  return 'high';
}

// Turns the pods of one inspection into the numbers shown on the summary and report.
//
// - photos: every pod photo
// - counted: pods that are not excluded and have a final label
// - infected: counted pods whose final label is not "healthy"
// - percentInfected: infected / counted * 100, rounded to a whole number (null if counted is 0)
// - severity: from the UNROUNDED percent (see getSeverity)
// - diseases: [{ code, count }] for infected pods, most common first
// - aiAgreed: counted pods where the AI label equals the final label
//
// Example (Aina, Block A, tree A-01, 12 Oct 2026):
//   summarisePods([
//     { aiLabel: 'healthy',   finalLabel: 'healthy',   excluded: false }, // Pod 1
//     { aiLabel: 'black_pod', finalLabel: 'black_pod', excluded: false }, // Pod 2
//     { aiLabel: 'healthy',   finalLabel: 'healthy',   excluded: false }, // Pod 3
//     { aiLabel: 'black_pod', finalLabel: 'healthy',   excluded: false }, // Pod 4, changed by officer
//     { aiLabel: 'healthy',   finalLabel: 'healthy',   excluded: true  }, // Pod 5, blurry
//   ])
//   -> { photos: 5, counted: 4, infected: 1, excluded: 1, percentInfected: 25,
//        severity: 'medium', diseases: [{ code: 'black_pod', count: 1 }], aiAgreed: 3 }
export function summarisePods(pods = []) {
  const excluded = pods.filter((pod) => pod.excluded).length;
  const countedPods = pods.filter((pod) => !pod.excluded && pod.finalLabel);
  const infectedPods = countedPods.filter((pod) => pod.finalLabel !== HEALTHY_LABEL);

  const counted = countedPods.length;
  const infected = infectedPods.length;
  const exactPercent = counted > 0 ? (infected / counted) * 100 : null;

  const countsByCode = {};
  for (const pod of infectedPods) {
    countsByCode[pod.finalLabel] = (countsByCode[pod.finalLabel] ?? 0) + 1;
  }
  const diseases = Object.entries(countsByCode)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return {
    photos: pods.length,
    counted,
    infected,
    excluded,
    percentInfected: exactPercent === null ? null : Math.round(exactPercent),
    severity: getSeverity(exactPercent),
    diseases,
    aiAgreed: countedPods.filter((pod) => pod.aiLabel === pod.finalLabel).length,
  };
}

// Picks the worst severity from a list, e.g. for a block tile. Empty list -> 'na'.
// getWorstSeverity(['none', 'medium', 'low']) -> 'medium'
export function getWorstSeverity(severities = []) {
  let worstIndex = -1;
  for (const severity of severities) {
    worstIndex = Math.max(worstIndex, SEVERITY_LEVELS.indexOf(severity));
  }
  return worstIndex === -1 ? 'na' : SEVERITY_LEVELS[worstIndex];
}
