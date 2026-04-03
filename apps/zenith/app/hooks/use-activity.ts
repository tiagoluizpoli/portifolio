import { useEffect, useRef, useState } from 'react';

/**
 * useActivity (Constitution §XV, §XIX)
 * Tracks user interaction (mouse, key, scroll) to manage administrative state.
 * Enforces the 30-minute inactivity rule for Zenith Executive. [FR-011]
 */
export function useActivity(timeoutMs = 30 * 60 * 1000) {
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsInactive(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsInactive(true), timeoutMs);
    };

    // Initialize timer
    handleActivity();

    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove',
    ];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMs]);

  return { isInactive, isActive: !isInactive };
}
