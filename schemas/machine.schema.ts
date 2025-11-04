import { z } from 'zod';
import { UIDSchema } from './common.schema.js';

export const MachineStatusSchema = z.enum(['draft', 'published']);

export const MachineSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1),
  year_of_construction: z.number().int().positive().optional(),
  serial_number: z.string().optional(),
  primary_model_uid: UIDSchema,
  status: MachineStatusSchema.default('draft'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateMachineInputSchema = z.object({
  name: z.string().min(1),
  year_of_construction: z.number().int().positive().optional(),
  serial_number: z.string().optional(),
  primary_model_uid: UIDSchema,
  status: MachineStatusSchema.default('draft'),
});

export const UpdateMachineInputSchema = z.object({
  uid: UIDSchema,
  name: z.string().min(1).optional(),
  year_of_construction: z.number().int().positive().optional(),
  serial_number: z.string().optional(),
  primary_model_uid: UIDSchema.optional(),
  status: MachineStatusSchema.optional(),
});

export type Machine = z.infer<typeof MachineSchema>;
export type MachineStatus = z.infer<typeof MachineStatusSchema>;
export type CreateMachineInput = z.infer<typeof CreateMachineInputSchema>;
export type UpdateMachineInput = z.infer<typeof UpdateMachineInputSchema>;
