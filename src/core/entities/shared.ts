import type { Language } from '@/providers/lang';

export interface Translation {
  id: string;
  language: Language;
}

export interface Translatable {
  directus_translations_id: Translation;
}
