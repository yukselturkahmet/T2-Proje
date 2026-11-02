// Leave policy: every rule the application enforces lives in this file.
// The backend uses it to accept or reject requests; the frontend uses the
// same code to show the result live while the form is being filled in.
//
// `source: 'law'` rules come from Labour Law No. 4857 (as amended by Law
// No. 7578, in force since 1 May 2026). `source: 'company'` rules are
// company decisions and can be changed freely.

import {
  addDays, addYears, countLeaveDays, daysBetween, fullYearsBetween, parseDate,
} from './calendar.js';

export const LEAVE_TYPES = {
  ANNUAL: {
    unit: 'workdays', paid: true, usesAnnualBalance: true,
    minServiceYears: 1, minNoticeDays: 3, maxPastDays: 0,
    source: 'law', legalRef: '4857 m.53–56',
  },
  SICK: {
    unit: 'workdays', paid: true, requiresDocument: true,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '5510 m.18',
  },
  MARRIAGE: {
    unit: 'workdays', paid: true, maxPerRequest: 3,
    minNoticeDays: 0, maxPastDays: 0,
    source: 'law', legalRef: '4857 Ek m.2',
  },
  PATERNITY: {
    unit: 'workdays', paid: true, maxPerRequest: 10,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '4857 Ek m.2',
  },
  BEREAVEMENT: {
    unit: 'workdays', paid: true, maxPerRequest: 3,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '4857 Ek m.2',
  },
  ADOPTION: {
    unit: 'workdays', paid: true, maxPerRequest: 3,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '4857 Ek m.2',
  },
  CHILD_CARE: {
    unit: 'workdays', paid: true, yearlyLimit: 10, requiresDocument: true,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '4857 Ek m.2',
  },
  MATERNITY: {
    // 24 weeks; 26 weeks for a multiple pregnancy.
    unit: 'calendar', paid: true, maxPerRequest: 182, requiresDocument: true,
    minNoticeDays: 0, maxPastDays: 30,
    source: 'law', legalRef: '4857 m.74',
  },
  EXCUSE: {
    unit: 'workdays', paid: true, yearlyLimit: 5,
    minNoticeDays: 1, maxPastDays: 0,
    source: 'company',
  },
  UNPAID: {
    unit: 'workdays', paid: false, maxPerRequest: 30,
    minNoticeDays: 7, maxPastDays: 0,
    source: 'company',
  },
};

export const LEAVE_TYPE_CODES = Object.keys(LEAVE_TYPES);

// Company rules that apply to every request.
export const GENERAL_RULES = {
  maxDaysAhead: 365, // requests can start at most a year from today
  reasonMaxLength: 500,
  reasonRequired: (type) => type !== 'ANNUAL',
};

/* ---------- Annual leave entitlement (4857 m.53) ---------- */

/** Days earned for completing the given service year. */
export function entitlementForYear(serviceYear, ageAtAnniversary) {
  let days = 14; // 1 to 5 years
  if (serviceYear >= 15) days = 26;
  else if (serviceYear > 5) days = 20;
  // Workers aged 18 or younger, or 50 or older, get at least 20 days.
  if (ageAtAnniversary != null && (ageAtAnniversary <= 18 || ageAtAnniversary >= 50)) {
    days = Math.max(days, 20);
  }
  return days;
}

/** Total annual leave earned between the hire date and `asOf`. */
export function earnedAnnualDays({ hireDate, birthDate }, asOf) {
  const years = fullYearsBetween(hireDate, asOf);
  let total = 0;
  for (let year = 1; year <= years; year++) {
    const anniversary = addYears(hireDate, year);
    const age = birthDate ? fullYearsBetween(birthDate, anniversary) : null;
    total += entitlementForYear(year, age);
  }
  return total;
}

/**
 * Annual leave balance for a user.
 * requests: the user's leave requests ({ type, status, days }).
 */
export function annualBalance(user, requests, asOf) {
  const earned = earnedAnnualDays(user, asOf);
  const adjustment = Number(user.annualLeaveAdjustment || 0);
  const sum = (status) => requests
    .filter((r) => r.type === 'ANNUAL' && r.status === status)
    .reduce((total, r) => total + Number(r.days), 0);
  const used = sum('APPROVED');
  const pending = sum('PENDING');

  const yearsOfService = fullYearsBetween(user.hireDate, asOf);
  const nextAccrualDate = addYears(user.hireDate, yearsOfService + 1);
  const ageNext = user.birthDate ? fullYearsBetween(user.birthDate, nextAccrualDate) : null;

  return {
    earned,
    adjustment,
    used,
    pending,
    available: earned + adjustment - used - pending,
    yearsOfService,
    nextAccrualDate,
    nextAccrualDays: entitlementForYear(yearsOfService + 1, ageNext),
  };
}

