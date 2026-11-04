import { useLayoutEffect, useState } from 'react';
import ThemeContext from './themeContext.js';
const THEME_STORAGE_KEY = 'app-theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  ));

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
