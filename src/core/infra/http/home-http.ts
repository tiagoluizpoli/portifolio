import type { Home } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const getHome = async (): Promise<Home> => {
  try {
    const response = await httpClient.get('items/home', {
      params: {
        fields: '*,socials.*',
        'deep[socials][_filter][status][_eq]': 'published',
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
