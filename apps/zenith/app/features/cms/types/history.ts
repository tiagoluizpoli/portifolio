import { z } from 'zod';

/**
 * HistoryItem Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/HistoryItem
 */
export const historyItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  type: z.enum(['experience', 'education']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  location: z.string().min(1, 'Location is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().optional(),
  current: z.boolean().default(false),
  sort: z.number().int().optional(),
  locale: z.string(),
});

export const historySchema = z.object({
  items: z.array(historyItemSchema),
});

export type HistoryItemInput = z.infer<typeof historyItemSchema>;
export type HistoryInput = z.infer<typeof historySchema>;
