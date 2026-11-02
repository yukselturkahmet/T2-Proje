import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
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
import { Logo } from './Brand';
import { Indicator, Segmented, useSlidingIndicator } from './Segmented';
import { Avatar, initials } from './Surface';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.88);
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
  @media (max-width: 640px) { padding: 0 12px; gap: 10px; height: 64px; }
`;

const Brand = styled(NavLink)`
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: ${t.text};
  text-decoration: none;

  span { font-size: 15px; font-weight: 600; color: ${t.textSoft}; padding-left: 12px; border-left: 1px solid ${t.line}; }
  @media (max-width: 640px) { span { display: none; } svg { height: 30px; } }
`;

const Nav = styled.nav`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  a {
    position: relative;
    z-index: 1;
    padding: 8px 14px;
    border-radius: ${t.radius.pill};
    color: ${t.textSoft};
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.25s ease;
    &:hover { color: ${t.text}; }
    &.active { color: ${t.blue}; }
  }
  @media (max-width: 640px) {
    a { padding: 7px 10px; font-size: 14px; }
    /* Fade the right edge so it's clear the menu scrolls sideways. */
    mask-image: linear-gradient(to right, #000 82%, transparent);
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
  transition: background-color 0.15s ease;
  &:hover { background: ${t.hover}; }
  .name { font-size: 14px; font-weight: 600; padding-right: 8px; }
  @media (max-width: 960px) { .name { display: none; } }
`;

const drop = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 230px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid ${t.line};
  background: ${t.surface};
  box-shadow: ${t.shadowPop};
  transform-origin: top right;
  animation: ${drop} 0.22s ${t.ease};

  p { padding: 8px 12px 10px; font-size: 13px; color: ${t.textMuted}; border-bottom: 1px solid ${t.line}; margin-bottom: 6px; }
  p strong { display: block; color: ${t.text}; font-size: 14px; font-weight: 600; }
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
    &:hover { background: ${t.hover}; color: ${t.text}; }
  }
`;

const DemoBar = styled.div`
  background: ${t.status.amber.bg};
  border-bottom: 1px solid ${t.status.amber.border};
  color: ${t.status.amber.fg};
  font-size: 13px;
  text-align: center;
  padding: 7px 16px;

  button {
    margin-left: 10px;
    border: 0;
    background: none;
    color: inherit;
    font-weight: 600;
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
  const navRef = useRef(null);
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

  const navIndicator = useSlidingIndicator(navRef, 'a.active', [location.pathname, lang]);

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
          <Brand to="/"><Logo height={34} /><span>{tr('app.name')}</span></Brand>
          <Nav aria-label="Main" ref={navRef}>
            <Indicator style={navIndicator} $color={t.blueTint} $flat />
            {links.map(([to, label]) => <NavLink key={to} to={to} end>{label}</NavLink>)}
          </Nav>
          <Segmented
            small
            label={tr('nav.language')}
            value={lang}
            onChange={setLang}
            options={LANGUAGES.map((code) => ({ value: code, label: code.toUpperCase() }))}
          />
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
