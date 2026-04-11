import { z } from 'zod';

/**
 * ImpactMetric Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/ImpactMetric
 */
export const metricSchema = z
  .object({
    id: z.string(),
    aboutId: z.string(),
    internalCode: z
      .string()
      .min(1, 'Internal code is required')
      .regex(
        /^[a-z0-9-]+$/,
        'Must be kebab-case (lowercase, numbers, and hyphens only)',
      ),
    locale: z.string(),
    label: z
      .string()
      .min(1, 'Label is required')
      .regex(/^[a-zA-Z]/, 'First character must be a letter (a-z)'),
    value: z.string().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    sourceId: z.string().min(1, 'Source selection is required'),
    sourceKey: z.string().optional(),
    iconCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.sourceId === 'manual') {
        return !!data.value && data.value.length > 0;
      }
      return true;
    },
    {
      message: 'Value is required for manual input',
      path: ['value'],
    },
  );

/**
 * About Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/AboutData
 */
export const aboutSchema = z.object({
  id: z.string(),
  locale: z.string(),
  content: z.string(),
  metrics: z.array(metricSchema).min(1, 'At least one metric is required'),
});

export type AboutInput = z.infer<typeof aboutSchema>;
export type ImpactMetricInput = z.infer<typeof metricSchema>;
