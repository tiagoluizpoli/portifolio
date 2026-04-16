import { z } from 'zod';

const localeSchema = z.enum(['en', 'pt']);
const statusSchema = z.enum(['active', 'archived']);
const skillTypeSchema = z.enum(['frontend', 'backend', 'fullstack']);

const systemFieldsSchema = {
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  permissions: z.array(z.string()),
};

function withFull<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.extend(systemFieldsSchema);
}

function withList<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    total: z.number().int().nonnegative(),
    rows: z.array(itemSchema),
  });
}

export const AboutInsertSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  locale: localeSchema,
});
export const AboutFullSchema = withFull(AboutInsertSchema);
export const AboutListSchema = withList(AboutFullSchema);
export type AboutInsert = z.infer<typeof AboutInsertSchema>;
export type AboutFull = z.infer<typeof AboutFullSchema>;
export type AboutList = z.infer<typeof AboutListSchema>;

export const HomeInsertSchema = z.object({
  locale: localeSchema,
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  ctaText: z.string().min(1),
  ctaLink: z.string().min(1),
});
export const HomeFullSchema = withFull(HomeInsertSchema);
export const HomeListSchema = withList(HomeFullSchema);
export type HomeInsert = z.infer<typeof HomeInsertSchema>;
export type HomeFull = z.infer<typeof HomeFullSchema>;
export type HomeList = z.infer<typeof HomeListSchema>;

export const ContactInfoInsertSchema = z.object({
  locale: localeSchema,
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().min(1),
});
export const ContactInfoFullSchema = withFull(ContactInfoInsertSchema);
export const ContactInfoListSchema = withList(ContactInfoFullSchema);
export type ContactInfoInsert = z.infer<typeof ContactInfoInsertSchema>;
export type ContactInfoFull = z.infer<typeof ContactInfoFullSchema>;
export type ContactInfoList = z.infer<typeof ContactInfoListSchema>;

export const SocialInsertSchema = z.object({
  platformId: z.string().min(1),
  username: z.string().min(1),
  iconId: z.string().min(1),
  active: z.boolean(),
  sort: z.number().int(),
});
export const SocialFullSchema = withFull(SocialInsertSchema);
export const SocialListSchema = withList(SocialFullSchema);
export type SocialInsert = z.infer<typeof SocialInsertSchema>;
export type SocialFull = z.infer<typeof SocialFullSchema>;
export type SocialList = z.infer<typeof SocialListSchema>;

export const PlatformInsertSchema = z.object({
  title: z.string().min(1),
  urlTemplate: z.string().min(1),
  iconCode: z.string().min(1),
  status: statusSchema,
  sort: z.number().int(),
});
export const PlatformFullSchema = withFull(PlatformInsertSchema);
export const PlatformListSchema = withList(PlatformFullSchema);
export type PlatformInsert = z.infer<typeof PlatformInsertSchema>;
export type PlatformFull = z.infer<typeof PlatformFullSchema>;
export type PlatformList = z.infer<typeof PlatformListSchema>;

export const SolutionInsertSchema = z.object({
  locale: localeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  iconCode: z.string().min(1),
  sort: z.number().int(),
});
export const SolutionFullSchema = withFull(SolutionInsertSchema);
export const SolutionListSchema = withList(SolutionFullSchema);
export type SolutionInsert = z.infer<typeof SolutionInsertSchema>;
export type SolutionFull = z.infer<typeof SolutionFullSchema>;
export type SolutionList = z.infer<typeof SolutionListSchema>;

export const SkillInsertSchema = z.object({
  title: z.string().min(1),
  type: skillTypeSchema,
  iconCode: z.string().min(1),
  status: statusSchema,
  sort: z.number().int(),
});
export const SkillFullSchema = withFull(SkillInsertSchema);
export const SkillListSchema = withList(SkillFullSchema);
export type SkillInsert = z.infer<typeof SkillInsertSchema>;
export type SkillFull = z.infer<typeof SkillFullSchema>;
export type SkillList = z.infer<typeof SkillListSchema>;

export const EducationInsertSchema = z.object({
  locale: localeSchema,
  title: z.string().min(1),
  organization: z.string().min(1),
  location: z.string().min(1),
  period: z.string().min(1),
  description: z.string().min(1),
  current: z.boolean(),
  sort: z.number().int(),
});
export const EducationFullSchema = withFull(EducationInsertSchema);
export const EducationListSchema = withList(EducationFullSchema);
export type EducationInsert = z.infer<typeof EducationInsertSchema>;
export type EducationFull = z.infer<typeof EducationFullSchema>;
export type EducationList = z.infer<typeof EducationListSchema>;

export const ExperienceInsertSchema = z.object({
  locale: localeSchema,
  title: z.string().min(1),
  organization: z.string().min(1),
  location: z.string().min(1),
  period: z.string().min(1),
  description: z.string().min(1),
  current: z.boolean(),
  sort: z.number().int(),
});
export const ExperienceFullSchema = withFull(ExperienceInsertSchema);
export const ExperienceListSchema = withList(ExperienceFullSchema);
export type ExperienceInsert = z.infer<typeof ExperienceInsertSchema>;
export type ExperienceFull = z.infer<typeof ExperienceFullSchema>;
export type ExperienceList = z.infer<typeof ExperienceListSchema>;

export const ImpactMetricInsertSchema = z.object({
  aboutId: z.string().min(1),
  internalCode: z.string().min(1),
  locale: localeSchema,
  label: z.string().min(1),
  value: z.string().min(1),
  sourceId: z.string().min(1),
  isPlaceholder: z.boolean(),
});
export const ImpactMetricFullSchema = withFull(ImpactMetricInsertSchema);
export const ImpactMetricListSchema = withList(ImpactMetricFullSchema);
export type ImpactMetricInsert = z.infer<typeof ImpactMetricInsertSchema>;
export type ImpactMetricFull = z.infer<typeof ImpactMetricFullSchema>;
export type ImpactMetricList = z.infer<typeof ImpactMetricListSchema>;

export const MetricSourceInsertSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  iconCode: z.string().min(1),
  status: z.string().min(1),
});
export const MetricSourceFullSchema = withFull(MetricSourceInsertSchema);
export const MetricSourceListSchema = withList(MetricSourceFullSchema);
export type MetricSourceInsert = z.infer<typeof MetricSourceInsertSchema>;
export type MetricSourceFull = z.infer<typeof MetricSourceFullSchema>;
export type MetricSourceList = z.infer<typeof MetricSourceListSchema>;
