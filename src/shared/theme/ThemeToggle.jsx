import { Moon, Sun } from 'lucide-react';
import useTheme from '../useTheme.js';
import useTranslation from '../translation/useTranslation.js';

const ThemeToggle = ({ sliderOnly = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle${sliderOnly ? ' theme-toggle-slider-only' : ''}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {!sliderOnly && (
        <span className="theme-toggle-label">{t(isDark ? 'theme.dark' : 'theme.light')}</span>
      )}
      <span className={`theme-toggle-track${isDark ? ' is-dark' : ''}`} aria-hidden="true">
        <Sun className="theme-toggle-sun" size={sliderOnly ? 12 : 15} />
        <Moon className="theme-toggle-moon" size={sliderOnly ? 12 : 15} />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
