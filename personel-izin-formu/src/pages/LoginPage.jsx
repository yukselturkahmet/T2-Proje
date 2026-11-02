import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { session } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { Logo } from '../components/Brand';
import { Button } from '../components/Button';
import { Notice, useTitle } from '../components/Feedback';
import { Field } from '../components/Form';
import { Segmented } from '../components/Segmented';
import { LANGUAGES, useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';

const Screen = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const BrandPanel = styled.aside`
  position: relative;
  overflow: hidden;
  background: ${t.blue};
  color: ${t.surface};
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;

  @media (max-width: 900px) { padding: 24px 20px 32px; gap: 28px; }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
`;

const Hero = styled.div`
  position: relative;
  z-index: 1;
  max-width: 520px;
  animation: ${rise} 0.7s ${t.ease} both;

  h1 {
    color: ${t.surface};
    font-size: clamp(38px, 5vw, 64px);
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1.04;
  }
  p {
    margin-top: 20px;
    max-width: 38ch;
    font-size: 18px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.82);
  }
  @media (max-width: 900px) { h1 { font-size: 32px; } p { display: none; } }
`;

// The large logo at the bottom of the brand panel.
const BigMark = styled.div`
  position: relative;
  z-index: 1;
  align-self: flex-end;
  width: min(520px, 100%);
  animation: ${rise} 0.8s ${t.ease} 0.1s both;
  @media (max-width: 900px) { display: none; }
`;

const FormSide = styled.main`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  @media (max-width: 900px) { padding: 28px 16px 48px; align-items: flex-start; }
`;

const LangCorner = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  @media (max-width: 900px) { position: static; margin-bottom: 20px; }
`;

const Panel = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${rise} 0.6s ${t.ease} 0.08s both;

  h2 { font-size: 30px; }
  > p { margin-top: 8px; color: ${t.textMuted}; }
  form { margin-top: 32px; display: grid; gap: 18px; }

  @media (max-width: 900px) { display: flex; flex-direction: column; }
`;

const Demo = styled.div`
  margin-top: 28px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid ${t.line};
  background: ${t.surface};
  font-size: 14px;
  color: ${t.textMuted};

  strong { display: block; color: ${t.text}; font-weight: 600; margin-bottom: 4px; }
  button { margin-top: 14px; }
`;

export function LoginPage() {
  const { login } = useAuth();
  const { t: tr, lang, setLang } = useI18n();
  const format = useFormat();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(session.demo);
  useTitle(tr('login.title'));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  const toggleDemo = async (on) => {
    if (on) {
      // Start every demo session from fresh sample data.
      const { resetDemo } = await import('../api/demo.js');
      resetDemo();
    }
    session.demo = on;
    setDemo(on);
    setError(null);
    if (on) setForm({ username: 'ayse.yilmaz', password: 'Demo1234' });
  };

  // Offer demo mode while developing, or whenever the server can't be reached.
  const offerDemo = import.meta.env.DEV || error?.code === 'NETWORK' || demo;

  return (
    <Screen>
      <BrandPanel>
        <div style={{ position: 'relative', zIndex: 1 }}><Logo variant="reversed" height={52} /></div>
        <Hero>
          <h1>{tr('login.heroTitle')}</h1>
          <p>{tr('login.heroText')}</p>
        </Hero>
        <BigMark><Logo variant="decor" decorative /></BigMark>
      </BrandPanel>

      <FormSide>
        <LangCorner>
          <Segmented
            small
            label={tr('nav.language')}
            value={lang}
            onChange={setLang}
            options={LANGUAGES.map((code) => ({ value: code, label: code === 'tr' ? 'Türkçe' : 'English' }))}
          />
        </LangCorner>

        <Panel>
          <h2>{tr('login.title')}</h2>
          <p>{tr('login.intro')}</p>

          <form onSubmit={submit} noValidate>
            {error && <Notice $tone="error">{format.error(error)}</Notice>}
            <Field
              label={tr('login.username')} autoComplete="username" autoCapitalize="none" spellCheck={false} required
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Field
              label={tr('login.password')} type="password" autoComplete="current-password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" $full disabled={busy || !form.username || !form.password} style={{ marginTop: 6 }}>
              {busy ? tr('login.submitting') : tr('login.submit')}
            </Button>
          </form>

          {offerDemo && (
            <Demo>
              <strong>{demo ? tr('login.demoActive') : tr('login.demoTitle')}</strong>
              {demo ? tr('login.demoAccounts') : tr('login.demoText')}
              <div>
                <Button $small $variant="secondary" onClick={() => toggleDemo(!demo)}>
                  {demo ? tr('login.demoExit') : tr('login.demoButton')}
                </Button>
              </div>
            </Demo>
          )}
        </Panel>
      </FormSide>
    </Screen>
  );
}
