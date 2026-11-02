import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { session } from '../api/client';
import { CHANGE_PASSWORD } from '../api/operations';
import { useAuth } from '../auth/AuthProvider';
import { useMutation } from '../hooks/useApi';
import { LANGUAGES, useI18n } from '../i18n/I18nProvider';
import { t } from '../theme/tokens';
import { useFormat } from '../utils/useFormat';
import { Button } from './Button';
import { Dialog, DialogActions } from './Dialog';
import { Notice, useToast } from './Feedback';
import { Field } from './Form';
import { Avatar, initials } from './Surface';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid ${t.line};
`;

const Inner = styled.div`
  max-width: ${t.maxWidth};
  margin: 0 auto;
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 28px;
  @media (max-width: 640px) { padding: 0 16px; gap: 12px; height: 64px; }
`;

const Brand = styled(NavLink)`
  flex: none;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  color: ${t.text};
  text-decoration: none;

  b { font-size: 24px; font-weight: 600; letter-spacing: -0.04em; }
  span { font-size: 15px; color: ${t.textMuted}; }
  @media (max-width: 640px) { span { display: none; } }
`;

const Nav = styled.nav`
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  a {
    padding: 8px 14px;
    border-radius: ${t.radius.pill};
    color: rgba(216, 223, 233, 0.75);
    font-size: 15px;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.15s ease, background-color 0.15s ease;
    &:hover { color: ${t.text}; }
    &.active { color: ${t.text}; background: rgba(255, 255, 255, 0.07); }
  }
  @media (max-width: 640px) {
    a { padding: 7px 10px; font-size: 14px; }
    /* Fade the right edge so it's clear the menu scrolls sideways. */
    mask-image: linear-gradient(to right, #000 82%, transparent);
  }
`;

const Lang = styled.div`
  flex: none;
  display: inline-flex;
  border: 1px solid ${t.line};
  border-radius: ${t.radius.pill};
  padding: 3px;

  button {
    border: 0;
    background: none;
    color: ${t.textMuted};
    font-size: 12px;
    font-weight: 600;
    padding: 4px 9px;
    border-radius: ${t.radius.pill};
    cursor: pointer;
    &[aria-pressed='true'] { background: rgba(255, 255, 255, 0.1); color: ${t.text}; }
  }
`;

const MenuWrap = styled.div`
  position: relative;
  flex: none;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: none;
  padding: 4px;
  border-radius: ${t.radius.pill};
  color: ${t.textSoft};
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.05); }
  .name { font-size: 14px; }
  @media (max-width: 960px) { .name { display: none; } }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 220px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid ${t.lineStrong};
  background: #0B121C;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);

  p { padding: 8px 12px 10px; font-size: 13px; color: ${t.textMuted}; border-bottom: 1px solid ${t.line}; margin-bottom: 6px; }
  p strong { display: block; color: ${t.text}; font-size: 14px; font-weight: 500; }
  button {
    display: block;
    width: 100%;
    text-align: left;
    border: 0;
    background: none;
    padding: 10px 12px;
    border-radius: 10px;
    color: ${t.textSoft};
    font-size: 14px;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.06); color: ${t.text}; }
  }
`;

const DemoBar = styled.div`
  background: ${t.amberTint};
  border-bottom: 1px solid rgba(242, 184, 75, 0.25);
  color: #F7D58F;
  font-size: 13px;
  text-align: center;
  padding: 7px 16px;

  button {
    margin-left: 10px;
    border: 0;
    background: none;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    font-size: inherit;
  }
`;

function ChangePasswordDialog({ open, onClose }) {
  const { t: tr } = useI18n();
  const format = useFormat();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [change, { loading, error }] = useMutation(CHANGE_PASSWORD);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await change(form);
      toast(tr('password.done'));
      setForm({ currentPassword: '', newPassword: '' });
      onClose();
    } catch {
      // Error shown in the form.
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={tr('password.title')}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 18 }}>
        {error && <Notice $tone="error">{format.error(error)}</Notice>}
        <Field
          label={tr('password.current')} type="password" autoComplete="current-password" required
          value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <Field
          label={tr('password.next')} type="password" autoComplete="new-password" required hint={tr('password.hint')}
          value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <DialogActions>
          <Button $variant="secondary" onClick={onClose}>{tr('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{tr('common.save')}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { t: tr, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // New page: close the menu and start at the top.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close the account menu on outside click or Esc.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isAdmin = user.role === 'ADMIN';
  const links = [
    ['/', tr('nav.dashboard')],
    ['/request', tr('nav.newRequest')],
    ...(isAdmin ? [['/admin', tr('nav.approvals')], ['/admin/requests', tr('nav.allRequests')], ['/admin/employees', tr('nav.employees')]] : []),
    ['/policy', tr('nav.policy')],
  ];

  const exitDemo = () => {
    session.demo = false;
    logout();
  };

  return (
    <>
      {session.demo && (
        <DemoBar>
          {tr('login.demoActive')}
          <button onClick={exitDemo}>{tr('login.demoExit')}</button>
        </DemoBar>
      )}
      <Bar>
        <Inner>
          <Brand to="/"><b>T2</b><span>{tr('app.name')}</span></Brand>
          <Nav aria-label="Main">
            {links.map(([to, label]) => <NavLink key={to} to={to} end>{label}</NavLink>)}
          </Nav>
          <Lang role="group" aria-label={tr('nav.language')}>
            {LANGUAGES.map((code) => (
              <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>
            ))}
          </Lang>
          <MenuWrap ref={menuRef}>
            <MenuButton aria-haspopup="menu" aria-expanded={menuOpen} aria-label={tr('nav.menu')} onClick={() => setMenuOpen((o) => !o)}>
              <Avatar $size={36}>{initials(user)}</Avatar>
              <span className="name">{user.firstName}</span>
            </MenuButton>
            {menuOpen && (
              <Menu role="menu">
                <p><strong>{user.firstName} {user.lastName}</strong>{user.username}</p>
                <button role="menuitem" onClick={() => { setMenuOpen(false); setPasswordOpen(true); }}>{tr('nav.changePassword')}</button>
                <button role="menuitem" onClick={logout}>{tr('nav.signOut')}</button>
              </Menu>
            )}
          </MenuWrap>
        </Inner>
      </Bar>
      <Outlet />
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
