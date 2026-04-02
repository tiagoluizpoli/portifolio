import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

interface ResilienceContextType {
  recordFailure: () => void;
  resetFailures: () => void;
  isRecovering: boolean;
  setIsRecovering: (val: boolean) => void;
}

const ResilienceContext = React.createContext<
  ResilienceContextType | undefined
>(undefined);

const MAX_FAILURES = 3;
const FAILURE_TIMEOUT_MS = 10000; // 10s

export function ResilienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setFailureCount] = React.useState(0);
  const [isRecovering, setIsRecovering] = React.useState(false);
  const navigate = useNavigate();
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const recordFailure = React.useCallback(() => {
    setFailureCount((prev) => {
      const next = prev + 1;
      if (next >= MAX_FAILURES) {
        navigate({ to: '/connection-lost' });
        return 0;
      }
      return next;
    });

    // Start 10s timeout for total failure window
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setFailureCount(0);
        timerRef.current = null;
      }, FAILURE_TIMEOUT_MS);
    }
  }, [navigate]);

  const resetFailures = React.useCallback(() => {
    setFailureCount(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <ResilienceContext.Provider
      value={{ recordFailure, resetFailures, isRecovering, setIsRecovering }}
    >
      {children}
    </ResilienceContext.Provider>
  );
}

export function useResilience() {
  const context = React.useContext(ResilienceContext);
  if (context === undefined) {
    throw new Error('useResilience must be used within a ResilienceProvider');
  }
  return context;
}
