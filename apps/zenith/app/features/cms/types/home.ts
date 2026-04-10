import { z } from 'zod';

/**
 * Home Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/HomeData
 */
export const homeSchema = z.object({
  id: z.string(),
  locale: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  namePresentation: z.string().min(1, 'Name presentation is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pictureId: z.string(),
  cvId: z.string(),

  downloadButtonText: z.string().min(1, 'Button text is required'),
  journeyStartedIn: z.number().int().min(1900).max(new Date().getFullYear()),
});

export type HomeInput = z.infer<typeof homeSchema>;
