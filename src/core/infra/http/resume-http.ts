import type { Resume } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const getResume = async (): Promise<Resume> => {
  try {
    const response = await httpClient.get('items/resume', {
      params: {
        fields:
          '*,about.*,about.info.*,experience.*,experience.items.*,education.*,education.items.*,skills.*,skills.items.*',
        'deep[about][info][_filter][status][_eq]': 'published',
        'deep[experience][items][_filter][status][_eq]': 'published',
        'deep[education][items][_filter][status][_eq]': 'published',
        'deep[skills][items][_filter][status][_eq]': 'published',
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
