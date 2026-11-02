import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { todayISO } from '@shared/calendar.js';
import { GENERAL_RULES, LEAVE_TYPES, evaluateLeave } from '@shared/policy.js';
import { MY_REQUESTS, REQUEST_LEAVE } from '../api/operations';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/Button';
import { LoadError, Loading, Notice } from '../components/Feedback';
import { Field, FormGrid, Textarea } from '../components/Form';
import { PageBody, PageHeader } from '../components/Page';
import { Card, Tag } from '../components/Surface';
import { useMutation, useQuery } from '../hooks/useApi';
import { useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';

const GROUPS = {
  annual: ['ANNUAL'],
  legal: ['MARRIAGE', 'PATERNITY', 'BEREAVEMENT', 'ADOPTION'],
  health: ['SICK', 'CHILD_CARE', 'MATERNITY'],
  other: ['EXCUSE', 'UNPAID'],
};

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 28px;
  align-items: start;
  @media (max-width: 1020px) { grid-template-columns: 1fr; }
`;

const Step = styled.section`
  & + & { margin-top: 40px; padding-top: 36px; border-top: 1px solid ${t.line}; }
  h2 { margin-bottom: 20px; font-size: 20px; letter-spacing: -0.015em; }
`;

const Group = styled.div`
  & + & { margin-top: 22px; }
`;

const GroupLabel = styled.p`
  margin-bottom: 10px;
  font-size: 13px;
  color: ${t.textMuted};
`;

const Types = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  @media (max-width: 640px) { grid-template-columns: 1fr 1fr; }
`;

const TypeOption = styled.label`
  position: relative;
  display: block;
  min-width: 0;
  padding: 14px 16px;
  @media (max-width: 640px) { padding: 12px; strong { font-size: 14px; } }
  border-radius: 14px;
  border: 1px solid ${(p) => (p.$checked ? t.blue : t.line)};
  background: ${(p) => (p.$checked ? t.blueTint : t.surface)};
  box-shadow: ${(p) => (p.$checked ? `0 0 0 1px ${t.blue}` : 'none')};
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ${t.ease};
  &:active { transform: scale(0.98); }

  &:hover { border-color: ${(p) => (p.$checked ? t.blue : t.lineStrong)}; }
  &:has(input:focus-visible) { outline: 2px solid ${t.blue}; outline-offset: 2px; }

  input { position: absolute; opacity: 0; pointer-events: none; }
  strong { display: block; color: ${(p) => (p.$checked ? t.blue : t.text)}; font-size: 15px; font-weight: 600; }
  span { display: block; margin-top: 2px; font-size: 13px; color: ${t.textMuted}; }
`;

const TypeHint = styled.p`
  margin-top: 16px;
  font-size: 14px;
  color: ${t.textSoft};
  padding: 14px 16px;
  border-radius: 12px;
  background: ${t.surfaceSoft};
  border: 1px solid ${t.line};
`;

const FormCard = styled(Card)`
  padding: 36px;
  @media (max-width: 640px) { padding: 20px 16px; }
`;

const Summary = styled(Card)`
  position: sticky;
  top: 96px;
  @media (max-width: 1020px) { position: static; }
`;

const Total = styled.div`
  margin-top: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${t.line};

  span { font-size: 14px; color: ${t.textMuted}; }
  strong {
    display: block;
    margin-top: 4px;
    color: ${t.text};
    font-size: 64px;
    font-weight: 700;
    letter-spacing: -0.045em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  strong small { font-size: 20px; font-weight: 600; color: ${t.green}; margin-left: 8px; letter-spacing: -0.01em; }
  p { margin-top: 10px; font-size: 14px; color: ${t.textSoft}; }
`;

const Facts = styled.dl`
  margin: 20px 0 0;
  display: grid;
  gap: 14px;
  font-size: 14px;

  div { display: flex; justify-content: space-between; gap: 16px; }
  dt { color: ${t.textMuted}; }
  dd { margin: 0; color: ${t.text}; text-align: right; font-variant-numeric: tabular-nums; }
`;

const Holidays = styled.ul`
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: ${t.textSoft};
  li { display: flex; justify-content: space-between; gap: 12px; }
  li span:last-child { color: ${t.textMuted}; white-space: nowrap; }
`;

const Problems = styled.ul`
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
`;

export function NewRequestPage() {
  const { user, refresh } = useAuth();
  const { t: tr } = useI18n();
  const format = useFormat();
  const navigate = useNavigate();
  const mine = useQuery(MY_REQUESTS);
  const [send, { loading: sending, error: sendError }] = useMutation(REQUEST_LEAVE);

  const [form, setForm] = useState({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [attempted, setAttempted] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const rule = LEAVE_TYPES[form.type];
  const datesChosen = Boolean(form.startDate && form.endDate);

  // The same check the server runs, so the result is visible before sending.
  const result = useMemo(() => {
    if (!datesChosen || !mine.data) return null;
    return evaluateLeave(form, user, mine.data.myLeaveRequests, todayISO());
  }, [form, user, mine.data, datesChosen]);

  const visibleProblems = (result?.problems || []).filter((p) =>
    attempted || !['REASON_REQUIRED'].includes(p.code));
  const canSend = result && result.problems.length === 0;

  const submit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    if (!canSend) return;
    try {
      await send({ input: { type: form.type, startDate: form.startDate, endDate: form.endDate, reason: form.reason } });
      await refresh();
      navigate('/', { state: { submitted: true } });
    } catch {
      mine.reload();
    }
  };

  const onStartChange = (e) => {
    const startDate = e.target.value;
    // Keep the range valid: move the last day along when it ends up before the first.
    setForm((f) => ({ ...f, startDate, endDate: !f.endDate || f.endDate < startDate ? startDate : f.endDate }));
  };

  const balanceAfter = result?.balance ? result.balance.available - result.days : null;

  return (
    <PageBody>
      <PageHeader title={tr('request.title')} intro={tr('request.intro')} />
      {mine.error && <LoadError error={mine.error} onRetry={mine.reload} />}

      <Layout>
        <FormCard as="form" onSubmit={submit} noValidate>
          <Step aria-labelledby="step-type">
            <h2 id="step-type">{tr('request.type')}</h2>
            {Object.entries(GROUPS).map(([group, codes]) => (
              <Group key={group}>
                <GroupLabel id={`group-${group}`}>{tr(`request.groups.${group}`)}</GroupLabel>
                <Types role="radiogroup" aria-labelledby={`group-${group}`}>
                  {codes.map((code) => {
                    const r = LEAVE_TYPES[code];
                    const limit = r.maxPerRequest || r.yearlyLimit;
                    return (
                      <TypeOption key={code} $checked={form.type === code}>
                        <input type="radio" name="type" value={code} checked={form.type === code} onChange={set('type')} />
                        <strong>{tr(`types.${code}`)}</strong>
                        <span>
                          {r.usesAnnualBalance && format.days(user.annualBalance.available)}
                          {!r.usesAnnualBalance && limit && format.days(limit)}
                          {!r.usesAnnualBalance && !limit && tr('policy.noLimit')}
                          {r.source === 'company' && `, ${tr('policy.company').toLocaleLowerCase()}`}
                        </span>
                      </TypeOption>
                    );
                  })}
                </Types>
              </Group>
            ))}
            <TypeHint>{tr(`typeHints.${form.type}`)}</TypeHint>
          </Step>

          <Step aria-labelledby="step-dates">
            <h2 id="step-dates">{tr('request.dates')}</h2>
            <FormGrid>
              <Field label={tr('request.start')} type="date" required value={form.startDate} onChange={onStartChange} />
              <Field label={tr('request.end')} type="date" required min={form.startDate || undefined} value={form.endDate} onChange={set('endDate')} />
              <Field
                span
                as={Textarea}
                label={tr('request.reason')}
                optional={!GENERAL_RULES.reasonRequired(form.type)}
                maxLength={GENERAL_RULES.reasonMaxLength}
                value={form.reason}
                onChange={set('reason')}
                hint={tr('request.reasonHint', { count: form.reason.length, max: GENERAL_RULES.reasonMaxLength })}
              />
            </FormGrid>
          </Step>

          {sendError && <Notice $tone="error" style={{ marginTop: 28 }}>{format.error(sendError)}</Notice>}

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button type="submit" disabled={sending || (attempted && !canSend)}>
              {sending ? tr('request.submitting') : tr('request.submit')}
            </Button>
            <Button $variant="secondary" onClick={() => navigate('/')}>{tr('common.cancel')}</Button>
          </div>
        </FormCard>

        <Summary aria-live="polite">
          <Tag>{tr('request.summary')}</Tag>
          {mine.loading && !mine.data && <Loading inline />}

          <Total>
            <span>{tr('request.totalDays')}</span>
            <strong>
              {format.number(result?.days ?? 0)}
              <small>{format.dayWord(result?.days ?? 0)}</small>
            </strong>
            <p>
              {datesChosen ? format.range(form.startDate, form.endDate) : tr('request.pickDates')}
              {datesChosen && ` (${tr(`units.${rule.unit}`)})`}
            </p>
          </Total>

          <Facts>
            <div><dt>{tr('request.type')}</dt><dd>{tr(`types.${form.type}`)}</dd></div>
            {rule.usesAnnualBalance && (
              <div>
                <dt>{tr('request.balanceAfter')}</dt>
                <dd style={{ color: balanceAfter != null && balanceAfter < 0 ? t.status.red.fg : undefined }}>
                  {format.days(balanceAfter ?? user.annualBalance.available)}
                </dd>
              </div>
            )}
          </Facts>

          {datesChosen && result && rule.unit === 'workdays' && (
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 14, color: t.textMuted }}>{tr('request.holidaysInRange')}</span>
              {result.holidays.length === 0 ? (
                <p style={{ fontSize: 13, color: t.textSoft, marginTop: 6 }}>{tr('request.noHolidays')}</p>
              ) : (
                <Holidays>
                  {result.holidays.map((h) => (
                    <li key={h.date}>
                      <span>{tr(`holidays.${h.name}`)}{h.half && ` (${tr('policy.half')})`}</span>
                      <span>{format.date(h.date, { day: 'numeric', month: 'short' })}</span>
                    </li>
                  ))}
                </Holidays>
              )}
            </div>
          )}

          {result && (
            <Problems>
              {visibleProblems.map((p) => (
                <li key={p.code}><Notice $tone="error">{format.problem(p)}</Notice></li>
              ))}
              {visibleProblems.length === 0 && result.problems.length === 0 && (
                <li><Notice $tone="success">{tr('request.ready')}</Notice></li>
              )}
            </Problems>
          )}
        </Summary>
      </Layout>
    </PageBody>
  );
}
