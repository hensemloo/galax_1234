// Small helpers for showing dates and names the same way on every screen.
// Dates are shown as dd/mm/yyyy (Malaysian style) in the user's local time.

function pad(number) {
  return String(number).padStart(2, '0');
}

// Turns "2026-10-01" or a full ISO string into a Date. Returns null if it is not a valid date.
function toDate(value) {
  if (!value) return null;

  // "2026-10-01" has no time, so build it in local time (new Date() would read it as UTC midnight).
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// formatDate("2026-10-01") -> "01/10/2026". Invalid or empty -> "—".
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// formatDateTime("2026-10-01T10:42:00+08:00") -> "01/10/2026, 10:42" (24-hour). Invalid or empty -> "—".
export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '—';
  return `${formatDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// formatLongDate(new Date(2026, 9, 8)) -> "Thursday, 8 October 2026". Invalid or empty -> "—".
export function formatLongDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  return `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// formatVisitDate("2026-10-12") -> "12 Oct 2026". Invalid or empty -> "—".
export function formatVisitDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// formatShortDate("2026-10-12") -> "12 Oct". Adds the year if it is not the current year.
export function formatShortDate(value, today = new Date()) {
  const date = toDate(value);
  if (!date) return '—';
  const dayMonth = `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
  return date.getFullYear() === today.getFullYear()
    ? dayMonth
    : `${dayMonth} ${date.getFullYear()}`;
}

// Local "yyyy-mm-dd" for a Date (toISOString() would give the UTC date, which can be a day off).
// toIsoDate(new Date(2026, 9, 12)) -> "2026-10-12"
export function toIsoDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Whole days from `value` to `today` (0 = today, 1 = yesterday). Ignores the time of day.
function daysAgo(value, today) {
  const date = toDate(value);
  if (!date) return null;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end - start) / 86400000);
}

// Heading for a group of inspections on one day (History screen).
// today -> "Today" · yesterday -> "Yesterday · 12 Oct" · older -> "8 Oct"
export function formatDayLabel(value, today = new Date()) {
  const days = daysAgo(value, today);
  if (days === 0) return 'Today';
  if (days === 1) return `Yesterday · ${formatShortDate(value, today)}`;
  return formatShortDate(value, today);
}

// First day (Monday) of the week that contains `today`, as "yyyy-mm-dd".
export function getWeekStart(today = new Date()) {
  const mondayOffset = (today.getDay() + 6) % 7; // Sunday (0) -> 6, Monday (1) -> 0
  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset));
}

// First day of the month that contains `today`, as "yyyy-mm-dd".
export function getMonthStart(today = new Date()) {
  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));
}

// "October 2026"
export function formatMonthYear(today = new Date()) {
  return today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// Returns true if the date is in the same calendar month and year as `today`.
export function isSameMonth(value, today = new Date()) {
  const date = toDate(value);
  return (
    !!date && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()
  );
}

// "Good morning" before 12:00, "Good afternoon" 12:00-17:59, "Good evening" from 18:00.
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// pluralPods(1) -> "1 pod", pluralPods(3) -> "3 pods"
export function pluralPods(count) {
  return `${count} ${count === 1 ? 'pod' : 'pods'}`;
}

// getFirstName("Nur Aisyah Rahman") -> "Nur". Empty -> "".
export function getFirstName(fullName = '') {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

// getInitials("Nur Aisyah Rahman") -> "NR" (first + last name). One word -> one letter. Empty -> "".
export function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
