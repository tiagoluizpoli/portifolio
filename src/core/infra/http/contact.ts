import type { Contact } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const insertContact = async (payload: Contact): Promise<void> => {
  try {
    await httpClient.post('items/contact', payload);
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
