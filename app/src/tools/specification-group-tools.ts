import { z } from 'zod';
import {
  SpecificationGroup,
  Category,
  CreateSpecificationGroupInputSchema,
  UpdateSpecificationGroupInputSchema,
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

export const specificationGroupTools = {
  create_specification_group: {
    description: 'Create a new specification group within a category',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Internal name of the specification group',
        },
        category_uid: {
          type: 'string',
          description: 'UID of the category this group belongs to',
        },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
          required: ['en'],
        },
        internal_description: {
          type: 'string',
          description: 'Internal description',
        },
        type: {
          type: 'string',
          enum: ['Equipment', 'Technical Details'],
          description: 'Type of specification group',
        },
        position_rank: {
          type: 'number',
          description: 'Position rank (higher values = higher position)',
          default: 0,
        },
      },
      required: ['name', 'category_uid', 'label', 'type'],
    },
    handler: async (input: unknown) => {
      const validated = CreateSpecificationGroupInputSchema.parse(input);

      // Check if category exists
      const category = await findEntityByUID<Category>('categories', validated.category_uid);
      if (!category) {
        throw new Error(`Category with UID ${validated.category_uid} not found`);
      }

      const now = new Date().toISOString();
      const specGroup: SpecificationGroup = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('specification-groups', specGroup);
      return {
        content: [
          {
            type: 'text',
            text: `Specification Group created successfully!\nUID: ${specGroup.uid}\nName: ${specGroup.name}\nCategory: ${category.name}\nType: ${specGroup.type}`,
          },
        ],
      };
    },
  },

  update_specification_group: {
    description: 'Update an existing specification group',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        name: { type: 'string' },
        category_uid: { type: 'string' },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
        },
        internal_description: { type: 'string' },
        type: {
          type: 'string',
          enum: ['Equipment', 'Technical Details'],
        },
        position_rank: { type: 'number' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateSpecificationGroupInputSchema.parse(input);

      const existing = await findEntityByUID<SpecificationGroup>(
        'specification-groups',
        validated.uid
      );
      if (!existing) {
        throw new Error(`Specification Group with UID ${validated.uid} not found`);
      }

      // Check if category exists (if provided)
      if (validated.category_uid) {
        const category = await findEntityByUID<Category>('categories', validated.category_uid);
        if (!category) {
          throw new Error(`Category with UID ${validated.category_uid} not found`);
        }
      }

      const updated = await updateEntity('specification-groups', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Specification Group updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_specification_group: {
    description: 'Delete a specification group (checks for dependencies)',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      // Check if group has specifications
      const specs = await findEntitiesByField('specifications', 'specification_group_uid', uid);
      if (specs.length > 0) {
        throw new Error(
          `Cannot delete specification group: ${specs.length} specification(s) depend on it`
        );
      }

      const deleted = await deleteEntity('specification-groups', uid);
      if (!deleted) {
        throw new Error(`Specification Group with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Specification Group deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_specification_groups: {
    description: 'List all specification groups or filter by category',
    inputSchema: {
      type: 'object',
      properties: {
        category_uid: {
          type: 'string',
          description: 'Filter by category UID',
        },
      },
    },
    handler: async (input: unknown) => {
      const { category_uid } = z.object({ category_uid: z.string().optional() }).parse(input);

      let groups = await readEntities<SpecificationGroup>('specification-groups');

      if (category_uid) {
        groups = groups.filter((g) => g.category_uid === category_uid);
      }

      // Sort by position_rank (descending)
      groups.sort((a, b) => b.position_rank - a.position_rank);

      const formatted = groups.map(
        (g) =>
          `- ${g.label.en} (${g.name})\n  UID: ${g.uid}\n  Type: ${g.type}\n  Category: ${g.category_uid}\n  Position: ${g.position_rank}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${groups.length} specification groups:\n\n${formatted.join('\n\n')}`
                : 'No specification groups found',
          },
        ],
      };
    },
  },

  get_specification_group: {
    description: 'Get a single specification group by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const group = await findEntityByUID<SpecificationGroup>('specification-groups', uid);
      if (!group) {
        throw new Error(`Specification Group with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(group, null, 2),
          },
        ],
      };
    },
  },
};
