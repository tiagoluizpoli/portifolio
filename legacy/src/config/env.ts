import { z } from 'zod';

const envSchema = z.object({
  backend: z.object({
    baseUrl: z.string(),
    token: z.string(),
  }),
});

type Env = z.infer<typeof envSchema>;

export const envObject: Env = {
  backend: {
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    token: import.meta.env.VITE_APP_TOKEN,
  },
};

export const env = envSchema.parse(envObject);
