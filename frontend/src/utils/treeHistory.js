// Text for the supervisor's tree history screen (/admin/trees/:treeId), built from getTree().
// Everything is generated from the inspections, never typed by hand.
import { formatVisitDate } from './format';
import { getDiseaseName } from './reportHelpers';
import { SEVERITY_LABELS } from './severity';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// "2026-10-12" -> { year: 2026, month: 9 } (month 0 = January)
function yearMonth(isoDate) {
  const [year, month] = isoDate.split('-').map(Number);
  return { year, month: month - 1 };
}

function sameMonth(a, b) {
  return a.slice(0, 7) === b.slice(0, 7);
}

// "25%", or "no pods counted" when every photo was excluded.
function formatPercent(percentInfected) {
  return typeof percentInfected === 'number' ? `${percentInfected}%` : 'no pods counted';
}

// countText(1) -> "1 pod", countText(3) -> "3 pods"
function countText(count) {
  return `${count} ${count === 1 ? 'pod' : 'pods'}`;
}

// "Aug 2026" (for "3 inspections since Aug 2026")
export function formatMonthShort(isoDate) {
  return formatVisitDate(isoDate).split(' ').slice(1).join(' ');
}

/**
 * Label under one bar of the chart: "Oct · Medium".
 * Uses the day too ("12 Oct · Medium") when another inspection is in the same month, and the
 * year too ("Oct 2025 · Medium") when the history covers more than one year.
 * @param {{ visitDate: string, severity: string }} entry - one of getTree().inspections
 * @param {Array<{ visitDate: string }>} all - every inspection of the tree
 */
export function formatBarLabel(entry, all) {
  const { year } = yearMonth(entry.visitDate);
  const shareMonth = all.some(
    (other) => other !== entry && sameMonth(other.visitDate, entry.visitDate)
  );
  const manyYears = all.some((other) => yearMonth(other.visitDate).year !== year);

  const [day, month] = formatVisitDate(entry.visitDate).split(' '); // "12", "Oct"
  let when = shareMonth ? `${day} ${month}` : month;
  if (manyYears) when = `${when} ${year}`;

  return `${when} · ${SEVERITY_LABELS[entry.severity] ?? SEVERITY_LABELS.na}`;
}

/**
 * Screen-reader summary of the chart, e.g.
 * "% pods infected over time: 14 Aug 2026, 17%, Low; 12 Sep 2026, 0%, None; …"
 */
export function describeChart(inspections) {
  const parts = inspections.map(
    (entry) =>
      `${formatVisitDate(entry.visitDate)}, ${formatPercent(entry.percentInfected)}, ${
        SEVERITY_LABELS[entry.severity] ?? SEVERITY_LABELS.na
      }`
  );
  return `% pods infected over time: ${parts.join('; ')}.`;
}

/**
 * "What changed" sentences, from the last two inspections (oldest -> newest list).
 * @param {Array<object>} inspections - getTree().inspections
 * @param {Array<object>} diseases - the disease table (listDiseases), for disease names
 * @returns {string} e.g. "Infection went from 0% in September to 25% in October. Black pod rot
 *   was found on 1 pod."  One inspection -> "Only one inspection so far." None -> "".
 */
export function describeChange(inspections, diseases) {
  if (inspections.length === 0) return '';
  if (inspections.length === 1) return 'Only one inspection so far.';

  const before = inspections.at(-2);
  const latest = inspections.at(-1);

  // "in September", or "on 12 Oct" when both visits are in the same month.
  const when = (entry) => {
    if (sameMonth(before.visitDate, latest.visitDate)) {
      return `on ${formatVisitDate(entry.visitDate)}`;
    }
    const { year, month } = yearMonth(entry.visitDate);
    const showYear = yearMonth(before.visitDate).year !== yearMonth(latest.visitDate).year;
    return `in ${MONTHS[month]}${showYear ? ` ${year}` : ''}`;
  };

  const from = formatPercent(before.percentInfected);
  const to = formatPercent(latest.percentInfected);
  let change;
  if (typeof latest.percentInfected !== 'number') {
    change = `No pods were counted ${when(latest)} (every photo excluded).`;
  } else if (from === to) {
    change = `Infection stayed at ${to} (${when(before)} and ${when(latest)}).`;
  } else {
    change = `Infection went from ${from} ${when(before)} to ${to} ${when(latest)}.`;
  }

  const found = latest.diseases ?? [];
  const diseaseText = found.length
    ? `${found
        .map(({ code, count }, index) => {
          const name = getDiseaseName(diseases, code);
          return index === 0
            ? `${name} was found on ${countText(count)}`
            : `${name} on ${countText(count)}`;
        })
        .join(', ')}.`
    : 'No infected pods were found on the latest visit.';

  return `${change} ${diseaseText}`;
}
