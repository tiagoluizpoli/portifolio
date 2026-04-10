import type { ImpactMetric } from './metrics.js';

/**
 * About Section Domain Model (Constitution §XVII)
 * Orchestrates the hero narrative and calibrated impact metrics.
 */

export interface AboutData {
  id: string;
  locale: string;
  content: string;
  metrics: ImpactMetric[];
}

export type { ImpactMetric };
