import { useEffect, useRef } from 'react';
import { useActivity } from './use-activity';

/**
 * useHeartbeat (Constitution §XV, §XIX)
 * Implements the 30-second analytics heartbeat for Zenith Executive. [FR-011]
 * Correctly ceasing updates when:
 * 1. Tab is hidden (Visibility API).
 * 2. User is inactive (30-minute threshold).
 */
export function useHeartbeat(callback: () => void, intervalMs = 30000) {
  const { isActive } = useActivity();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startHeartbeat = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible' && isActive) {
          callback();
        }
      }, intervalMs);
    };

    const stopHeartbeat = () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    // Initial start
    if (document.visibilityState === 'visible' && isActive) {
      startHeartbeat();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopHeartbeat();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback, intervalMs, isActive]);
}
