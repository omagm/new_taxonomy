import { z } from 'zod';
import { MultilingualSchema, UIDSchema } from './common.schema.js';

export const CategorySchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1),
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  parent_category_uid: UIDSchema.optional(),
  alt_parent_category_uid: UIDSchema.optional(),
  position_rank: z.number().int(),
  alt_position_rank: z.number().int().optional(),
  isMetaCategory: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateCategoryInputSchema = z.object({
  name: z.string().min(1),
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  parent_category_uid: UIDSchema.optional(),
  alt_parent_category_uid: UIDSchema.optional(),
  position_rank: z.number().int().default(0),
  alt_position_rank: z.number().int().optional(),
  isMetaCategory: z.boolean().default(false),
});

export const UpdateCategoryInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  label: MultilingualSchema.optional(),
  internal_description: z.string().optional(),
  parent_category_uid: UIDSchema.optional(),
  alt_parent_category_uid: UIDSchema.optional(),
  position_rank: z.number().int().optional(),
  alt_position_rank: z.number().int().optional(),
  isMetaCategory: z.boolean().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
