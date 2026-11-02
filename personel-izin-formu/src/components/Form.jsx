import React, { useId } from 'react';
import styled, { css } from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';

const control = css`
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: ${t.radius.control};
  border: 1px solid ${(p) => (p.$invalid ? t.status.red.fg : t.lineStrong)};
  background: ${t.surface};
  color: ${t.text};
  font-size: 15px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;

  &::placeholder { color: ${t.textMuted}; }
  &:hover:not(:disabled) { border-color: ${(p) => (p.$invalid ? t.status.red.fg : t.textMuted)}; }
  &:focus {
    outline: none;
    border-color: ${t.blue};
    box-shadow: 0 0 0 4px ${t.blueTint};
  }
  &:disabled { opacity: 0.55; background: ${t.surfaceSoft}; }
  &::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.7; }
`;

export const Input = styled.input`${control}`;

export const Select = styled.select`
  ${control}
  appearance: none;
  padding-right: 44px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23687A8C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
`;

export const Textarea = styled.textarea`
  ${control}
  min-height: 112px;
  resize: vertical;
  line-height: 1.5;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  ${(p) => p.$span && css`grid-column: 1 / -1;`}
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${t.text};
  span { color: ${t.textMuted}; font-weight: 400; }
`;

const Hint = styled.p`
  font-size: 13px;
  line-height: 1.45;
  color: ${(p) => (p.$error ? t.status.red.fg : t.textMuted)};
`;

/** Label + control + hint or error. Extra props go to the control. */
export function Field({ label, hint, error, optional, span, as: Control = Input, children, ...rest }) {
  const { t: tr } = useI18n();
  const id = useId();
  const message = error || hint;
  return (
    <Wrap $span={span}>
      <Label htmlFor={id}>
        {label} {optional && <span>({tr('common.optional')})</span>}
      </Label>
      <Control
        id={id}
        $invalid={Boolean(error)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={message ? `${id}-hint` : undefined}
        {...rest}
      >
        {children}
      </Control>
      {message && <Hint id={`${id}-hint`} $error={Boolean(error)}>{message}</Hint>}
    </Wrap>
  );
}

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: ${t.textSoft};
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${t.blue};
  }
`;

export function Checkbox({ label, ...rest }) {
  return (
    <CheckLabel>
      <input type="checkbox" {...rest} />
      {label}
    </CheckLabel>
  );
}
