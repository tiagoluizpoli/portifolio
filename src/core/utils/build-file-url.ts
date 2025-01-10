import { env } from '@/config/env';

export const buildFileUrl = (id?: string, download?: boolean) => {
  if (!id) {
    return '';
  }
  return `${env.backend.baseUrl}/assets/${id}${download && '?download'}`;
};
