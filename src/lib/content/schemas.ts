import { z } from 'zod';

const text = z.string().min(1);
// Translatable field: both locales required. Wrap in .optional() so an optional field is absent as a whole.
const localized = z.object({ en: text, pt: text });

export const hero = z.object({
  name: text,
  title: localized,
  pitch: localized,
  location: localized,
  whatsappUrl: z.url().optional(),
  cv: localized.optional(),
});

/** One schema per Section row key. Adding a Section = adding its schema here. */
export const sectionSchemas = { hero };

export type SectionKey = keyof typeof sectionSchemas;
export type Content = { [K in SectionKey]: z.infer<(typeof sectionSchemas)[K]> };
