import { z } from 'zod';

/**
 * SocialLink Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/SocialLink
 */
export const socialLinkSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Invalid URL format').or(z.literal('')),
  iconId: z.string().min(1, 'Icon ID is required'),
  active: z.boolean().default(true),
  sort: z.number().int().default(0),
});

/**
 * Contact Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/ContactData
 */
export const contactSchema = z.object({
  id: z.string(),
  locale: z.string(),

  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short'),
  location: z.string().min(1, 'Location is required'),
  socials: z.array(socialLinkSchema),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
