import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import I18nContext from './i18nContext.js';
import { DEFAULT_LANG, SUPPORTED_LANGS, getDictionary } from './index.js';

const LANGUAGE_STORAGE_KEY = 'app-lang';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANG;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage && SUPPORTED_LANGS.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = typeof navigator !== 'undefined'
    ? navigator.language?.toLowerCase().split('-')[0]
    : DEFAULT_LANG;

  return SUPPORTED_LANGS.includes(browserLanguage) ? browserLanguage : DEFAULT_LANG;
};

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

const validateDictionaries = () => {
  if (!isDev) {
    return;
  }

  const ruKeys = Object.keys(getDictionary('ru'));
  const enKeys = Object.keys(getDictionary('en'));
  const missingInEn = ruKeys.filter((key) => !(key in getDictionary('en')));
  const missingInRu = enKeys.filter((key) => !(key in getDictionary('ru')));

  if (missingInEn.length || missingInRu.length) {
    console.warn('[i18n] Dictionary key mismatch detected', {
      missingInEn,
      missingInRu,
    });
  }
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useLayoutEffect(() => {
    validateDictionaries();
    document.documentElement.lang = language;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const t = useCallback((key, values = {}) => {
    const dictionary = getDictionary(language);

    if (!Object.prototype.hasOwnProperty.call(dictionary, key)) {
      if (isDev) {
        console.warn(`[i18n] Missing translation key: "${key}" for language "${language}"`);
      }
      return key;
    }

    const template = dictionary[key];
    return String(template).replace(/\{(\w+)\}/g, (placeholder, name) => (
      values[name] === undefined ? placeholder : String(values[name])
    ));
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) => (currentLanguage === 'ru' ? 'en' : 'ru'));
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
  }), [language, toggleLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nContext;
