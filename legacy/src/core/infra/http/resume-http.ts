import type { Resume } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const getResume = async (): Promise<Resume> => {
  try {
    const fields = [
      '*',
      'translations.*',
      'translations.directus_translations_id.*',
      'translations.about.*',
      'translations.about.info.*',
      'translations.experience.*',
      'translations.experience.items.*',
      'translations.education.*',
      'translations.education.items.*',
      'translations.skills.*',
      'translations.skills.items.*',
      'translations.skills.items.id',
      'translations.skills.items.*',
      'translations.skills.items.resume_skills_items_id.*',
    ];

    const response = await httpClient.get('items/resume', {
      params: {
        fields: fields.join(','),
        'deep[translations][about][info][_filter][status][_eq]': 'published',
        'deep[translations][experience][items][_filter][status][_eq]': 'published',
        'deep[translations][education][items][_filter][status][_eq]': 'published',
        'deep[translations][skills][items][resume_skills_items_id][_filter][status][_eq]': 'published',
      },
    });

    return response.data.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error({
        status: error.response?.status,
        data: error.response?.data,
      });

      throw error.response?.data;
    }

    throw error;
  }
};
