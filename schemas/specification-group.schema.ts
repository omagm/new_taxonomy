import { z } from 'zod';
import { MultilingualSchema, UIDSchema } from './common.schema.js';

export const SpecificationGroupTypeSchema = z.enum(['Equipment', 'Technical Details']);

export const SpecificationGroupSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1),
  category_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  type: SpecificationGroupTypeSchema,
  position_rank: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSpecificationGroupInputSchema = z.object({
  name: z.string().min(1),
  category_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  type: SpecificationGroupTypeSchema,
  position_rank: z.number().int().default(0),
});

export const UpdateSpecificationGroupInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  category_uid: UIDSchema.optional(),
  label: MultilingualSchema.optional(),
  internal_description: z.string().optional(),
  type: SpecificationGroupTypeSchema.optional(),
  position_rank: z.number().int().optional(),
});

export type SpecificationGroup = z.infer<typeof SpecificationGroupSchema>;
export type SpecificationGroupType = z.infer<typeof SpecificationGroupTypeSchema>;
export type CreateSpecificationGroupInput = z.infer<typeof CreateSpecificationGroupInputSchema>;
export type UpdateSpecificationGroupInput = z.infer<typeof UpdateSpecificationGroupInputSchema>;
