import { z } from 'zod';
import { MultilingualSchema, UIDSchema } from './common.schema.js';

// Value schemas for different specification types
export const TextValueSchema = z.object({
  text: MultilingualSchema,
});

export const BooleanPlusValueSchema = z.object({
  boolean: z.enum(['yes', 'no']),
  text: MultilingualSchema.optional(),
});

export const EnumPlusValueSchema = z.object({
  boolean: z.enum(['yes', 'no']),
  enum_option_uids: z.array(UIDSchema).optional(),
  text: MultilingualSchema.optional(),
});

export const NumericalValueSchema = z.object({
  numerical: z.number(),
  text: MultilingualSchema.optional(),
});

export const NumericalRangeValueSchema = z.object({
  numerical_range: z.union([
    z.object({ from: z.number(), to: z.number() }), // from_to type
    z.object({ a: z.number(), b: z.number() }), // two_dimensional type
    z.object({ a: z.number(), b: z.number(), c: z.number() }), // three_dimensional type
  ]),
  text: MultilingualSchema.optional(),
});

export const SpecificationValueSchema = z.union([
  TextValueSchema,
  BooleanPlusValueSchema,
  EnumPlusValueSchema,
  NumericalValueSchema,
  NumericalRangeValueSchema,
]);

export const MachineSpecificationValueSchema = z.object({
  machine_model_instance_uid: UIDSchema,
  specification_uid: UIDSchema,
  value: SpecificationValueSchema,
  is_inherited: z.boolean().default(true), // Track if value came from preset or user edited
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateMachineSpecificationValueInputSchema = z.object({
  machine_model_instance_uid: UIDSchema,
  specification_uid: UIDSchema,
  value: SpecificationValueSchema,
  is_inherited: z.boolean().default(false),
});

export const UpdateMachineSpecificationValueInputSchema = z.object({
  machine_model_instance_uid: UIDSchema,
  specification_uid: UIDSchema,
  value: SpecificationValueSchema,
  is_inherited: z.boolean().default(false),
});

export type MachineSpecificationValue = z.infer<typeof MachineSpecificationValueSchema>;
export type SpecificationValue = z.infer<typeof SpecificationValueSchema>;
export type CreateMachineSpecificationValueInput = z.infer<typeof CreateMachineSpecificationValueInputSchema>;
export type UpdateMachineSpecificationValueInput = z.infer<typeof UpdateMachineSpecificationValueInputSchema>;
