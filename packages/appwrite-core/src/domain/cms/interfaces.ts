import { z } from 'zod';

/**
 * Common bilingual fields used across all CMS chapters.
 * Maturity Lock (Principle VI) requires all non-optional fields to have translations.
 */

export const LocalizedStringSchema = z.object({
  en: z.string().min(1, "English version is required"),
  pt: z.string().min(1, "Portuguese version is required"),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const LocalizedRichTextSchema = z.object({
  en: z.string().min(1, "English version is required"), // Rich Text Lite (Markdown)
  pt: z.string().min(1, "Portuguese version is required"),
});

export type LocalizedRichText = z.infer<typeof LocalizedRichTextSchema>;

/**
 * Chapter 01: The Identity (Profile & Branding)
 */
export const IdentitySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  tagline: LocalizedStringSchema,
  bio: LocalizedRichTextSchema,
  profilePic: z.string().optional(), // Appwrite File ID
  cv: z.object({
    en: z.string(), // Appwrite File ID for EN CV
    pt: z.string(), // Appwrite File ID for PT CV
  }).optional(),
});

export type Identity = z.infer<typeof IdentitySchema>;

/**
 * Chapter 03: The Journey (Experience & Education)
 */
export const TimelineItemSchema = z.object({
  id: z.string(),
  title: LocalizedStringSchema,
  organization: LocalizedStringSchema,
  location: LocalizedStringSchema.optional(),
  startDate: z.string(), // ISO Date
  endDate: z.string().optional(), // ISO Date or null (current)
  description: LocalizedRichTextSchema,
  sortOrder: z.number(),
  type: z.enum(['PROFESSIONAL', 'ACADEMIC']),
});

export type TimelineItem = z.infer<typeof TimelineItemSchema>;

/**
 * Core CMS Service Contract
 */
export interface ICmsService<T> {
  get(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
  isMature(data: T): boolean;
}

/**
 * Media Desk Service Contract
 */
export interface IMediaService {
  upload(file: File): Promise<string>; // Returns File ID
  delete(id: string): Promise<void>;
  getPreview(id: string): string; // Returns Download URL
}
