import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';
import { useFormat } from '../utils/useFormat';
import { Button } from './Button';

const toneOf = (s) => css`background: ${s.bg}; border-color: ${s.border}; color: ${s.fg};`;
const tones = {
  error: toneOf(t.status.red),
  success: toneOf(t.status.green),
  info: toneOf(t.status.blue),
  warning: toneOf(t.status.amber),
};

export const Notice = styled.div.attrs((p) => ({ role: p.$tone === 'error' ? 'alert' : 'status' }))`
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid;
  font-size: 14px;
  line-height: 1.5;
  ${(p) => tones[p.$tone || 'info']}
`;

const Empty = styled.div`
  padding: 56px 24px;
  text-align: center;
  border: 1px dashed ${t.lineStrong};
  border-radius: ${t.radius.card};
  background: ${t.surface};

  h3 { font-size: 18px; letter-spacing: -0.01em; }
  p { margin: 8px auto 0; max-width: 42ch; color: ${t.textMuted}; }
  > div { margin-top: 20px; }
`;

export function EmptyState({ title, text, action }) {
  return (
    <Empty>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div>{action}</div>}
    </Empty>
  );
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const SpinnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: ${(p) => (p.$inline ? '0' : '64px 0')};
  color: ${t.textMuted};
  font-size: 14px;

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid ${t.line};
    border-top-color: ${t.blue};
    animation: ${spin} 0.8s linear infinite;
  }
`;

export function Loading({ inline }) {
  const { t: tr } = useI18n();
  return <SpinnerWrap $inline={inline} role="status">{tr('common.loading')}</SpinnerWrap>;
}

/** Shown when a query fails: the error and a way to try again. */
export function LoadError({ error, onRetry }) {
  const { t: tr } = useI18n();
  const format = useFormat();
  return (
    <Notice $tone="error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <span>{format.error(error)}</span>
      {onRetry && <Button $small $variant="secondary" onClick={onRetry}>{tr('common.retry')}</Button>}
    </Notice>
  );
}

/* ---------- Toasts: short confirmations after an action ---------- */

const ToastContext = createContext(() => {});

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;

const ToastStack = styled.div`
  position: fixed;
  z-index: 50;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(92vw, 440px);
`;

const ToastItem = styled(Notice)`
  box-shadow: ${t.shadowPop};
  animation: ${rise} 0.2s ease-out;
`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <ToastStack aria-live="polite">
        {toasts.map((toast) => <ToastItem key={toast.id} $tone={toast.tone}>{toast.message}</ToastItem>)}
      </ToastStack>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Page title ---------- */

export function useTitle(title) {
  const { t: tr } = useI18n();
  useEffect(() => {
    document.title = title ? `${title} | ${tr('app.title')}` : tr('app.title');
  }, [title, tr]);
}
