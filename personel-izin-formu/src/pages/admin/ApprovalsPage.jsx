import React, { useState } from 'react';
import styled from 'styled-components';
import { DECIDE_LEAVE, LEAVE_REQUESTS, OVERVIEW } from '../../api/operations';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { Dialog, DialogActions } from '../../components/Dialog';
import { EmptyState, LoadError, Loading, Notice, useToast } from '../../components/Feedback';
import { Field, Textarea } from '../../components/Form';
import { PageBody, PageHeader } from '../../components/Page';
import { Avatar, Card, Stat, Tag, initials } from '../../components/Surface';
import { useMutation, useQuery } from '../../hooks/useApi';
import { useI18n } from '../../i18n/I18nProvider';
import { t } from '../../theme/tokens';
import { useFormat } from '../../utils/useFormat';

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 40px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
  @media (max-width: 1020px) { grid-template-columns: 1fr; }
`;

const Queue = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
`;

const Item = styled.li`
  padding: 24px;
  border-radius: 20px;
  border: 1px solid ${t.line};
  background: ${t.raised};

  header { display: flex; align-items: center; gap: 14px; }
  header h3 { font-size: 17px; font-weight: 500; letter-spacing: -0.01em; }
  header p { font-size: 14px; color: ${t.textMuted}; }

  .details {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 20px;
    padding: 18px 0;
    border-top: 1px solid ${t.line};
    border-bottom: 1px solid ${t.line};
  }
  .details span { display: block; font-size: 13px; color: ${t.textMuted}; }
  .details strong { display: block; margin-top: 2px; color: ${t.text}; font-weight: 500; }
  .reason { margin-top: 16px; color: ${t.textSoft}; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 20px; }
  .actions .balance { margin-right: auto; font-size: 14px; color: ${t.textMuted}; }

  @media (max-width: 640px) {
    padding: 18px;
    .details { grid-template-columns: 1fr 1fr; }
  }
`;

const Side = styled(Card)`
  h2 { font-size: 18px; }
  h2 + ul { margin-top: 14px; }
  ul { list-style: none; margin: 0 0 28px; padding: 0; display: grid; gap: 12px; }
  ul:last-child { margin-bottom: 0; }
  li { display: flex; align-items: center; gap: 12px; font-size: 14px; }
  li strong { display: block; color: ${t.text}; font-weight: 500; }
  li span { color: ${t.textMuted}; }
  p { color: ${t.textMuted}; font-size: 14px; margin: 10px 0 28px; }
`;

const fullName = (user) => `${user.firstName} ${user.lastName}`;

