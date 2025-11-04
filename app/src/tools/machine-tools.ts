import { z } from 'zod';
import {
  Machine,
  MachineModelInstance,
  MachineSpecificationValue,
  Model,
  CreateMachineInputSchema,
  UpdateMachineInputSchema,
  CreateMachineModelInstanceInputSchema,
  UpdateMachineModelInstanceInputSchema,
  CreateMachineSpecificationValueInputSchema,
  UpdateMachineSpecificationValueInputSchema,
} from 'schemas/index.js';
import {
  createEntity,
  updateEntity,
  deleteEntity,
  readEntities,
  findEntityByUID,
  findEntitiesByField,
} from '../lib/storage.js';
import { generateUID } from '../lib/uid-generator.js';

export const machineTools = {
  create_machine: {
    description: 'Create a new machine with a primary model',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        year_of_construction: { type: 'number' },
        serial_number: { type: 'string' },
        primary_model_uid: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          default: 'draft',
        },
      },
      required: ['name', 'primary_model_uid'],
    },
    handler: async (input: unknown) => {
      const validated = CreateMachineInputSchema.parse(input);

      // Verify primary model exists
      const model = await findEntityByUID<Model>('models', validated.primary_model_uid);
      if (!model) {
        throw new Error(`Model with UID ${validated.primary_model_uid} not found`);
      }

      const now = new Date().toISOString();
      const machine: Machine = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('machines', machine);

      // Create primary model instance
      const primaryInstance: MachineModelInstance = {
        uid: generateUID(),
        machine_uid: machine.uid,
        model_uid: validated.primary_model_uid,
        position: 0,
        created_at: now,
        updated_at: now,
      };

      await createEntity('machine-model-instances', primaryInstance);

      return {
        content: [
          {
            type: 'text',
            text: `Machine created successfully!\nUID: ${machine.uid}\nName: ${machine.name}\nPrimary Model: ${model.name}\nPrimary Instance UID: ${primaryInstance.uid}`,
          },
        ],
      };
    },
  },

  update_machine: {
    description: 'Update an existing machine',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        name: { type: 'string' },
        year_of_construction: { type: 'number' },
        serial_number: { type: 'string' },
        primary_model_uid: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
        },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateMachineInputSchema.parse(input);

      const existing = await findEntityByUID<Machine>('machines', validated.uid);
      if (!existing) {
        throw new Error(`Machine with UID ${validated.uid} not found`);
      }

      if (validated.primary_model_uid) {
        const model = await findEntityByUID<Model>('models', validated.primary_model_uid);
        if (!model) {
          throw new Error(`Model with UID ${validated.primary_model_uid} not found`);
        }
      }

      const updated = await updateEntity('machines', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Machine updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_machine: {
    description: 'Delete a machine and all its model instances and specification values',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      // Delete all model instances
      const instances = await findEntitiesByField<MachineModelInstance>(
        'machine-model-instances',
        'machine_uid',
        uid
      );
      for (const instance of instances) {
        await deleteEntity('machine-model-instances', instance.uid);

        // Delete all specification values for this instance
        const values = await readEntities<MachineSpecificationValue>(
          'machine-specification-values'
        );
        const filtered = values.filter((v) => v.machine_model_instance_uid !== instance.uid);
        await createEntity('machine-specification-values', filtered as any);
      }

      const deleted = await deleteEntity('machines', uid);
      if (!deleted) {
        throw new Error(`Machine with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Machine deleted successfully (UID: ${uid})\nDeleted ${instances.length} model instances`,
          },
        ],
      };
    },
  },

  list_machines: {
    description: 'List all machines',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'published'],
        },
      },
    },
    handler: async (input: unknown) => {
      const { status } = z
        .object({ status: z.enum(['draft', 'published']).optional() })
        .parse(input);

      let machines = await readEntities<Machine>('machines');

      if (status) {
        machines = machines.filter((m) => m.status === status);
      }

      const formatted = machines.map(
        (m) =>
          `- ${m.name}\n  UID: ${m.uid}\n  Status: ${m.status}\n  Primary Model: ${m.primary_model_uid}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${machines.length} machines:\n\n${formatted.join('\n\n')}`
                : 'No machines found',
          },
        ],
      };
    },
  },

  get_machine: {
    description: 'Get a single machine by UID with all model instances',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const machine = await findEntityByUID<Machine>('machines', uid);
      if (!machine) {
        throw new Error(`Machine with UID ${uid} not found`);
      }

      const instances = await findEntitiesByField<MachineModelInstance>(
        'machine-model-instances',
        'machine_uid',
        uid
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ machine, instances }, null, 2),
          },
        ],
      };
    },
  },

  add_model_instance: {
    description: 'Add a secondary model instance to a machine',
    inputSchema: {
      type: 'object',
      properties: {
        machine_uid: { type: 'string' },
        model_uid: { type: 'string' },
        position: { type: 'number' },
        instance_label: {
          type: 'string',
          description: 'Optional label like "Front Trimmer"',
        },
      },
      required: ['machine_uid', 'model_uid', 'position'],
    },
    handler: async (input: unknown) => {
      const validated = CreateMachineModelInstanceInputSchema.parse(input);

      const machine = await findEntityByUID<Machine>('machines', validated.machine_uid);
      if (!machine) {
        throw new Error(`Machine with UID ${validated.machine_uid} not found`);
      }

      const model = await findEntityByUID<Model>('models', validated.model_uid);
      if (!model) {
        throw new Error(`Model with UID ${validated.model_uid} not found`);
      }

      // Check for position conflict
      const instances = await findEntitiesByField<MachineModelInstance>(
        'machine-model-instances',
        'machine_uid',
        validated.machine_uid
      );
      const positionConflict = instances.find((i) => i.position === validated.position);
      if (positionConflict) {
        throw new Error(`Position ${validated.position} is already taken`);
      }

      const now = new Date().toISOString();
      const instance: MachineModelInstance = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('machine-model-instances', instance);

      return {
        content: [
          {
            type: 'text',
            text: `Model instance added successfully!\nUID: ${instance.uid}\nModel: ${model.name}\nPosition: ${instance.position}${instance.instance_label ? `\nLabel: ${instance.instance_label}` : ''}`,
          },
        ],
      };
    },
  },

  remove_model_instance: {
    description: 'Remove a model instance from a machine (cannot remove primary)',
    inputSchema: {
      type: 'object',
      properties: {
        instance_uid: { type: 'string' },
      },
      required: ['instance_uid'],
    },
    handler: async (input: unknown) => {
      const { instance_uid } = z.object({ instance_uid: z.string() }).parse(input);

      const instance = await findEntityByUID<MachineModelInstance>(
        'machine-model-instances',
        instance_uid
      );
      if (!instance) {
        throw new Error(`Model instance with UID ${instance_uid} not found`);
      }

      const machine = await findEntityByUID<Machine>('machines', instance.machine_uid);
      if (machine && machine.primary_model_uid === instance.model_uid && instance.position === 0) {
        throw new Error('Cannot remove primary model instance');
      }

      // Delete all specification values for this instance
      const values = await readEntities<MachineSpecificationValue>(
        'machine-specification-values'
      );
      const filtered = values.filter((v) => v.machine_model_instance_uid !== instance_uid);
      await createEntity('machine-specification-values', filtered as any);

      await deleteEntity('machine-model-instances', instance_uid);

      return {
        content: [
          {
            type: 'text',
            text: `Model instance removed successfully (UID: ${instance_uid})`,
          },
        ],
      };
    },
  },

  set_specification_value: {
    description: 'Set a specification value for a machine model instance',
    inputSchema: {
      type: 'object',
      properties: {
        machine_model_instance_uid: { type: 'string' },
        specification_uid: { type: 'string' },
        value: {
          type: 'object',
          description: 'Value object (structure varies by spec type)',
        },
        is_inherited: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['machine_model_instance_uid', 'specification_uid', 'value'],
    },
    handler: async (input: unknown) => {
      const validated = CreateMachineSpecificationValueInputSchema.parse(input);

      // Verify instance exists
      const instance = await findEntityByUID<MachineModelInstance>(
        'machine-model-instances',
        validated.machine_model_instance_uid
      );
      if (!instance) {
        throw new Error(
          `Machine model instance with UID ${validated.machine_model_instance_uid} not found`
        );
      }

      // Check if value already exists
      const existingValues = await readEntities<MachineSpecificationValue>(
        'machine-specification-values'
      );
      const existingIndex = existingValues.findIndex(
        (v) =>
          v.machine_model_instance_uid === validated.machine_model_instance_uid &&
          v.specification_uid === validated.specification_uid
      );

      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        // Update existing value
        existingValues[existingIndex] = {
          ...existingValues[existingIndex],
          value: validated.value,
          is_inherited: validated.is_inherited,
          updated_at: now,
        };
      } else {
        // Create new value
        const newValue: MachineSpecificationValue = {
          machine_model_instance_uid: validated.machine_model_instance_uid,
          specification_uid: validated.specification_uid,
          value: validated.value,
          is_inherited: validated.is_inherited ?? false,
          created_at: now,
          updated_at: now,
        };
        existingValues.push(newValue);
      }

      await createEntity('machine-specification-values', existingValues as any);

      return {
        content: [
          {
            type: 'text',
            text: `Specification value ${existingIndex >= 0 ? 'updated' : 'created'} successfully!\nInstance: ${validated.machine_model_instance_uid}\nSpecification: ${validated.specification_uid}`,
          },
        ],
      };
    },
  },
};
