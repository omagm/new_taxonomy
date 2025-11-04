import { z } from 'zod';
import { MultilingualSchema, UIDSchema } from './common.schema.js';

export const SpecificationTypeSchema = z.enum([
  'Text',
  'Boolean Plus',
  'Enum Plus',
  'Numerical',
  'Numerical Range',
]);

// Type options for different specification types
export const TextTypeOptionsSchema = z.object({
  max_length: z.number().int().positive().optional(),
});

export const BooleanPlusTypeOptionsSchema = z.object({});

export const EnumPlusTypeOptionsSchema = z.object({
  allow_multiple: z.boolean().default(false),
  hide_name: z.boolean().default(false),
});

export const NumericalTypeOptionsSchema = z.object({
  unit: z.string().optional(), // e.g., "cm", "mm", "sheets/hour", "nameAsUnit"
  min: z.number().optional(),
  max: z.number().optional(),
  num_type: z.enum(['float', 'int']).default('float'),
});

export const NumericalRangeTypeOptionsSchema = z.object({
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  num_type: z.enum(['float', 'int']).default('float'),
  range_type: z.enum(['from_to', 'two_dimensional', 'three_dimensional']),
});

export const TypeOptionsSchema = z.union([
  TextTypeOptionsSchema,
  BooleanPlusTypeOptionsSchema,
  EnumPlusTypeOptionsSchema,
  NumericalTypeOptionsSchema,
  NumericalRangeTypeOptionsSchema,
]);

export const SpecificationSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1),
  specification_group_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  required: z.boolean().default(false),
  highlighted: z.boolean().default(false),
  regexp_pattern: z.string().optional(),
  type: SpecificationTypeSchema,
  type_options: TypeOptionsSchema,
  position_rank: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSpecificationInputSchema = z.object({
  name: z.string().min(1),
  specification_group_uid: UIDSchema,
  label: MultilingualSchema,
  internal_description: z.string().optional(),
  required: z.boolean().default(false),
  highlighted: z.boolean().default(false),
  regexp_pattern: z.string().optional(),
  type: SpecificationTypeSchema,
  type_options: TypeOptionsSchema,
  position_rank: z.number().int().default(0),
});

export const UpdateSpecificationInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  specification_group_uid: UIDSchema.optional(),
  label: MultilingualSchema.optional(),
  internal_description: z.string().optional(),
  required: z.boolean().optional(),
  highlighted: z.boolean().optional(),
  regexp_pattern: z.string().optional(),
  type: SpecificationTypeSchema.optional(),
  type_options: TypeOptionsSchema.optional(),
  position_rank: z.number().int().optional(),
});

export type Specification = z.infer<typeof SpecificationSchema>;
export type SpecificationType = z.infer<typeof SpecificationTypeSchema>;
export type TypeOptions = z.infer<typeof TypeOptionsSchema>;
export type CreateSpecificationInput = z.infer<typeof CreateSpecificationInputSchema>;
export type UpdateSpecificationInput = z.infer<typeof UpdateSpecificationInputSchema>;
