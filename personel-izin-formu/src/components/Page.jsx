import React from 'react';
import styled from 'styled-components';
import { t } from '../theme/tokens';
import { useTitle } from './Feedback';

export const PageBody = styled.main`
  position: relative;
  max-width: ${t.maxWidth};
  margin: 0 auto;
  padding: 48px 32px 96px;
  @media (max-width: 640px) { padding: 32px 16px 72px; }
`;

const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 32px;
  margin-bottom: 36px;

  h1 { font-size: clamp(34px, 4.6vw, 52px); }
  p { margin-top: 14px; max-width: 62ch; color: ${t.textMuted}; font-size: 17px; }
`;

/** Page title, intro and optional actions on the right. */
export function PageHeader({ title, intro, actions }) {
  useTitle(title);
  return (
    <Head>
      <div>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{actions}</div>}
    </Head>
  );
}

export const Section = styled.section`
  margin-top: ${(p) => p.$gap || '48px'};
  > h2 { font-size: 24px; margin-bottom: 20px; }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
`;

// Segmented filter control (pill buttons).
export const Segmented = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border-radius: ${t.radius.pill};
  border: 1px solid ${t.line};
  background: ${t.raised};

  button {
    border: 0;
    padding: 7px 16px;
    border-radius: ${t.radius.pill};
    background: transparent;
    color: ${t.textMuted};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    &:hover { color: ${t.text}; }
    &[aria-pressed='true'] { background: ${t.blueTint}; color: #A9CBFF; }
  }
`;
