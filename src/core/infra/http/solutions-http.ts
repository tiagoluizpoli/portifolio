import type { Solution } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const getSolutions = async (): Promise<Solution[]> => {
  try {
    const response = await httpClient.get('items/solutions', {
      params: {
        fields: '*,translations.*,translations.directus_translations_id.*',
        'filter[status][_eq]': 'published',
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
