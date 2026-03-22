import * as React from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme') as Theme;
      return ['light', 'dark', 'auto'].includes(stored) ? stored : 'auto';
    }
    return 'auto';
  });

  const setTheme = React.useCallback((newTheme: Theme) => {
    /* FIXED LOGIC - DO NOT MODIFY - CORE THEME SYNC */
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      if (newTheme === 'auto') {
        window.localStorage.removeItem('theme');
      } else {
        window.localStorage.setItem('theme', newTheme);
      }

      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const resolved =
        newTheme === 'auto' ? (prefersDark ? 'dark' : 'light') : newTheme;

      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);

      if (newTheme === 'auto') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', newTheme);
      }
      root.style.colorScheme = resolved;
    }
    /* END FIXED LOGIC */
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
