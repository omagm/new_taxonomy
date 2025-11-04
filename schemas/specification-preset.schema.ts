import { z } from 'zod';
import { UIDSchema } from './common.schema.js';

// Numerical constraint schemas
export const NumericalConstraintSchema = z.union([
  z.object({
    constraint_type: z.literal('exact'),
    exact: z.number(),
  }),
  z.object({
    constraint_type: z.literal('range'),
    min: z.number(),
    max: z.number(),
  }),
  z.object({
    constraint_type: z.literal('set'),
    set: z.array(z.number()),
  }),
]);

// Numerical range constraint schemas
export const FromToRangeConstraintSchema = z.union([
  z.object({
    constraint_type: z.literal('exact'),
    exact: z.object({ from: z.number(), to: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('range'),
    min: z.object({ from: z.number(), to: z.number() }),
    max: z.object({ from: z.number(), to: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('set'),
    set: z.array(z.object({ from: z.number(), to: z.number() })),
  }),
]);

export const TwoDimensionalRangeConstraintSchema = z.union([
  z.object({
    constraint_type: z.literal('exact'),
    exact_2d: z.object({ a: z.number(), b: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('range'),
    min_2d: z.object({ a: z.number(), b: z.number() }),
    max_2d: z.object({ a: z.number(), b: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('set'),
    set_2d: z.array(z.object({ a: z.number(), b: z.number() })),
  }),
]);

export const ThreeDimensionalRangeConstraintSchema = z.union([
  z.object({
    constraint_type: z.literal('exact'),
    exact_3d: z.object({ a: z.number(), b: z.number(), c: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('range'),
    min_3d: z.object({ a: z.number(), b: z.number(), c: z.number() }),
    max_3d: z.object({ a: z.number(), b: z.number(), c: z.number() }),
  }),
  z.object({
    constraint_type: z.literal('set'),
    set_3d: z.array(z.object({ a: z.number(), b: z.number(), c: z.number() })),
  }),
]);

// Allowed values schema
export const AllowedValuesSchema = z.union([
  // Enum Plus type
  z.object({
    type: z.literal('enum_options'),
    enum_option_uids: z.array(UIDSchema).min(1),
  }),
  // Boolean Plus type
  z.object({
    type: z.literal('boolean'),
    boolean_value: z.enum(['yes', 'no', 'any']),
  }),
  // Numerical type
  z.object({
    type: z.literal('numerical'),
    numerical: NumericalConstraintSchema,
  }),
  // Numerical Range type
  z.object({
    type: z.literal('numerical_range'),
    range_type: z.enum(['from_to', 'two_dimensional', 'three_dimensional']),
    numerical_range: z.union([
      FromToRangeConstraintSchema,
      TwoDimensionalRangeConstraintSchema,
      ThreeDimensionalRangeConstraintSchema,
    ]),
  }),
]);

export const PresetLevelSchema = z.enum(['category', 'model']);

export const SpecificationPresetSchema = z.object({
  uid: UIDSchema,
  preset_level: PresetLevelSchema,
  preset_target_uid: UIDSchema, // Category UID or Model UID
  specification_uid: UIDSchema,
  allowed_values: AllowedValuesSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSpecificationPresetInputSchema = z.object({
  preset_level: PresetLevelSchema,
  preset_target_uid: UIDSchema,
  specification_uid: UIDSchema,
  allowed_values: AllowedValuesSchema,
});

export const UpdateSpecificationPresetInputSchema = z.object({
  uid: UIDSchema,
  preset_level: PresetLevelSchema.optional(),
  preset_target_uid: UIDSchema.optional(),
  specification_uid: UIDSchema.optional(),
  allowed_values: AllowedValuesSchema.optional(),
});

export type SpecificationPreset = z.infer<typeof SpecificationPresetSchema>;
export type PresetLevel = z.infer<typeof PresetLevelSchema>;
export type AllowedValues = z.infer<typeof AllowedValuesSchema>;
export type CreateSpecificationPresetInput = z.infer<typeof CreateSpecificationPresetInputSchema>;
export type UpdateSpecificationPresetInput = z.infer<typeof UpdateSpecificationPresetInputSchema>;
