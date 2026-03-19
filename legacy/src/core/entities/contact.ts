import { z } from 'zod';
import type { Translatable } from './shared';

export const contactSchema = z.object({
  name: z.string().min(2, 'Please provide a valid name'),
  phoneNumber: z.string().min(4, 'Please provide a valid phone number'),
  email: z.string().email(),
  solution: z.string().min(1, 'Please select a solution'),
  message: z.string().min(1, 'Please provide a message'),
});

export type Contact = z.infer<typeof contactSchema>;

export interface ContactTranslantion extends Translatable {
  type: string;
}

export interface ContactInfo {
  id: string;
  type: string;
  value: string;
  iconCode: string;
  translations: ContactTranslantion[];
}
