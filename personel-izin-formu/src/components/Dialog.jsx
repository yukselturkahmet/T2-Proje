import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';

const appear = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: none; }
`;

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const Native = styled.dialog`
  width: min(94vw, ${(p) => p.$width || 520}px);
  max-height: 90vh;
  padding: 0;
  border: 1px solid ${t.line};
  border-radius: 24px;
  background: ${t.surface};
  color: ${t.textSoft};
  box-shadow: ${t.shadowPop};

  &[open] { animation: ${appear} 0.32s ${t.ease}; }
  &::backdrop {
    background: ${t.overlay};
    backdrop-filter: blur(3px);
    animation: ${fade} 0.25s ease;
  }
`;

const Head = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 0;

  h2 { font-size: 22px; }
  p { margin-top: 8px; color: ${t.textMuted}; font-size: 15px; }
`;

const Close = styled.button`
  flex: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: ${t.surfaceSoft};
  color: ${t.textSoft};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.2s ${t.ease};
  &:hover { background: ${t.line}; color: ${t.text}; transform: rotate(90deg); }
`;

const Body = styled.div`
  padding: 24px 28px 28px;
  @media (max-width: 640px) { padding: 20px; }
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
`;

/** Modal dialog built on <dialog>: focus trapping and Esc come for free. */
export function Dialog({ open, onClose, title, description, width, children }) {
  const ref = useRef(null);
  const { t: tr } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <Native
      ref={ref}
      $width={width}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      aria-labelledby="dialog-title"
    >
      {open && (
        <>
          <Head>
            <div>
              <h2 id="dialog-title">{title}</h2>
              {description && <p>{description}</p>}
            </div>
            <Close onClick={onClose} aria-label={tr('common.close')}>×</Close>
          </Head>
          <Body>{children}</Body>
        </>
      )}
    </Native>
  );
}
