import { z } from 'zod';

// Common multilingual object
export const MultilingualSchema = z.object({
  en: z.string(),
  de: z.string().optional(),
  es: z.string().optional(),
});

export type Multilingual = z.infer<typeof MultilingualSchema>;

// UID pattern
export const UIDSchema = z.string().uuid();
