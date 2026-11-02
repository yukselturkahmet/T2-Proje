import React from 'react';
import styled, { css } from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';

// Cards use the same soft navy gradient as the T2 website.
export const Card = styled.section`
  background: linear-gradient(140deg, rgba(29, 40, 56, 0.55), rgba(16, 24, 36, 0.55));
  border: 1px solid ${t.line};
  border-radius: ${t.radius.card};
  ${(p) => p.$pad !== false && css`padding: ${p.$pad || '28px'};`}

  @media (max-width: 640px) {
    ${(p) => p.$pad !== false && css`padding: 20px;`}
  }
`;

// Outlined pill, like the section labels on t2.com.tr.
export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: ${t.radius.pill};
  border: 1px solid ${(p) => p.$border || 'rgba(49, 131, 255, 0.45)'};
  background: ${(p) => p.$bg || 'rgba(49, 131, 255, 0.08)'};
  color: ${(p) => p.$color || '#7DB0FF'};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
`;

const STATUS_STYLE = {
  PENDING: { $color: t.amber, $bg: t.amberTint, $border: 'rgba(242, 184, 75, 0.35)' },
  APPROVED: { $color: t.green, $bg: t.greenTint, $border: 'rgba(69, 211, 142, 0.35)' },
  REJECTED: { $color: t.red, $bg: t.redTint, $border: 'rgba(255, 111, 111, 0.35)' },
  CANCELLED: { $color: t.textMuted, $bg: 'rgba(133, 146, 166, 0.10)', $border: 'rgba(133, 146, 166, 0.3)' },
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
    <Tag {...STATUS_STYLE[status]}>
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
    font-weight: 500;
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
  color: #9CC2FF;
  font-size: ${(p) => Math.round((p.$size || 40) * 0.36)}px;
  font-weight: 600;
`;

export const initials = (user) => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
