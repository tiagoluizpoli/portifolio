import { z } from 'zod';

/**
 * Skill Schema (Zenith UI)
 * Aligned with @repo/appwrite-core/domain/Skill
 */
export const skillSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  locale: z.string(),
  title: z.string().min(1, 'Skill name is required'),
  type: z.enum(['frontend', 'backend', 'fullstack', 'hard', 'soft', 'tool']),
  level: z.number().int().min(0).max(100),
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
  url: z.string().url('Invalid URL format').or(z.literal('')).optional(),
  sort: z.number().int().optional(),
});

export const skillsSchema = z.object({
  items: z.array(skillSchema),
});

export const solutionsListSchema = z.object({
  items: z.array(solutionSchema),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type SolutionInput = z.infer<typeof solutionSchema>;
export type SolutionsInput = z.infer<typeof solutionsListSchema>;
