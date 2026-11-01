import { Moon, Sun } from 'lucide-react';
import useTheme from './useTheme.js';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Тема: ${theme === 'dark' ? 'тёмная' : 'светлая'}`}
      title={`Переключить тему на ${theme === 'dark' ? 'светлую' : 'тёмную'}`}
    >
      <span className="theme-toggle-label">{theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
      <span className={`theme-toggle-track${theme === 'dark' ? ' is-dark' : ''}`} aria-hidden="true">
        <Sun className="theme-toggle-sun" size={15} />
        <Moon className="theme-toggle-moon" size={15} />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
