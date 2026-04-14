import { z } from 'zod';

/**
 * Skill Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/Skill
 */
export const skillSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Skill name is required'),
  type: z.enum(['frontend', 'backend', 'fullstack']),
  iconCode: z.string().min(1, 'Icon code is required'),
  iconId: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  sort: z.number().int().optional(),
});

/**
 * Solution Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/Solution
 */
export const solutionSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  locale: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  iconCode: z.string().min(1, 'Icon code is required'),
  iconId: z.string().optional(),
  sort: z.number().int().optional(),
});

export const skillsSchema = z.object({
  items: z.array(skillSchema),
});

export const solutionsListSchema = z.object({
  items: z.array(solutionSchema),
});

export const platformSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Platform name is required'),
  urlTemplate: z.string().min(1, 'URL Template is required'),
  iconCode: z.string().min(1, 'Icon code is required'),
  status: z.enum(['active', 'archived']).default('active'),
  sort: z.number().int().optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type SolutionInput = z.infer<typeof solutionSchema>;
export type SolutionsInput = z.infer<typeof solutionsListSchema>;
export type PlatformInput = z.infer<typeof platformSchema>;
