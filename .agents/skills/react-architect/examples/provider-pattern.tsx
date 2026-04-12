/**
 * Provider Pattern — Theme Provider with typed context hook
 *
 * Demonstrates:
 * - Context creation with null default (safe pattern)
 * - Typed custom hook with fail-fast error
 * - Memoized provider value to prevent re-renders
 * - Read/Write split for performance
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

// ─── Theme Types ──────────────────────────────────────────────────
type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// ─── Context (NEVER export this directly) ─────────────────────────
const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Hook (the ONLY way to consume the context) ──────────────────
/**
 * Access the current theme state and controls.
 * MUST be used within a <ThemeProvider>.
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error(
      'useTheme() must be used within a <ThemeProvider>.\n' +
        'Wrap your component tree with <ThemeProvider> in your root layout.'
    )
  }
  return context
}

// ─── Provider ─────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'dark' // SSR fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'zenith-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const resolvedTheme = resolveTheme(theme)

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)

      // Apply to document for Tailwind dark mode
      const resolved = resolveTheme(newTheme)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    },
    [storageKey]
  )

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  // ✅ Memoize the context value to prevent unnecessary consumer re-renders
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
