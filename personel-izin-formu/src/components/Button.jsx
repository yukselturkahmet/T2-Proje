import styled, { css } from 'styled-components';
import { t } from '../theme/tokens';

const tone = (s) => css`
  background: ${s.bg};
  color: ${s.fg};
  border-color: ${s.border};
  &:hover:not(:disabled) { background: ${s.border}; }
`;

const variants = {
  primary: css`
    background: ${t.blue};
    color: ${t.surface};
    &:hover:not(:disabled) { background: ${t.blueHover}; }
  `,
  secondary: css`
    background: ${t.surface};
    color: ${t.text};
    border-color: ${t.lineStrong};
    &:hover:not(:disabled) { background: ${t.surfaceSoft}; border-color: ${t.textMuted}; }
  `,
  ghost: css`
    background: transparent;
    color: ${t.textSoft};
    padding: 0 12px;
    &:hover:not(:disabled) { color: ${t.text}; background: ${t.hover}; }
  `,
  // White button for use on the blue brand panels.
  inverse: css`
    background: ${t.surface};
    color: ${t.blue};
    &:hover:not(:disabled) { background: ${t.blueTint}; }
  `,
  approve: tone(t.status.green),
  danger: tone(t.status.red),
};

export const Button = styled.button.attrs((p) => ({ type: p.type || 'button' }))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: ${(p) => (p.$small ? '36px' : '46px')};
  padding: 0 ${(p) => (p.$small ? '16px' : '24px')};
  border-radius: ${t.radius.pill};
  border: 1px solid transparent;
  font-size: ${(p) => (p.$small ? '14px' : '15px')};
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.12s ease;

  ${(p) => variants[p.$variant || 'primary']}
  ${(p) => p.$full && css`width: 100%;`}

  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
