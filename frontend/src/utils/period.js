// Period filter for the supervisor dashboard: rolling "Last N days" and named calendar months.
// All dates are local "yyyy-mm-dd" strings, so they compare directly with inspection visitDates.
import { formatMonthYear, toIsoDate } from './format';

const ROLLING_DAYS = [7, 30, 90];
const CALENDAR_MONTHS = 3;

/** The option the dashboard selects when it opens. */
export const DEFAULT_PERIOD = 'last-30';

/**
 * @typedef {object} PeriodOption
 * @property {string} value  - 'last-7' | 'last-30' | 'last-90' | 'yyyy-mm'
 * @property {string} label  - for the select and card sub-lines, e.g. "Last 30 days", "October 2026"
 * @property {string} phrase - for sentences, e.g. "the last 30 days", "October 2026"
 * @property {string} from   - first day, inclusive ("yyyy-mm-dd")
 * @property {string} to     - last day, inclusive ("yyyy-mm-dd")
 */

/**
 * Period options, in the order the select shows them: Last 7 / 30 / 90 days, then the last 3
 * calendar months (this month first). "Last 30 days" = today and the 29 days before it.
 * @param {Date} [today]
 * @returns {PeriodOption[]}
 * @example getPeriodOptions(new Date(2026, 9, 16))[1]
 * // -> { value: 'last-30', label: 'Last 30 days', phrase: 'the last 30 days',
 * //      from: '2026-09-17', to: '2026-10-16' }
 */
export function getPeriodOptions(today = new Date()) {
  const rolling = ROLLING_DAYS.map((days) => ({
    value: `last-${days}`,
    label: `Last ${days} days`,
    phrase: `the last ${days} days`,
    from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1))),
    to: toIsoDate(today),
  }));

  const months = Array.from({ length: CALENDAR_MONTHS }, (_, index) => {
    const first = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const label = formatMonthYear(first);
    return {
      value: toIsoDate(first).slice(0, 7),
      label,
      phrase: label,
      from: toIsoDate(first),
      to: toIsoDate(last),
    };
  });

  return [...rolling, ...months];
}
