import React, { Component } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { Button } from './Button';
import { EmptyState } from './Feedback';
import { PageBody } from './Page';

function CrashMessage() {
  const { t } = useI18n();
  return (
    <PageBody>
      <EmptyState
        title={t('crash.title')}
        text={t('crash.text')}
        action={<Button onClick={() => window.location.reload()}>{t('crash.reload')}</Button>}
      />
    </PageBody>
  );
}

/** Shows a message instead of a blank screen when a page crashes. */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.failed ? <CrashMessage /> : this.props.children;
  }
}
