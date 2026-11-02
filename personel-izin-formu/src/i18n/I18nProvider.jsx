import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import tr from './tr';
import { storage } from '../utils/storage';

const MESSAGES = { tr, en };
export const LANGUAGES = ['tr', 'en'];

const I18nContext = createContext(null);

function lookup(messages, key) {
  return key.split('.').reduce((node, part) => (node == null ? node : node[part]), messages);
}

function initialLanguage() {
  const saved = storage.get('lang');
  if (LANGUAGES.includes(saved)) return saved;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'tr';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);

  useEffect(() => {
    storage.set('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // t('a.b', { n: 2 }) — replaces {n} in the message. Arrays and objects
  // are returned as they are (used for lists of rules).
  const t = useCallback((key, params = {}) => {
    const value = lookup(MESSAGES[lang], key) ?? lookup(MESSAGES.tr, key) ?? key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
  }, [lang]);

  const plural = useCallback((key, n, params = {}) => {
    const form = new Intl.PluralRules(lang).select(n) === 'one' ? 'one' : 'other';
    return t(`${key}_${form}`, { n: formatNumber(n, lang), ...params });
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t, plural, locale: lang === 'tr' ? 'tr-TR' : 'en-GB' }), [lang, t, plural]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function formatNumber(n, lang) {
  return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 1 }).format(n);
}

export function useI18n() {
  return useContext(I18nContext);
}
