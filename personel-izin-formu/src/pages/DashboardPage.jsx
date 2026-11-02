import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CANCEL_LEAVE, MY_REQUESTS } from '../api/operations';
import { useAuth } from '../auth/AuthProvider';
import { Beams } from '../components/Beams';
import { Button } from '../components/Button';
import { Dialog, DialogActions } from '../components/Dialog';
import { EmptyState, LoadError, Loading, Notice, useTitle, useToast } from '../components/Feedback';
import { PageBody, Section, Segmented, Toolbar } from '../components/Page';
import { Card, StatusBadge, Tag } from '../components/Surface';
import { useMutation, useQuery } from '../hooks/useApi';
import { useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';
import { todayISO } from '@shared/calendar.js';

const Hero = styled(Card)`
  position: relative;
  overflow: hidden;
  padding: 44px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 40px;
  align-items: end;

  > :not([aria-hidden]) { position: relative; z-index: 1; }
  @media (max-width: 760px) { grid-template-columns: 1fr; padding: 28px 22px; }
`;

const Greeting = styled.h1`
  font-size: clamp(32px, 4vw, 48px);
`;

const Big = styled.div`
  margin-top: 36px;
  color: ${t.textMuted};
  font-size: 15px;

  strong {
    display: block;
    margin-top: 6px;
    color: ${t.text};
    font-size: clamp(72px, 11vw, 132px);
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 0.95;
    font-variant-numeric: tabular-nums;
  }
  strong small { font-size: 0.32em; letter-spacing: -0.01em; color: ${t.textSoft}; margin-left: 10px; }
  p { margin-top: 18px; color: ${t.textSoft}; }
`;

const Breakdown = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 32px;
  padding: 24px;
  @media (max-width: 640px) { gap: 18px 16px; padding: 18px; dd { font-size: 19px; } }
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid ${t.line};
  backdrop-filter: blur(8px);

  dt { font-size: 13px; color: ${t.textMuted}; }
  dd { margin: 4px 0 0; color: ${t.text}; font-size: 22px; font-weight: 500; font-variant-numeric: tabular-nums; }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
`;

const Row = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.2fr) 150px 150px;
  align-items: center;
  gap: 16px 24px;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid ${t.line};
  background: ${t.raised};

  h3 { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; }
  .muted { color: ${t.textMuted}; font-size: 14px; margin-top: 4px; }
  .note { grid-column: 1 / -1; font-size: 14px; color: ${t.textMuted}; padding-top: 12px; border-top: 1px solid ${t.line}; }
  .note strong { color: ${t.textSoft}; font-weight: 500; }

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 18px;
    > div:last-of-type:empty { display: none; }
    .when { grid-column: 1 / -1; grid-row: 2; }
  }
`;

const FILTERS = {
  all: () => true,
  PENDING: (r) => r.status === 'PENDING',
  APPROVED: (r) => r.status === 'APPROVED',
  closed: (r) => r.status === 'REJECTED' || r.status === 'CANCELLED',
};

export function DashboardPage() {
  const { user, refresh } = useAuth();
  const { t: tr } = useI18n();
  const format = useFormat();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, error, loading, reload } = useQuery(MY_REQUESTS);
  const [cancel, { loading: cancelling, error: cancelError }] = useMutation(CANCEL_LEAVE);
  const [filter, setFilter] = useState('all');
  const [toCancel, setToCancel] = useState(null);
  useTitle(tr('nav.dashboard'));

  const balance = user.annualBalance;
  const eligible = balance.yearsOfService >= 1;
  const requests = data?.myLeaveRequests || [];
  const shown = requests.filter(FILTERS[filter]);
  const today = todayISO();

  const confirmCancel = async () => {
    try {
      await cancel({ id: toCancel.id });
      setToCancel(null);
      toast(tr('dashboard.cancelled'));
      reload();
      refresh();
    } catch {
      // Shown in the dialog.
    }
  };

  return (
    <PageBody>
      {location.state?.submitted && (
        <Notice $tone="success" style={{ marginBottom: 24 }}>{tr('dashboard.submitted')}</Notice>
      )}

      <Hero>
        <Beams $top="-10%" $right="-12%" $top2="30%" $right2="10%" />
        <div>
          <Greeting>{tr('dashboard.greeting', { name: user.firstName })}</Greeting>
          <Big>
            {tr('dashboard.annualTitle')}
            <strong>
              {format.number(balance.available)}
              <small>{format.dayWord(balance.available)}</small>
            </strong>
            <p>
              {eligible
                ? tr('dashboard.nextAccrual', { date: format.date(balance.nextAccrualDate), days: balance.nextAccrualDays })
                : tr('dashboard.notEligible', { date: format.date(balance.nextAccrualDate) })}
            </p>
          </Big>
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <Breakdown>
            <div><dt>{tr('dashboard.earned')}</dt><dd>{format.days(balance.earned)}</dd></div>
            <div><dt>{tr('dashboard.used')}</dt><dd>{format.days(balance.used)}</dd></div>
            <div><dt>{tr('dashboard.pending')}</dt><dd>{format.days(balance.pending)}</dd></div>
            <div><dt>{tr('dashboard.adjustment')}</dt><dd>{format.days(balance.adjustment)}</dd></div>
          </Breakdown>
          <Button onClick={() => navigate('/request')}>{tr('dashboard.newRequest')}</Button>
        </div>
      </Hero>

      <Section>
        <Toolbar style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 24 }}>{tr('dashboard.myRequests')}</h2>
          <Segmented role="group">
            {Object.keys(FILTERS).map((key) => (
              <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {tr(`dashboard.filters.${key}`)}
              </button>
            ))}
          </Segmented>
        </Toolbar>

        {error && <LoadError error={error} onRetry={reload} />}
        {loading && !data && <Loading />}
        {data && shown.length === 0 && (
          <EmptyState
            title={tr('dashboard.emptyTitle')}
            text={tr('dashboard.emptyText')}
            action={<Button as={Link} to="/request">{tr('dashboard.newRequest')}</Button>}
          />
        )}

        <List>
          {shown.map((r) => {
            const cancellable = r.status === 'PENDING' || (r.status === 'APPROVED' && r.startDate > today);
            return (
              <Row key={r.id}>
                <div>
                  <h3>{tr(`types.${r.type}`)}</h3>
                  {r.reason && <p className="muted">{r.reason}</p>}
                </div>
                <div className="when">
                  {format.range(r.startDate, r.endDate)}
                  <p className="muted">{format.days(r.days)}</p>
                </div>
                <StatusBadge status={r.status} />
                <div>
                  {cancellable && (
                    <Button $small $variant="ghost" onClick={() => setToCancel(r)}>{tr('dashboard.cancelRequest')}</Button>
                  )}
                </div>
                {(r.decisionNote || r.decidedBy) && (
                  <p className="note">
                    {r.decisionNote && <>{r.decisionNote} </>}
                    {r.decidedBy && (
                      <Tag $color={t.textMuted} $bg="transparent" $border={t.line}>
                        {tr('dashboard.decisionBy', { name: `${r.decidedBy.firstName} ${r.decidedBy.lastName}`, date: format.date(r.decidedAt) })}
                      </Tag>
                    )}
                  </p>
                )}
              </Row>
            );
          })}
        </List>
      </Section>

      <Dialog
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        title={tr('dashboard.cancelConfirmTitle')}
        description={toCancel && tr('dashboard.cancelConfirmText', {
          type: tr(`types.${toCancel.type}`),
          range: format.range(toCancel.startDate, toCancel.endDate),
        })}
      >
        {cancelError && <Notice $tone="error">{format.error(cancelError)}</Notice>}
        <DialogActions>
          <Button $variant="secondary" onClick={() => setToCancel(null)}>{tr('common.cancel')}</Button>
          <Button $variant="danger" disabled={cancelling} onClick={confirmCancel}>{tr('dashboard.cancelRequest')}</Button>
        </DialogActions>
      </Dialog>
    </PageBody>
  );
}
