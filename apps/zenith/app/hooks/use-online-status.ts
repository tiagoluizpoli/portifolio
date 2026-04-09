import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * subscribe
 * Registers hardware connectivity listeners for useSyncExternalStore.
 */
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * getSnapshot
 * Returns the current hardware connectivity status.
 */
function getSnapshot() {
  return navigator.onLine;
}

/**
 * getServerSnapshot
 * Returns a deterministic 'Online' status for SSR and initial hydration.
 */
function getServerSnapshot() {
  return true;
}

/**
 * useOnlineStatus (Constitution §XV, §XIX)
 * Real-time connectivity monitor for executive data integrity.
 * Enforces FR-019 constraints for administrative safety.
 *
 * Uses useSyncExternalStore for robust synchronization with browser hardware.
 * Features a "Hydration Guard" to prevent server-client mismatches.
 */
export function useOnlineStatus() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During hydration, we return the server snapshot to ensure structural symmetry.
  // After hydration, we sync with the external store (hardware connectivity).
  const isOnline = useSyncExternalStore(
    subscribe,
    isHydrated ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );

  return { isOnline, isOffline: !isOnline };
}
