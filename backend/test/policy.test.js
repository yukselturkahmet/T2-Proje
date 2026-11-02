import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addYears, countLeaveDays, fullYearsBetween, parseDate } from '../../shared/calendar.js';
import { annualBalance, earnedAnnualDays, entitlementForYear, evaluateLeave } from '../../shared/policy.js';

const codes = (result) => result.problems.map((p) => p.code);
const veteran = { hireDate: '2015-01-05', birthDate: '1990-01-01', annualLeaveAdjustment: 0 };

describe('calendar', () => {
  it('rejects impossible dates', () => {
    assert.equal(parseDate('2026-02-31'), null);
    assert.equal(parseDate('26-1-1'), null);
  });

  it('skips weekends', () => {
    // Fri 6 Nov – Mon 9 Nov 2026
    assert.equal(countLeaveDays('2026-11-06', '2026-11-09').days, 2);
  });

  it('counts the eve of a religious holiday as half a day', () => {
    // Mon 25 – Fri 29 May 2026: 25 work, 26 eve, 27–29 Kurban Bayramı
    const result = countLeaveDays('2026-05-25', '2026-05-29');
    assert.equal(result.days, 1.5);
    assert.equal(result.holidays.length, 4);
  });

  it('counts every day for calendar-day leave', () => {
    assert.equal(countLeaveDays('2026-11-06', '2026-11-09', 'calendar').days, 4);
  });

  it('handles 29 February anniversaries', () => {
    assert.equal(addYears('2024-02-29', 1), '2025-02-28');
    assert.equal(fullYearsBetween('2024-02-29', '2025-02-28'), 1);
  });
});

describe('annual leave entitlement (4857 m.53)', () => {
  it('gives 14 / 20 / 26 days by seniority', () => {
    assert.equal(entitlementForYear(1, 30), 14);
    assert.equal(entitlementForYear(5, 30), 14);
    assert.equal(entitlementForYear(6, 30), 20);
    assert.equal(entitlementForYear(14, 30), 20);
    assert.equal(entitlementForYear(15, 30), 26);
  });

  it('gives at least 20 days to workers aged 18 or under, or 50 or over', () => {
    assert.equal(entitlementForYear(1, 18), 20);
    assert.equal(entitlementForYear(2, 50), 20);
    assert.equal(entitlementForYear(16, 55), 26);
  });

  it('adds up every completed service year', () => {
    assert.equal(earnedAnnualDays({ hireDate: '2020-03-01' }, '2026-02-28'), 14 * 5);
    assert.equal(earnedAnnualDays({ hireDate: '2020-03-01' }, '2026-03-01'), 14 * 5 + 20);
  });

  it('subtracts approved and pending days and applies adjustments', () => {
    const balance = annualBalance(
      { hireDate: '2020-03-01', annualLeaveAdjustment: -10 },
      [
        { type: 'ANNUAL', status: 'APPROVED', days: 5 },
        { type: 'ANNUAL', status: 'PENDING', days: 2.5 },
        { type: 'ANNUAL', status: 'REJECTED', days: 30 },
        { type: 'SICK', status: 'APPROVED', days: 3 },
      ],
      '2026-03-01',
    );
    assert.equal(balance.available, 90 - 10 - 5 - 2.5);
    assert.equal(balance.nextAccrualDays, 20);
  });
});

describe('evaluateLeave', () => {
  const today = '2026-11-02';

  it('accepts a valid annual leave request', () => {
    const result = evaluateLeave({ type: 'ANNUAL', startDate: '2026-11-16', endDate: '2026-11-20' }, veteran, [], today);
    assert.deepEqual(codes(result), []);
    assert.equal(result.days, 5);
  });

  it('requires one year of service for annual leave', () => {
    const result = evaluateLeave(
      { type: 'ANNUAL', startDate: '2026-11-16', endDate: '2026-11-16' },
      { hireDate: '2026-01-01' }, [], today,
    );
    assert.deepEqual(codes(result), ['NOT_ELIGIBLE_YET']);
  });

  it('enforces the notice period and past-date limits', () => {
    assert.ok(codes(evaluateLeave({ type: 'ANNUAL', startDate: '2026-11-03', endDate: '2026-11-03' }, veteran, [], today))
      .includes('NOTICE_TOO_SHORT'));
    assert.ok(codes(evaluateLeave({ type: 'ANNUAL', startDate: '2026-10-30', endDate: '2026-10-30' }, veteran, [], today))
      .includes('PAST_NOT_ALLOWED'));
    // Sick leave can be entered afterwards.
    assert.deepEqual(codes(evaluateLeave(
      { type: 'SICK', startDate: '2026-10-29', endDate: '2026-10-30', reason: 'Rapor' }, veteran, [], today,
    )), []);
  });

  it('caps marriage leave at 3 days', () => {
    const result = evaluateLeave(
      { type: 'MARRIAGE', startDate: '2026-11-16', endDate: '2026-11-19', reason: 'Düğün' }, veteran, [], today,
    );
    assert.deepEqual(codes(result), ['EXCEEDS_MAX_PER_REQUEST']);
  });

  it('applies yearly limits across requests', () => {
    const others = [{ id: 1, type: 'EXCUSE', status: 'APPROVED', startDate: '2026-03-02', endDate: '2026-03-05', days: 4 }];
    const result = evaluateLeave(
      { type: 'EXCUSE', startDate: '2026-11-16', endDate: '2026-11-17', reason: 'Taşınma' }, veteran, others, today,
    );
    assert.deepEqual(codes(result), ['EXCEEDS_YEARLY_LIMIT']);
  });

  it('blocks overlapping requests but ignores rejected ones', () => {
    const others = [
      { id: 1, type: 'ANNUAL', status: 'PENDING', startDate: '2026-11-18', endDate: '2026-11-19', days: 2 },
      { id: 2, type: 'ANNUAL', status: 'REJECTED', startDate: '2026-11-23', endDate: '2026-11-24', days: 2 },
    ];
    const input = { type: 'ANNUAL', startDate: '2026-11-16', endDate: '2026-11-20' };
    assert.ok(codes(evaluateLeave(input, veteran, others, today)).includes('OVERLAPPING_REQUEST'));
    assert.deepEqual(codes(evaluateLeave({ ...input, startDate: '2026-11-23', endDate: '2026-11-24' }, veteran, others, today)), []);
  });

  it('rejects ranges with no working days and requires a reason for other types', () => {
    assert.deepEqual(codes(evaluateLeave({ type: 'ANNUAL', startDate: '2026-11-07', endDate: '2026-11-08' }, veteran, [], today)),
      ['NO_WORKING_DAYS']);
    assert.deepEqual(codes(evaluateLeave({ type: 'UNPAID', startDate: '2026-11-16', endDate: '2026-11-16' }, veteran, [], today)),
      ['REASON_REQUIRED']);
  });
});
