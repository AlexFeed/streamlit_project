import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ThemeContext from './themeContext.js';
const THEME_STORAGE_KEY = 'app-theme';
const EXPERIMENTAL_LIGHT_THEME_STORAGE_KEY = 'app-experimental-light-theme';

export const ThemeProvider = ({ children }) => {
  const transitionTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  ));
  const [isExperimentalLightTheme, setIsExperimentalLightTheme] = useState(() => (
    window.localStorage.getItem(EXPERIMENTAL_LIGHT_THEME_STORAGE_KEY) === 'true'
  ));

  useEffect(() => () => {
    window.clearTimeout(transitionTimeoutRef.current);
    document.documentElement.classList.remove('theme-switching');
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (isExperimentalLightTheme) {
      root.dataset.lightTheme = 'experimental';
    } else {
      delete root.dataset.lightTheme;
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(EXPERIMENTAL_LIGHT_THEME_STORAGE_KEY, String(isExperimentalLightTheme));
  }, [theme, isExperimentalLightTheme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 50);

    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isExperimentalLightTheme,
      setIsExperimentalLightTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