export function ApprovalsPage() {
  const { user: me } = useAuth();
  const { t: tr } = useI18n();
  const format = useFormat();
  const toast = useToast();
  const overview = useQuery(OVERVIEW);
  const pending = useQuery(LEAVE_REQUESTS, { filter: { status: 'PENDING', limit: 100 } });
  const [decide, { loading: deciding }] = useMutation(DECIDE_LEAVE);
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState(null);

  const run = async (request, approve, decisionNote) => {
    setActionError(null);
    try {
      await decide({ id: request.id, approve, note: decisionNote });
      const name = fullName(request.user);
      toast(tr(approve ? 'approvals.approved' : 'approvals.rejected', { name }));
      setRejecting(null);
      setNote('');
      pending.reload();
      overview.reload();
    } catch (error) {
      setActionError({ id: request.id, error });
    }
  };

  const stats = overview.data?.overview;
  const items = pending.data?.leaveRequests.items || [];

  return (
    <PageBody>
      <PageHeader title={tr('approvals.title')} intro={tr('approvals.intro')} />

      {overview.error && <LoadError error={overview.error} onRetry={overview.reload} />}
      <Stats>
        <Card $pad="24px"><Stat><strong>{stats ? stats.pendingCount : '–'}</strong><span>{tr('approvals.stats.pending')}</span></Stat></Card>
        <Card $pad="24px"><Stat><strong>{stats ? stats.onLeaveToday.length : '–'}</strong><span>{tr('approvals.stats.onLeave')}</span></Stat></Card>
        <Card $pad="24px"><Stat><strong>{stats ? stats.upcoming.length : '–'}</strong><span>{tr('approvals.stats.upcoming')}</span></Stat></Card>
        <Card $pad="24px"><Stat><strong>{stats ? stats.activeEmployees : '–'}</strong><span>{tr('approvals.stats.employees')}</span></Stat></Card>
      </Stats>

      <Layout>
        <section>
          <h2 style={{ fontSize: 24, marginBottom: 20 }}>{tr('approvals.queueTitle')}</h2>
          {pending.error && <LoadError error={pending.error} onRetry={pending.reload} />}
          {pending.loading && !pending.data && <Loading />}
          {pending.data && items.length === 0 && (
            <EmptyState title={tr('approvals.emptyTitle')} text={tr('approvals.emptyText')} />
          )}

          <Queue>
            {items.map((r) => {
              const own = String(r.user.id) === String(me.id);
              return (
                <Item key={r.id}>
                  <header>
                    <Avatar>{initials(r.user)}</Avatar>
                    <div>
                      <h3>{fullName(r.user)}</h3>
                      <p>{format.date(r.createdAt)}</p>
                    </div>
                  </header>
                  <div className="details">
                    <div><span>{tr('requests.type')}</span><strong>{tr(`types.${r.type}`)}</strong></div>
                    <div><span>{tr('requests.dates')}</span><strong>{format.range(r.startDate, r.endDate)}</strong></div>
                    <div><span>{tr('requests.days')}</span><strong>{format.days(r.days)}</strong></div>
                  </div>
                  {r.reason && <p className="reason">{r.reason}</p>}
                  {actionError?.id === r.id && (
                    <Notice $tone="error" style={{ marginTop: 16 }}>{format.error(actionError.error)}</Notice>
                  )}
                  <div className="actions">
                    {r.type === 'ANNUAL' && (
                      <span className="balance">
                        {tr('approvals.balanceAfter', { days: format.days(r.user.annualBalance.available) })}
                      </span>
                    )}
                    {own ? (
                      <Tag $color={t.textMuted} $bg="transparent" $border={t.line}>{tr('errors.SELF_APPROVAL')}</Tag>
                    ) : (
                      <>
                        <Button $small $variant="danger" disabled={deciding} onClick={() => { setRejecting(r); setActionError(null); }}>
                          {tr('approvals.reject')}
                        </Button>
                        <Button $small $variant="approve" disabled={deciding} onClick={() => run(r, true)}>
                          {tr('approvals.approve')}
                        </Button>
                      </>
                    )}
                  </div>
                </Item>
              );
            })}
          </Queue>
        </section>

        <Side>
          <h2>{tr('approvals.onLeaveTitle')}</h2>
          {stats && stats.onLeaveToday.length === 0 && <p>{tr('approvals.nobody')}</p>}
          {stats && stats.onLeaveToday.length > 0 && (
            <ul>
              {stats.onLeaveToday.map((r) => (
                <li key={r.id}>
                  <Avatar $size={34}>{initials(r.user)}</Avatar>
                  <div>
                    <strong>{fullName(r.user)}</strong>
                    <span>{tr(`types.${r.type}`)}, {tr('approvals.until', { date: format.date(r.endDate, { day: 'numeric', month: 'short' }) })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <h2>{tr('approvals.upcomingTitle')}</h2>
          {stats && stats.upcoming.length === 0 && <p>{tr('approvals.nobody')}</p>}
          {stats && stats.upcoming.length > 0 && (
            <ul>
              {stats.upcoming.map((r) => (
                <li key={r.id}>
                  <Avatar $size={34}>{initials(r.user)}</Avatar>
                  <div>
                    <strong>{fullName(r.user)}</strong>
                    <span>{format.range(r.startDate, r.endDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Side>
      </Layout>

      <Dialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title={tr('approvals.rejectTitle')}
        description={rejecting && tr('approvals.rejectText', { name: fullName(rejecting.user) })}
      >
        <form onSubmit={(e) => { e.preventDefault(); run(rejecting, false, note); }}>
          {actionError && rejecting && actionError.id === rejecting.id && <Notice $tone="error" style={{ marginBottom: 16 }}>{format.error(actionError.error)}</Notice>}
          <Field as={Textarea} label={tr('approvals.note')} required maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          <DialogActions>
            <Button $variant="secondary" onClick={() => setRejecting(null)}>{tr('common.cancel')}</Button>
            <Button type="submit" $variant="danger" disabled={deciding || !note.trim()}>{tr('approvals.reject')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageBody>
  );
}
