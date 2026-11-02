import { useMemo } from 'react';
import { parseDate } from '@shared/calendar.js';
import { formatNumber, useI18n } from '../i18n/I18nProvider';

const DATE_PARAMS = ['earliest', 'eligibleFrom', 'startDate', 'endDate'];

/** Locale-aware formatting of dates, day counts, problems and errors. */
export function useFormat() {
  const { t, plural, locale, lang } = useI18n();

  return useMemo(() => {
    const date = (iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
      if (!iso) return '';
      const value = iso.length === 10 ? parseDate(iso) : new Date(iso);
      return value ? new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(value) : '';
    };

    const range = (start, end) => (start === end ? date(start) : `${date(start)} – ${date(end)}`);

    const number = (n) => formatNumber(Number(n), lang);
    const days = (n) => plural('units.day', Number(n));
    const dayWord = (n) => plural('units.dayWord', Number(n));
    const years = (n) => plural('units.year', Number(n));

    // One leave-rule problem ({ code, params }) as a sentence.
    const problem = ({ code, params = {} }) => {
      const values = { ...params };
      for (const name of DATE_PARAMS) if (values[name]) values[name] = date(values[name]);
      if (code === 'PAST_NOT_ALLOWED' && !params.maxPastDays) return t('problems.PAST_NOT_ALLOWED_0');
      return t(`problems.${code}`, values);
    };

    // An ApiError as a sentence. Rule errors list every broken rule.
    const error = (err) => {
      if (!err) return '';
      if (err.code === 'LEAVE_RULES' && err.params?.problems?.length) {
        return err.params.problems.map(problem).join(' ');
      }
      const params = { ...err.params };
      if (params.field) params.field = t(`fields.${params.field}`);
      const message = t(`errors.${err.code}`, params);
      return message.startsWith('errors.') ? t('errors.INTERNAL') : message;
    };

    return { date, range, number, days, dayWord, years, problem, error };
  }, [t, plural, locale, lang]);
}
