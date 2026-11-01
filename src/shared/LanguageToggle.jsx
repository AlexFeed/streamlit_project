import { Languages } from 'lucide-react';
import useTranslation from './i18n/useTranslation.js';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();
  const currentLabel = language.toUpperCase();
  const nextLanguage = language === 'ru' ? 'EN' : 'RU';

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={t('language.switch')}
      title={t('language.current', { language: nextLanguage })}
    >
      <Languages size={16} aria-hidden="true" />
      <span>{currentLabel}</span>
    </button>
  );
};

export default LanguageToggle;
