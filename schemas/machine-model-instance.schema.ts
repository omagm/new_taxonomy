import { z } from 'zod';
import { UIDSchema } from './common.schema.js';

export const MachineModelInstanceSchema = z.object({
  uid: UIDSchema, // Instance ID
  machine_uid: UIDSchema,
  model_uid: UIDSchema,
  position: z.number().int().min(0),
  instance_label: z.string().optional(), // e.g., "Front Trimmer", "Back Trimmer"
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateMachineModelInstanceInputSchema = z.object({
  machine_uid: UIDSchema,
  model_uid: UIDSchema,
  position: z.number().int().min(0),
  instance_label: z.string().optional(),
});

export const UpdateMachineModelInstanceInputSchema = z.object({
  uid: UIDSchema,
  position: z.number().int().min(0).optional(),
  instance_label: z.string().optional(),
});

export type MachineModelInstance = z.infer<typeof MachineModelInstanceSchema>;
export type CreateMachineModelInstanceInput = z.infer<typeof CreateMachineModelInstanceInputSchema>;
export type UpdateMachineModelInstanceInput = z.infer<typeof UpdateMachineModelInstanceInputSchema>;
