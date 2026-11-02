import React, { useState } from 'react';
import styled from 'styled-components';
import { LEAVE_TYPE_CODES } from '@shared/policy.js';
import { LEAVE_REQUESTS, USERS } from '../../api/operations';
import { Button } from '../../components/Button';
import { EmptyState, LoadError, Loading } from '../../components/Feedback';
import { Field, Select } from '../../components/Form';
import { PageBody, PageHeader } from '../../components/Page';
import { Card, StatusBadge } from '../../components/Surface';
import { Table } from '../../components/Table';
import { useQuery } from '../../hooks/useApi';
import { useI18n } from '../../i18n/I18nProvider';
import { t } from '../../theme/tokens';
import { useFormat } from '../../utils/useFormat';

const PAGE_SIZE = 20;
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const Filters = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-top: 1px solid ${t.line};
  color: ${t.textMuted};
  font-size: 14px;
  div { display: flex; gap: 8px; }
`;

export function RequestsPage() {
  const { t: tr } = useI18n();
  const format = useFormat();
  const thisYear = new Date().getFullYear();
  const [filter, setFilter] = useState({ status: '', userId: '', type: '', year: String(thisYear) });
  const [page, setPage] = useState(0);

  const users = useQuery(USERS, { includeInactive: true });
  const variables = {
    filter: {
      ...(filter.status && { status: filter.status }),
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.type && { type: filter.type }),
      ...(filter.year && { year: Number(filter.year) }),
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    },
  };
  const { data, error, loading, reload } = useQuery(LEAVE_REQUESTS, variables);

  const change = (field) => (e) => {
    setFilter((f) => ({ ...f, [field]: e.target.value }));
    setPage(0);
  };

  const total = data?.leaveRequests.total || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = data?.leaveRequests.items || [];

  return (
    <PageBody>
      <PageHeader title={tr('requests.title')} intro={tr('requests.intro')} />

      <Filters>
        <Field as={Select} label={tr('requests.status')} value={filter.status} onChange={change('status')}>
          <option value="">{tr('common.all')}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{tr(`status.${s}`)}</option>)}
        </Field>
        <Field as={Select} label={tr('requests.employee')} value={filter.userId} onChange={change('userId')}>
          <option value="">{tr('common.all')}</option>
          {(users.data?.users || []).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </Field>
        <Field as={Select} label={tr('requests.type')} value={filter.type} onChange={change('type')}>
          <option value="">{tr('common.all')}</option>
          {LEAVE_TYPE_CODES.map((code) => <option key={code} value={code}>{tr(`types.${code}`)}</option>)}
        </Field>
        <Field as={Select} label={tr('requests.year')} value={filter.year} onChange={change('year')}>
          <option value="">{tr('common.all')}</option>
          {[thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y} value={y}>{y}</option>)}
        </Field>
      </Filters>

      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && items.length === 0 && <EmptyState title={tr('requests.emptyTitle')} text={tr('requests.emptyText')} />}

      {items.length > 0 && (
        <Card $pad={false} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>{tr('requests.employee')}</th>
                  <th>{tr('requests.type')}</th>
                  <th>{tr('requests.dates')}</th>
                  <th>{tr('requests.days')}</th>
                  <th>{tr('requests.status')}</th>
                  <th>{tr('requests.decision')}</th>
                </tr>
              </thead>
              <tbody style={{ opacity: loading ? 0.5 : 1 }}>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.user.firstName} {r.user.lastName}</strong><small>{r.user.username}</small></td>
                    <td>{tr(`types.${r.type}`)}{r.reason && <small>{r.reason}</small>}</td>
                    <td className="num">{format.range(r.startDate, r.endDate)}</td>
                    <td className="num">{format.days(r.days)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.decidedBy ? `${r.decidedBy.firstName} ${r.decidedBy.lastName}` : tr('policy.none')}
                      {r.decisionNote && <small>{r.decisionNote}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Footer>
            <span>{tr('requests.total', { n: total })}, {tr('common.pageOf', { page: page + 1, total: pages })}</span>
            <div>
              <Button $small $variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>{tr('common.previous')}</Button>
              <Button $small $variant="secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>{tr('common.next')}</Button>
            </div>
          </Footer>
        </Card>
      )}
    </PageBody>
  );
}