/* ---------- Checking a request ---------- */

const ACTIVE = ['PENDING', 'APPROVED'];

/**
 * Checks a leave request against every rule.
 *
 * input:   { type, startDate, endDate, reason }
 * user:    { hireDate, birthDate, annualLeaveAdjustment }
 * others:  the user's other requests ({ id, type, status, startDate, endDate, days })
 * today:   ISO date
 *
 * Returns { days, calendarDays, holidays, balance, problems } where
 * problems is a list of { code, params } — empty when the request is valid.
 */
export function evaluateLeave(input, user, others, today) {
  const problems = [];
  const add = (code, params = {}) => problems.push({ code, params });
  const rule = LEAVE_TYPES[input.type];

  if (!rule) add('INVALID_TYPE');
  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);
  if (!start || !end) add('INVALID_DATES');
  if (!rule || !start || !end) return { days: 0, calendarDays: 0, holidays: [], balance: null, problems };

  if (end < start) {
    add('END_BEFORE_START');
    return { days: 0, calendarDays: 0, holidays: [], balance: null, problems };
  }

  const { days, calendarDays, holidays } = countLeaveDays(input.startDate, input.endDate, rule.unit);
  if (days <= 0) add('NO_WORKING_DAYS');

  // Timing
  const daysFromToday = daysBetween(today, input.startDate);
  if (daysFromToday < 0 && -daysFromToday > rule.maxPastDays) {
    add('PAST_NOT_ALLOWED', { maxPastDays: rule.maxPastDays });
  } else if (daysFromToday >= 0 && daysFromToday < rule.minNoticeDays) {
    add('NOTICE_TOO_SHORT', { minNoticeDays: rule.minNoticeDays, earliest: addDays(today, rule.minNoticeDays) });
  }
  if (daysFromToday > GENERAL_RULES.maxDaysAhead) {
    add('TOO_FAR_AHEAD', { maxDaysAhead: GENERAL_RULES.maxDaysAhead });
  }

  // Service and limits
  const eligible = !rule.minServiceYears
    || fullYearsBetween(user.hireDate, input.startDate) >= rule.minServiceYears;
  if (!eligible) add('NOT_ELIGIBLE_YET', { eligibleFrom: addYears(user.hireDate, rule.minServiceYears) });
  if (rule.maxPerRequest && days > rule.maxPerRequest) {
    add('EXCEEDS_MAX_PER_REQUEST', { max: rule.maxPerRequest });
  }

  const active = others.filter((r) => ACTIVE.includes(r.status) && r.id !== input.id);

  if (rule.yearlyLimit) {
    const year = input.startDate.slice(0, 4);
    const used = active
      .filter((r) => r.type === input.type && r.startDate.slice(0, 4) === year)
      .reduce((total, r) => total + Number(r.days), 0);
    if (used + days > rule.yearlyLimit) {
      add('EXCEEDS_YEARLY_LIMIT', { limit: rule.yearlyLimit, used, year: Number(year) });
    }
  }

  let balance = null;
  if (rule.usesAnnualBalance) {
    balance = annualBalance(user, active, input.startDate);
    if (eligible && days > balance.available) {
      add('INSUFFICIENT_BALANCE', { available: balance.available, requested: days });
    }
  }

  const overlap = active.find((r) => r.startDate <= input.endDate && r.endDate >= input.startDate);
  if (overlap) add('OVERLAPPING_REQUEST', { startDate: overlap.startDate, endDate: overlap.endDate });

  // Reason
  const reason = (input.reason || '').trim();
  if (GENERAL_RULES.reasonRequired(input.type) && !reason) add('REASON_REQUIRED');
  if (reason.length > GENERAL_RULES.reasonMaxLength) {
    add('REASON_TOO_LONG', { max: GENERAL_RULES.reasonMaxLength });
  }

  return { days, calendarDays, holidays, balance, problems };
}
