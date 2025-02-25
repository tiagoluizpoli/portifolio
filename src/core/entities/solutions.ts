import type { Translatable } from './shared';

export interface SolutionsTranslation extends Translatable {
  title: string;
  description: string;
}
export interface Solution {
  id: string;
  sort: number;
  title: string;
  description: string;
  iconCode: string;
  translations: SolutionsTranslation[];
}
