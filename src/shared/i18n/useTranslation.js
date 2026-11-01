import { useContext } from 'react';
import I18nContext from './i18nContext.js';

export const useTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  return context;
};

export default useTranslation;
