import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2),
  phoneNumber: z.string(),
  email: z.string().email(),
  solution: z.string(),
  message: z.string(),
});

export type Contact = z.infer<typeof contactSchema>;
