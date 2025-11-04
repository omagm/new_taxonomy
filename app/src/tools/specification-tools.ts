import { z } from 'zod';
import {
  Specification,
  SpecificationGroup,
  CreateSpecificationInputSchema,
  UpdateSpecificationInputSchema,
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

export const specificationTools = {
  create_specification: {
    description:
      'Create a new specification within a specification group. Type options vary by type.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        specification_group_uid: { type: 'string' },
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
        required: { type: 'boolean', default: false },
        highlighted: { type: 'boolean', default: false },
        regexp_pattern: { type: 'string' },
        type: {
          type: 'string',
          enum: ['Text', 'Boolean Plus', 'Enum Plus', 'Numerical', 'Numerical Range'],
        },
        type_options: {
          type: 'object',
          description: 'Type-specific options (structure varies by type)',
        },
        position_rank: { type: 'number', default: 0 },
      },
      required: ['name', 'specification_group_uid', 'label', 'type', 'type_options'],
    },
    handler: async (input: unknown) => {
      const validated = CreateSpecificationInputSchema.parse(input);

      // Check if specification group exists
      const group = await findEntityByUID<SpecificationGroup>(
        'specification-groups',
        validated.specification_group_uid
      );
      if (!group) {
        throw new Error(
          `Specification Group with UID ${validated.specification_group_uid} not found`
        );
      }

      const now = new Date().toISOString();
      const spec: Specification = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('specifications', spec);
      return {
        content: [
          {
            type: 'text',
            text: `Specification created successfully!\nUID: ${spec.uid}\nName: ${spec.name}\nType: ${spec.type}\nGroup: ${group.name}`,
          },
        ],
      };
    },
  },

  update_specification: {
    description: 'Update an existing specification',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        name: { type: 'string' },
        specification_group_uid: { type: 'string' },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
        },
        internal_description: { type: 'string' },
        required: { type: 'boolean' },
        highlighted: { type: 'boolean' },
        regexp_pattern: { type: 'string' },
        type: {
          type: 'string',
          enum: ['Text', 'Boolean Plus', 'Enum Plus', 'Numerical', 'Numerical Range'],
        },
        type_options: { type: 'object' },
        position_rank: { type: 'number' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateSpecificationInputSchema.parse(input);

      const existing = await findEntityByUID<Specification>('specifications', validated.uid);
      if (!existing) {
        throw new Error(`Specification with UID ${validated.uid} not found`);
      }

      // Check if specification group exists (if provided)
      if (validated.specification_group_uid) {
        const group = await findEntityByUID<SpecificationGroup>(
          'specification-groups',
          validated.specification_group_uid
        );
        if (!group) {
          throw new Error(
            `Specification Group with UID ${validated.specification_group_uid} not found`
          );
        }
      }

      const updated = await updateEntity('specifications', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Specification updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_specification: {
    description: 'Delete a specification (checks for dependencies)',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      // Check if spec has enum options
      const enumOptions = await findEntitiesByField('enum-options', 'specification_uid', uid);
      if (enumOptions.length > 0) {
        throw new Error(
          `Cannot delete specification: ${enumOptions.length} enum option(s) depend on it`
        );
      }

      // Check if spec has presets
      const presets = await findEntitiesByField(
        'specification-presets',
        'specification_uid',
        uid
      );
      if (presets.length > 0) {
        throw new Error(
          `Cannot delete specification: ${presets.length} preset(s) depend on it`
        );
      }

      // Check if spec has machine values
      const values = await readEntities('machine-specification-values');
      const hasValues = values.some((v: any) => v.specification_uid === uid);
      if (hasValues) {
        throw new Error(
          'Cannot delete specification: machine specification values depend on it'
        );
      }

      const deleted = await deleteEntity('specifications', uid);
      if (!deleted) {
        throw new Error(`Specification with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Specification deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_specifications: {
    description: 'List all specifications or filter by specification group',
    inputSchema: {
      type: 'object',
      properties: {
        specification_group_uid: { type: 'string' },
      },
    },
    handler: async (input: unknown) => {
      const { specification_group_uid } = z
        .object({ specification_group_uid: z.string().optional() })
        .parse(input);

      let specs = await readEntities<Specification>('specifications');

      if (specification_group_uid) {
        specs = specs.filter((s) => s.specification_group_uid === specification_group_uid);
      }

      // Sort by position_rank (descending)
      specs.sort((a, b) => b.position_rank - a.position_rank);

      const formatted = specs.map(
        (s) =>
          `- ${s.label.en} (${s.name})\n  UID: ${s.uid}\n  Type: ${s.type}\n  Required: ${s.required}\n  Highlighted: ${s.highlighted}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${specs.length} specifications:\n\n${formatted.join('\n\n')}`
                : 'No specifications found',
          },
        ],
      };
    },
  },

  get_specification: {
    description: 'Get a single specification by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const spec = await findEntityByUID<Specification>('specifications', uid);
      if (!spec) {
        throw new Error(`Specification with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(spec, null, 2),
          },
        ],
      };
    },
  },
};
