import React from 'react';
import styled, { css } from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';

export const Card = styled.section`
  background: ${t.surface};
  border: 1px solid ${t.line};
  box-shadow: ${t.shadow};
  border-radius: ${t.radius.card};
  ${(p) => p.$pad !== false && css`padding: ${p.$pad || '28px'};`}

  @media (max-width: 640px) {
    ${(p) => p.$pad !== false && css`padding: 20px;`}
  }
`;

// Small outlined pill for labels and statuses.
export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: ${t.radius.pill};
  border: 1px solid ${(p) => (p.$tone || t.status.blue).border};
  background: ${(p) => (p.$tone || t.status.blue).bg};
  color: ${(p) => (p.$tone || t.status.blue).fg};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
`;

const STATUS_TONE = {
  PENDING: t.status.amber,
  APPROVED: t.status.green,
  REJECTED: t.status.red,
  CANCELLED: t.status.gray,
};

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

export function StatusBadge({ status }) {
  const { t: tr } = useI18n();
  return (
    <Tag $tone={STATUS_TONE[status]}>
      <Dot aria-hidden="true" />
      {tr(`status.${status}`)}
    </Tag>
  );
}

export const Stat = styled.div`
  strong {
    display: block;
    color: ${t.text};
    font-size: clamp(30px, 3.4vw, 40px);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
  }
  span { display: block; margin-top: 8px; font-size: 14px; color: ${t.textMuted}; }
`;

export const Avatar = styled.span`
  flex: none;
  width: ${(p) => p.$size || 40}px;
  height: ${(p) => p.$size || 40}px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: ${t.blueTint};
  color: ${t.blue};
  font-size: ${(p) => Math.round((p.$size || 40) * 0.36)}px;
  font-weight: 600;
`;

export const initials = (user) => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
