// Date helpers and the Turkish public holiday calendar.
// All dates are ISO strings ("YYYY-MM-DD") and all maths is done in UTC,
// so results never shift with the server's or browser's time zone.

const DAY_MS = 86_400_000;

export function parseDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Reject impossible dates such as 2026-02-31.
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  return toISO(new Date(parseDate(iso).getTime() + days * DAY_MS));
}

export function addYears(iso, years) {
  const d = parseDate(iso);
  const target = new Date(Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate()));
  // 29 February on a non-leap year falls back to 28 February.
  if (target.getUTCMonth() !== d.getUTCMonth()) target.setUTCDate(0);
  return toISO(target);
}

export function daysBetween(fromIso, toIso) {
  return Math.round((parseDate(toIso) - parseDate(fromIso)) / DAY_MS);
}

/** Whole years from `fromIso` up to and including `toIso`. */
export function fullYearsBetween(fromIso, toIso) {
  let years = parseDate(toIso).getUTCFullYear() - parseDate(fromIso).getUTCFullYear();
  if (addYears(fromIso, years) > toIso) years -= 1;
  return Math.max(0, years);
}

export function todayISO(now = new Date()) {
  // The company works on Turkey time (UTC+3, no daylight saving).
  return toISO(new Date(now.getTime() + 3 * 3_600_000));
}

/* ---------- Public holidays ---------- */

// Fixed national holidays (month-day). `half` = afternoon off only.
const FIXED = [
  ['01-01', 'newYear'],
  ['04-23', 'sovereignty'],
  ['05-01', 'labour'],
  ['05-19', 'youth'],
  ['07-15', 'democracy'],
  ['08-30', 'victory'],
  ['10-28', 'republicEve', true],
  ['10-29', 'republic'],
];

// Religious holidays follow the lunar calendar and move every year.
// Source: Diyanet calendar. 2028 dates are provisional — check them when
// the official calendar is published.
const RELIGIOUS = {
  2026: { ramadan: '2026-03-20', sacrifice: '2026-05-27' },
  2027: { ramadan: '2027-03-09', sacrifice: '2027-05-16' },
  2028: { ramadan: '2028-02-27', sacrifice: '2028-05-05' },
};

const cache = new Map();

/** Holidays of one year: [{ date, name, half }]. */
export function holidaysOf(year) {
  if (cache.has(year)) return cache.get(year);

  const list = FIXED.map(([md, name, half = false]) => ({ date: `${year}-${md}`, name, half }));
  const religious = RELIGIOUS[year];
  if (religious) {
    list.push({ date: addDays(religious.ramadan, -1), name: 'ramadanEve', half: true });
    for (let i = 0; i < 3; i++) list.push({ date: addDays(religious.ramadan, i), name: 'ramadan', half: false });
    list.push({ date: addDays(religious.sacrifice, -1), name: 'sacrificeEve', half: true });
    for (let i = 0; i < 4; i++) list.push({ date: addDays(religious.sacrifice, i), name: 'sacrifice', half: false });
  }
  list.sort((a, b) => a.date.localeCompare(b.date));
  cache.set(year, list);
  return list;
}

export function hasHolidayCalendar(year) {
  return Boolean(RELIGIOUS[year]);
}

function holidayOn(iso) {
  return holidaysOf(Number(iso.slice(0, 4))).find((h) => h.date === iso) || null;
}

/* ---------- Counting ---------- */

// Company rule: a five-day week, Saturday and Sunday off.
// (Law 4857 counts Saturday as a working day unless the contract says
// otherwise — change this list if your contracts differ.)
const WEEKEND_DAYS = [0, 6];

export function isWeekend(iso) {
  return WEEKEND_DAYS.includes(parseDate(iso).getUTCDay());
}

/**
 * Counts the days between two dates (both included).
 * unit "workdays": skips weekends and public holidays; a half-day holiday
 * counts as half a working day.
 * unit "calendar": every day counts.
 * Returns { days, calendarDays, holidays } where holidays lists the
 * holidays that fall on weekdays inside the range.
 */
export function countLeaveDays(startIso, endIso, unit = 'workdays') {
  const calendarDays = daysBetween(startIso, endIso) + 1;
  if (calendarDays <= 0) return { days: 0, calendarDays: 0, holidays: [] };
  if (unit === 'calendar') return { days: calendarDays, calendarDays, holidays: [] };

  let days = 0;
  const holidays = [];
  for (let i = 0; i < calendarDays; i++) {
    const iso = addDays(startIso, i);
    if (isWeekend(iso)) continue;
    const holiday = holidayOn(iso);
    if (holiday) holidays.push(holiday);
    if (!holiday) days += 1;
    else if (holiday.half) days += 0.5;
  }
  return { days, calendarDays, holidays };
}
