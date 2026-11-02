import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { t } from '../theme/tokens';
import { useI18n } from '../i18n/I18nProvider';

const Native = styled.dialog`
  width: min(94vw, ${(p) => p.$width || 520}px);
  max-height: 90vh;
  padding: 0;
  border: 1px solid ${t.lineStrong};
  border-radius: 24px;
  background: #0B121C;
  color: ${t.textSoft};
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);

  &::backdrop {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
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
  background: rgba(255, 255, 255, 0.06);
  color: ${t.textSoft};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.12); color: ${t.text}; }
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
