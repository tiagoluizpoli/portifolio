import type { Contact, ContactInfo } from '@/core/entities';
import { httpClient } from '@/lib';
import { isAxiosError } from 'axios';

export const getContactInfo = async (): Promise<ContactInfo[]> => {
  try {
    const fields = ['*', 'translations.*', 'translations.directus_translations_id.*'];
    const response = await httpClient.get('items/contactInfo', {
      params: {
        fields: fields.join(','),
        'filter[status][_eq]': 'published',
      },
    });

    console.log({ data: response.data.data });
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
