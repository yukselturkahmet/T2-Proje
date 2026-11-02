import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { AppShell } from './components/AppShell';
import { Button } from './components/Button';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loading, ToastProvider } from './components/Feedback';
import { PageBody, PageHeader } from './components/Page';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NewRequestPage } from './pages/NewRequestPage';
import { PolicyPage } from './pages/PolicyPage';
import { ApprovalsPage } from './pages/admin/ApprovalsPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { RequestsPage } from './pages/admin/RequestsPage';
import { GlobalStyle } from './theme/GlobalStyle';

function AdminOnly({ children }) {
  const { user } = useAuth();
  return user.role === 'ADMIN' ? children : <Navigate to="/" replace />;
}

function NotFound() {
  const { t } = useI18n();
  return (
    <PageBody>
      <PageHeader title={t('notFound.title')} />
      <Button as={Link} to="/">{t('notFound.back')}</Button>
    </PageBody>
  );
}

function AppRoutes() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <LoginPage />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="request" element={<NewRequestPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="admin" element={<AdminOnly><ApprovalsPage /></AdminOnly>} />
        <Route path="admin/requests" element={<AdminOnly><RequestsPage /></AdminOnly>} />
        <Route path="admin/employees" element={<AdminOnly><EmployeesPage /></AdminOnly>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <GlobalStyle />
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
