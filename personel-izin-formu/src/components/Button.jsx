import styled, { css } from 'styled-components';
import { t } from '../theme/tokens';

const variants = {
  primary: css`
    background: ${t.blue};
    color: #fff;
    &:hover:not(:disabled) { background: #4a93ff; }
  `,
  secondary: css`
    background: transparent;
    color: ${t.text};
    border-color: ${t.lineStrong};
    &:hover:not(:disabled) { border-color: rgba(216, 223, 233, 0.4); background: rgba(255, 255, 255, 0.04); }
  `,
  ghost: css`
    background: transparent;
    color: ${t.textSoft};
    padding: 0 12px;
    &:hover:not(:disabled) { color: ${t.text}; background: rgba(255, 255, 255, 0.05); }
  `,
  approve: css`
    background: ${t.greenTint};
    color: ${t.green};
    border-color: rgba(69, 211, 142, 0.35);
    &:hover:not(:disabled) { background: rgba(69, 211, 142, 0.2); }
  `,
  danger: css`
    background: ${t.redTint};
    color: ${t.red};
    border-color: rgba(255, 111, 111, 0.35);
    &:hover:not(:disabled) { background: rgba(255, 111, 111, 0.2); }
  `,
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
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  ${(p) => variants[p.$variant || 'primary']}
  ${(p) => p.$full && css`width: 100%;`}

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
