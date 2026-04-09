import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a deterministic pseudo-random number between 0 and 1 based on a seed.
 * (Constitution §XV)
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Generates a consistent high-fidelity ID for CMS entities.
 * (Constitution §XV, §I)
 *
 * NOTE: If used during render, provide a seed to ensure SSR-to-Client hydration symmetry.
 */
export function generateId(prefix = 'id', seed?: string): string {
  const suffix = seed
    ? seededRandom(seed).toString(36).substring(2, 11)
    : Math.random().toString(36).substring(2, 11);
  return `${prefix}-${suffix}`;
}
