import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('planner_theme') || 'lavender');
  const [weekStart, setWeekStart] = useState(() => localStorage.getItem('planner_week_start') || 'monday');
  const [animations, setAnimationsState] = useState(() => {
    const saved = localStorage.getItem('planner_animations');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('planner_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-animations', animations ? 'true' : 'false');
    localStorage.setItem('planner_animations', JSON.stringify(animations));
  }, [animations]);

  useEffect(() => {
    localStorage.setItem('planner_week_start', weekStart);
  }, [weekStart]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const setAnimations = (val) => {
    setAnimationsState(val);
  };

  const updatePreferencesFromUser = (userPrefs) => {
    if (!userPrefs) return;
    if (userPrefs.theme) setThemeState(userPrefs.theme);
    if (userPrefs.weekStart) setWeekStart(userPrefs.weekStart);
    if (userPrefs.animations !== undefined) setAnimationsState(userPrefs.animations);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        weekStart,
        setWeekStart,
        animations,
        setAnimations,
        updatePreferencesFromUser
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
