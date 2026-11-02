import React, { useState } from 'react';
import styled from 'styled-components';
import { hasHolidayCalendar, holidaysOf } from '@shared/calendar.js';
import { LEAVE_TYPES, LEAVE_TYPE_CODES } from '@shared/policy.js';
import { PageBody, PageHeader, Section, Segmented } from '../components/Page';
import { Card, Tag } from '../components/Surface';
import { Notice } from '../components/Feedback';
import { Table } from '../components/Table';
import { useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';

const TableWrap = styled(Card)`
  overflow-x: auto;
`;


const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Tiers = styled.dl`
  margin: 20px 0 0;
  div { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid ${t.line}; }
  div:last-child { border-bottom: 0; }
  dt { color: ${t.textSoft}; }
  dd { margin: 0; color: ${t.text}; font-weight: 500; text-align: right; }
`;

const Rules = styled.ul`
  margin: 20px 0 0;
  padding: 0 0 0 20px;
  display: grid;
  gap: 12px;
  li::marker { color: ${t.blue}; }
`;

const HolidayList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0 32px;

  li { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid ${t.line}; }
  li span:first-child { color: ${t.textSoft}; }
  li span:last-child { color: ${t.text}; white-space: nowrap; font-variant-numeric: tabular-nums; }
  small { color: ${t.textMuted}; }
`;

export function PolicyPage() {
  const { t: tr } = useI18n();
  const format = useFormat();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);

  const limit = (rule) => {
    if (rule.usesAnnualBalance) return tr('policy.fromBalance');
    if (rule.maxPerRequest) return tr('policy.perRequest', { n: format.days(rule.maxPerRequest) });
    if (rule.yearlyLimit) return tr('policy.perYear', { n: format.days(rule.yearlyLimit) });
    return tr('policy.noLimit');
  };

  return (
    <PageBody>
      <PageHeader title={tr('policy.title')} intro={tr('policy.intro')} />

      <TableWrap $pad={false}>
        <Table>
          <thead>
            <tr>
              {['type', 'limit', 'notice', 'past', 'source'].map((c) => <th key={c}>{tr(`policy.columns.${c}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {LEAVE_TYPE_CODES.map((code) => {
              const rule = LEAVE_TYPES[code];
              return (
                <tr key={code}>
                  <td>
                    <strong>{tr(`types.${code}`)}</strong>
                    <small>{tr(`typeHints.${code}`)}</small>
                  </td>
                  <td>{limit(rule)}{!rule.paid && <small>{tr('policy.paidNo')}</small>}</td>
                  <td className="num">{rule.minNoticeDays ? format.days(rule.minNoticeDays) : tr('policy.none')}</td>
                  <td className="num">{rule.maxPastDays ? format.days(rule.maxPastDays) : tr('policy.none')}</td>
                  <td>
                    {rule.source === 'law'
                      ? <Tag>{rule.legalRef}</Tag>
                      : <Tag $color={t.amber} $bg={t.amberTint} $border="rgba(242, 184, 75, 0.35)">{tr('policy.company')}</Tag>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      <Section>
        <Columns>
          <Card>
            <h2 style={{ fontSize: 22 }}>{tr('policy.tiersTitle')}</h2>
            <Tiers>
              {tr('policy.tiers').map(([who, days]) => <div key={who}><dt>{who}</dt><dd>{days}</dd></div>)}
            </Tiers>
          </Card>
          <Card>
            <h2 style={{ fontSize: 22 }}>{tr('policy.generalTitle')}</h2>
            <Rules>{tr('policy.general').map((rule) => <li key={rule}>{rule}</li>)}</Rules>
          </Card>
        </Columns>
      </Section>

      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24 }}>{tr('policy.holidaysTitle', { year })}</h2>
          <Segmented role="group">
            {[thisYear, thisYear + 1].map((y) => (
              <button key={y} aria-pressed={year === y} onClick={() => setYear(y)}>{y}</button>
            ))}
          </Segmented>
        </div>
        {!hasHolidayCalendar(year) && <Notice $tone="warning" style={{ marginBottom: 16 }}>{tr('policy.noCalendar', { year })}</Notice>}
        <HolidayList>
          {holidaysOf(year).map((h) => (
            <li key={h.date}>
              <span>{tr(`holidays.${h.name}`)} {h.half && <small>({tr('policy.half')})</small>}</span>
              <span>{format.date(h.date, { day: 'numeric', month: 'long', weekday: 'short' })}</span>
            </li>
          ))}
        </HolidayList>
      </Section>
    </PageBody>
  );
}
