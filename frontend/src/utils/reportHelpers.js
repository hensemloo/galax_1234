// Text shown on the Summary (O5), Report (O6), Full report (O7) and the A4 PDF report,
// kept in one place so every screen words things the same way.
// The numbers themselves come from summarisePods in utils/severity.js.
import { formatVisitDate } from './format';
import { HEALTHY_LABEL, SEVERITY_LABELS, SEVERITY_RULES } from './severity';

// Display name of a disease code from the disease table (listDiseases), e.g. "Black pod rot".
// Unknown code -> the code itself, so nothing is ever blank.
export function getDiseaseName(diseases, code) {
  return diseases.find((item) => item.code === code)?.nameEn ?? code;
}

// Recommended actions for the diseases found, from the disease table (never from AI).
// summary: from summarisePods. Returns [{ code, name, count, action, source }], most common first.
// No infected pods -> the "healthy" action (e.g. "No action needed. Continue routine monitoring.").
export function getRecommendedActions(summary, diseases) {
  const found = summary?.diseases?.length
    ? summary.diseases
    : [{ code: HEALTHY_LABEL, count: summary?.counted ?? 0 }];

  return found.map(({ code, count }) => {
    const disease = diseases.find((item) => item.code === code);
    return {
      code,
      name: disease?.nameEn ?? code,
      count,
      action: disease?.action ?? 'No recommended action in the disease table yet.',
      source: disease?.source ?? 'DEMO',
    };
  });
}

// Short note for one pod on the report, or '' if there is nothing to say.
// aiName: display name of the AI label, e.g. "Black pod rot"
export function getPodNote(pod, aiName) {
  if (pod.excluded) return 'Unclear photo, not counted';
  if (pod.changedByOfficer) return `Changed by officer (AI said ${aiName})`;
  return '';
}

// "12 Sep 2026 · None (0%)" or "First inspection of this tree".
export function formatPrevious(previous) {
  if (!previous) return 'First inspection of this tree';
  const label = SEVERITY_LABELS[previous.severity] ?? SEVERITY_LABELS.na;
  const percent =
    typeof previous.percentInfected === 'number' ? ` (${previous.percentInfected}%)` : '';
  return `${formatVisitDate(previous.visitDate)} · ${label}${percent}`;
}

// "25% of pods infected", or "No pods counted" when every photo was excluded.
export function formatPercentInfected(summary) {
  return typeof summary?.percentInfected === 'number'
    ? `${summary.percentInfected}% of pods infected`
    : 'No pods counted';
}

// The DEMO severity scale in one line, built from SEVERITY_RULES so it changes with the thresholds:
// "None 0% · Low >0–<20% · Medium 20–49% · High ≥50%"
export function formatSeverityScale() {
  const { mediumFrom, highFrom } = SEVERITY_RULES;
  return `None 0% · Low >0–<${mediumFrom}% · Medium ${mediumFrom}–${highFrom - 1}% · High ≥${highFrom}%`;
}

export const DISCLAIMER = 'Preliminary screening, not an official diagnosis.';
