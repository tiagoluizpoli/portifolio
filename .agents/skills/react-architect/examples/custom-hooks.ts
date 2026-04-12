/**
 * Custom Hooks Collection — Reusable, typed, production-grade
 *
 * Every hook follows the rules:
 * 1. Starts with `use`
 * 2. Single purpose
 * 3. Explicit cleanup
 * 4. Full TypeScript typing
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

// ─── useDebounce ──────────────────────────────────────────────────
/** Debounces a value. Returns the debounced version after `delay` ms of inactivity. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// ─── useMediaQuery ────────────────────────────────────────────────
/** Tracks a CSS media query match. SSR-safe. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ─── useLocalStorage ──────────────────────────────────────────────
/** Persists state to localStorage with automatic JSON serialization. SSR-safe. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`[useLocalStorage] Failed to persist key "${key}"`)
    }
  }, [key, value])
  return [value, setValue] as const
}

// ─── useClickOutside ──────────────────────────────────────────────
/** Fires callback when clicking outside the referenced element. */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// ─── usePrevious ──────────────────────────────────────────────────
/** Stores the previous value (from the last render). */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// ─── useIsomorphicLayoutEffect ────────────────────────────────────
/** useLayoutEffect on client, useEffect on server (SSR-safe). */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// ─── useEventCallback ─────────────────────────────────────────────
/** Stable callback reference that always calls the latest closure. */
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const ref = useRef(fn)
  useIsomorphicLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: Args) => ref.current(...args), [])
}

// ─── useIntersectionObserver ──────────────────────────────────────
/** Observes element visibility using IntersectionObserver. */
export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([e]) => setEntry(e), options)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options?.threshold, options?.root, options?.rootMargin])
  return entry
}

// ─── useOnMount ───────────────────────────────────────────────────
/** Runs a callback once on mount. Explicit about being mount-only. */
export function useOnMount(callback: () => void | (() => void)) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  // eslint-disable-next-line react-hooks/exhaustive-deps — intentionally mount-only
  useEffect(() => callbackRef.current(), [])
}

// ─── useToggle ────────────────────────────────────────────────────
/** Boolean state with toggle, on, and off helpers. */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  const on = useCallback(() => setValue(true), [])
  const off = useCallback(() => setValue(false), [])
  return { value, toggle, on, off, setValue } as const
}

// ─── useCopyToClipboard ───────────────────────────────────────────
/** Copies text to clipboard with a brief "copied" state. */
export function useCopyToClipboard(resetDelay = 2000) {
  const [hasCopied, setHasCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setHasCopied(true)
        setTimeout(() => setHasCopied(false), resetDelay)
        return true
      } catch {
        setHasCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  return { copy, hasCopied } as const
}
