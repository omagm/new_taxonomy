import { z } from 'zod';
import { MultilingualSchema, UIDSchema } from './common.schema.js';

export const EnumOptionSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1), // Also serves as unique identifier
  specification_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  description: MultilingualSchema.optional(),
  manufacturers_using: z.array(UIDSchema).default([]), // Empty means all can use it
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateEnumOptionInputSchema = z.object({
  name: z.string().min(1),
  specification_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  description: MultilingualSchema.optional(),
  manufacturers_using: z.array(UIDSchema).default([]),
});

export const UpdateEnumOptionInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  specification_uid: UIDSchema.optional(),
  label: MultilingualSchema.optional(),
  internal_description: z.string().optional(),
  description: MultilingualSchema.optional(),
  manufacturers_using: z.array(UIDSchema).optional(),
});

export type EnumOption = z.infer<typeof EnumOptionSchema>;
export type CreateEnumOptionInput = z.infer<typeof CreateEnumOptionInputSchema>;
export type UpdateEnumOptionInput = z.infer<typeof UpdateEnumOptionInputSchema>;
