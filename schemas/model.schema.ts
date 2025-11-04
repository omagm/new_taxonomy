import { z } from 'zod';
import { UIDSchema } from './common.schema.js';

export const ModelSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1),
  category_uid: UIDSchema,
  manufacturer_uid: UIDSchema.optional(), // Reference to manufacturer if needed
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateModelInputSchema = z.object({
  name: z.string().min(1),
  category_uid: UIDSchema,
  manufacturer_uid: UIDSchema.optional(),
});

export const UpdateModelInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  category_uid: UIDSchema.optional(),
  manufacturer_uid: UIDSchema.optional(),
});

export type Model = z.infer<typeof ModelSchema>;
export type CreateModelInput = z.infer<typeof CreateModelInputSchema>;
export type UpdateModelInput = z.infer<typeof UpdateModelInputSchema>;
