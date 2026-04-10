import { z } from 'zod';

/**
 * ImpactMetric Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/ImpactMetric
 */
export const metricSchema = z.object({
  id: z.string().default(''),
  aboutId: z.string().default(''),
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  sourceId: z.string().min(1, 'Source is required'),
});

/**
 * About Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/AboutData
 */
export const aboutSchema = z.object({
  id: z.string(),
  locale: z.string(),
  content: z.string(),
  metrics: z.array(metricSchema).max(3),
});

export type AboutInput = z.infer<typeof aboutSchema>;
export type ImpactMetricInput = z.infer<typeof metricSchema>;
