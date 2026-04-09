import { useEffect, useState, useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * subscribe
 * Registers screen width listeners for useSyncExternalStore.
 */
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/**
 * getSnapshot
 * Returns whether the device is currently in the mobile breakpoint range.
 */
function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * getServerSnapshot
 * Returns a deterministic 'Desktop' (false) status for SSR and initial hydration.
 */
function getServerSnapshot() {
  return false;
}

/**
 * useIsMobile (Constitution §XV)
 * Responsive layout detector for specialized administrative interfaces.
 *
 * Uses useSyncExternalStore to synchronize with browser viewports.
 * Enforces a "Hydration Guard" to prevent UI shifting during the critical hydration pass.
 */
export function useIsMobile() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isMobile = useSyncExternalStore(
    subscribe,
    isHydrated ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );

  return isMobile;
}
