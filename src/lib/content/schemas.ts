import { z } from 'zod';
import { isKnownIcon } from '../icons';

const text = z.string().min(1);
// Translatable field: both locales required. Wrap in .optional() so an optional field is absent as a whole.
const localized = z.object({ en: text, pt: text });
// Bucket-relative asset path, prefixed with ASSET_BASE_URL at render time.
const assetPath = text;
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'expected YYYY-MM');

export const hero = z.object({
  name: text,
  title: localized,
  pitch: localized,
  location: localized,
  whatsappUrl: z.url().optional(),
  cv: localized.optional(),
});

export const showcaseStatus = z.enum(['production-active', 'production', 'coming-soon']);

export const showcase = z.object({
  projects: z
    .array(
      z.object({
        name: text,
        summary: localized,
        role: localized,
        stack: z.array(text).min(1),
        status: showcaseStatus,
        now: localized.optional(),
        // 1-3 once screenshots exist; the approved draft has none yet for Church.
        images: z.array(z.object({ path: assetPath, alt: localized })).max(3),
        learnMoreUrl: z.url().optional(),
      }),
    )
    .min(1),
});

export const experience = z.object({
  roles: z
    .array(
      z.object({
        company: text,
        title: localized,
        kind: localized.optional(),
        location: localized,
        start: month,
        end: month.optional(), // absent = present
        highlights: z.array(localized).min(1).max(2),
      }),
    )
    .min(1),
});

export const skills = z.object({
  groups: z
    .array(
      z.object({
        name: localized,
        items: z
          .array(z.object({ name: text, icon: text.refine(isKnownIcon, 'unknown Iconify icon').optional() }))
          .min(1),
      }),
    )
    .min(1),
});

export const about = z.object({
  summary: localized,
  education: z.array(z.object({ institution: text, degree: localized, period: localized })),
  languages: z.array(z.object({ name: localized, level: localized })),
});

export const contact = z.object({
  whatsappUrl: z.url().optional(),
  linkedinUrl: z.url(),
  email: z.email().optional(),
  githubUrl: z.url(),
  cv: localized.optional(),
});

/** One schema per Section row key. Adding a Section = adding its schema here. */
export const sectionSchemas = { hero, showcase, experience, skills, about, contact };

export type SectionKey = keyof typeof sectionSchemas;
export type Content = { [K in SectionKey]: z.infer<(typeof sectionSchemas)[K]> };
