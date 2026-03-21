import type * as React from 'react';
import { useHydrated } from '~/hooks/use-hydrated';

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();
  return hydrated ? children : fallback;
}
