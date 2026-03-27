import { PortfolioService } from '@repo/appwrite-core';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { env } from '@/config/env';

// Use service for initialization
PortfolioService.init(env);

const portfolioService = new PortfolioService(
  env.APPWRITE_PROJECT_ID,
  env.APPWRITE_DATABASE_ID, // This was missing in the constructor before, I need to check if I updated the service
);

export const getAppWriteData = createServerFn({ method: 'GET' }).handler(
  async (payload) => {
    const { data } = z
      .object({
        data: z.object({
          collectionId: z.string(),
          documentId: z.string(),
        }),
      })
      .parse(payload);
    // Note: In a fully abstracted world, the service would know the collectionId
    // or we pass it from a secure config. For now, following the existing repo pattern.
    return await portfolioService.getPortfolioRecord(data.documentId);
  },
);

export const createPortfolioItem = createServerFn({ method: 'POST' }).handler(
  async (payload) => {
    const { data } = z
      .object({
        data: z.object({
          title: z.string().min(1),
          description: z.string().optional(),
        }),
      })
      .parse(payload);

    return await portfolioService.createPortfolioItem(data);
  },
);

export const testSecretIsolation = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      hasKey: !!env.APPWRITE_API_KEY,
      message: 'Isolation Test',
    };
  },
);
