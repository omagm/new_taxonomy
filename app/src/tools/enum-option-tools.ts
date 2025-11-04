import { z } from 'zod';
import {
  EnumOption,
  Specification,
  CreateEnumOptionInputSchema,
  UpdateEnumOptionInputSchema,
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

export const enumOptionTools = {
  create_enum_option: {
    description: 'Create a new enum option for an Enum Plus specification',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        specification_uid: { type: 'string' },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
          required: ['en'],
        },
        internal_description: { type: 'string' },
        description: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
        },
        manufacturers_using: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of manufacturer UIDs (empty means all can use it)',
        },
      },
      required: ['name', 'specification_uid', 'label'],
    },
    handler: async (input: unknown) => {
      const validated = CreateEnumOptionInputSchema.parse(input);

      const spec = await findEntityByUID<Specification>('specifications', validated.specification_uid);
      if (!spec) {
        throw new Error(`Specification with UID ${validated.specification_uid} not found`);
      }

      if (spec.type !== 'Enum Plus') {
        throw new Error(`Specification must be of type "Enum Plus" to have enum options`);
      }

      const now = new Date().toISOString();
      const enumOption: EnumOption = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('enum-options', enumOption);
      return {
        content: [
          {
            type: 'text',
            text: `Enum Option created successfully!\nUID: ${enumOption.uid}\nName: ${enumOption.name}\nSpecification: ${spec.name}`,
          },
        ],
      };
    },
  },

  update_enum_option: {
    description: 'Update an existing enum option',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        name: { type: 'string' },
        specification_uid: { type: 'string' },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
        },
        internal_description: { type: 'string' },
        description: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
        },
        manufacturers_using: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateEnumOptionInputSchema.parse(input);

      const existing = await findEntityByUID<EnumOption>('enum-options', validated.uid);
      if (!existing) {
        throw new Error(`Enum Option with UID ${validated.uid} not found`);
      }

      const updated = await updateEntity('enum-options', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Enum Option updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_enum_option: {
    description: 'Delete an enum option',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const deleted = await deleteEntity('enum-options', uid);
      if (!deleted) {
        throw new Error(`Enum Option with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Enum Option deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_enum_options: {
    description: 'List all enum options or filter by specification',
    inputSchema: {
      type: 'object',
      properties: {
        specification_uid: { type: 'string' },
      },
    },
    handler: async (input: unknown) => {
      const { specification_uid } = z.object({ specification_uid: z.string().optional() }).parse(input);

      let options = await readEntities<EnumOption>('enum-options');

      if (specification_uid) {
        options = options.filter((o) => o.specification_uid === specification_uid);
      }

      const formatted = options.map(
        (o) =>
          `- ${o.label.en} (${o.name})\n  UID: ${o.uid}\n  Specification: ${o.specification_uid}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${options.length} enum options:\n\n${formatted.join('\n\n')}`
                : 'No enum options found',
          },
        ],
      };
    },
  },

  get_enum_option: {
    description: 'Get a single enum option by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const option = await findEntityByUID<EnumOption>('enum-options', uid);
      if (!option) {
        throw new Error(`Enum Option with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(option, null, 2),
          },
        ],
      };
    },
  },
};
