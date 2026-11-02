import React, { useState } from 'react';
import styled from 'styled-components';
import { session } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { Beams } from '../components/Beams';
import { Button } from '../components/Button';
import { Notice, useTitle } from '../components/Feedback';
import { Field } from '../components/Form';
import { LANGUAGES, useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';

const Screen = styled.div`
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 440px);
  align-items: center;
  gap: 64px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 40px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 32px 16px 56px;
    align-items: start;
  }
`;

const Top = styled.div`
  position: absolute;
  top: 28px;
  left: 40px;
  right: 40px;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;

  b { font-size: 26px; font-weight: 600; letter-spacing: -0.04em; color: ${t.text}; }
  @media (max-width: 960px) { position: static; grid-row: 1; }
`;

const Lang = styled.div`
  display: inline-flex;
  gap: 2px;
  button {
    border: 0;
    background: none;
    color: ${t.textMuted};
    font-size: 14px;
    padding: 6px 10px;
    border-radius: ${t.radius.pill};
    cursor: pointer;
    &[aria-pressed='true'] { color: ${t.text}; background: rgba(255, 255, 255, 0.08); }
  }
`;

const Hero = styled.div`
  position: relative;
  z-index: 1;

  h1 {
    font-size: clamp(44px, 6.6vw, 92px);
    letter-spacing: -0.035em;
    line-height: 1.02;
    max-width: 11ch;
  }
  p {
    margin-top: 28px;
    max-width: 40ch;
    font-size: clamp(17px, 1.6vw, 20px);
    line-height: 1.75;
    color: ${t.textMuted};
  }
  @media (max-width: 960px) { h1 { max-width: none; } }
`;

const Panel = styled.div`
  position: relative;
  z-index: 1;
  padding: 40px;
  border-radius: 28px;
  border: 1px solid ${t.lineStrong};
  background: rgba(11, 18, 28, 0.82);
  backdrop-filter: blur(18px);

  h2 { font-size: 28px; }
  > p { margin-top: 10px; color: ${t.textMuted}; font-size: 15px; }
  form { margin-top: 32px; display: grid; gap: 18px; }

  @media (max-width: 640px) { padding: 28px 20px; }
`;

const Demo = styled.div`
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid ${t.line};
  font-size: 14px;
  color: ${t.textMuted};

  strong { display: block; color: ${t.text}; font-weight: 500; margin-bottom: 6px; }
  small { display: block; margin-top: 12px; font-size: 13px; }
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
    <>
      <Beams $fixed $top="34%" $right="-10%" $top2="58%" $right2="22%" />
      <Screen>
        <Top>
          <b>T2</b>
          <Lang role="group" aria-label={tr('nav.language')}>
            {LANGUAGES.map((code) => (
              <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)}>
                {code === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </Lang>
        </Top>

        <Hero>
          <h1>{tr('login.heroTitle')}</h1>
          <p>{tr('login.heroText')}</p>
        </Hero>

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
              {demo ? (
                <>
                  <strong>{tr('login.demoActive')}</strong>
                  {tr('login.demoAccounts')}
                  <div><Button $small $variant="secondary" onClick={() => toggleDemo(false)}>{tr('login.demoExit')}</Button></div>
                </>
              ) : (
                <>
                  <strong>{tr('login.demoTitle')}</strong>
                  {tr('login.demoText')}
                  <div><Button $small $variant="secondary" onClick={() => toggleDemo(true)}>{tr('login.demoButton')}</Button></div>
                </>
              )}
            </Demo>
          )}
        </Panel>
      </Screen>
    </>
  );
}
