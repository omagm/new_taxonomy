import { z } from 'zod';
import {
  Category,
  CreateCategoryInputSchema,
  UpdateCategoryInputSchema,
  CategorySchema,
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

export const categoryTools = {
  create_category: {
    description: 'Create a new category with name, label, and optional parent category',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Internal name of the category (e.g., "perfect-binders")',
        },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string', description: 'English label' },
            de: { type: 'string', description: 'German label (optional)' },
            es: { type: 'string', description: 'Spanish label (optional)' },
          },
          required: ['en'],
          description: 'Multilingual label object',
        },
        internal_description: {
          type: 'string',
          description: 'Internal description (not public)',
        },
        parent_category_uid: {
          type: 'string',
          description: 'UID of parent category (optional)',
        },
        alt_parent_category_uid: {
          type: 'string',
          description: 'UID of alternative parent category (optional)',
        },
        position_rank: {
          type: 'number',
          description: 'Position rank for sorting (defaults to 0)',
        },
        alt_position_rank: {
          type: 'number',
          description: 'Alternative position rank for sorting (optional)',
        },
        isMetaCategory: {
          type: 'boolean',
          description: 'Whether this is a meta category (defaults to false)',
        },
      },
      required: ['name', 'label'],
    },
    handler: async (input: unknown) => {
      const validated = CreateCategoryInputSchema.parse(input);

      // Check if parent exists (if provided)
      if (validated.parent_category_uid) {
        const parent = await findEntityByUID<Category>(
          'categories',
          validated.parent_category_uid
        );
        if (!parent) {
          throw new Error(`Parent category with UID ${validated.parent_category_uid} not found`);
        }
      }

      // Check if alt parent exists (if provided)
      if (validated.alt_parent_category_uid) {
        const altParent = await findEntityByUID<Category>(
          'categories',
          validated.alt_parent_category_uid
        );
        if (!altParent) {
          throw new Error(`Alternative parent category with UID ${validated.alt_parent_category_uid} not found`);
        }
      }

      const now = new Date().toISOString();
      const category: Category = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('categories', category);
      return {
        content: [
          {
            type: 'text',
            text: `Category created successfully!\nUID: ${category.uid}\nName: ${category.name}\nLabel (EN): ${category.label.en}`,
          },
        ],
      };
    },
  },

  update_category: {
    description: 'Update an existing category',
    inputSchema: {
      type: 'object',
      properties: {
        uid: {
          type: 'string',
          description: 'UID of the category to update',
        },
        name: {
          type: 'string',
          description: 'New internal name',
        },
        label: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            de: { type: 'string' },
            es: { type: 'string' },
          },
          description: 'New multilingual label',
        },
        internal_description: {
          type: 'string',
          description: 'New internal description',
        },
        parent_category_uid: {
          type: 'string',
          description: 'New parent category UID',
        },
        alt_parent_category_uid: {
          type: 'string',
          description: 'New alternative parent category UID',
        },
        position_rank: {
          type: 'number',
          description: 'New position rank for sorting',
        },
        alt_position_rank: {
          type: 'number',
          description: 'New alternative position rank for sorting',
        },
        isMetaCategory: {
          type: 'boolean',
          description: 'Whether this is a meta category',
        },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateCategoryInputSchema.parse(input);

      const existing = await findEntityByUID<Category>('categories', validated.uid);
      if (!existing) {
        throw new Error(`Category with UID ${validated.uid} not found`);
      }

      // Check if parent exists (if provided)
      if (validated.parent_category_uid) {
        const parent = await findEntityByUID<Category>(
          'categories',
          validated.parent_category_uid
        );
        if (!parent) {
          throw new Error(`Parent category with UID ${validated.parent_category_uid} not found`);
        }
      }

      // Check if alt parent exists (if provided)
      if (validated.alt_parent_category_uid) {
        const altParent = await findEntityByUID<Category>(
          'categories',
          validated.alt_parent_category_uid
        );
        if (!altParent) {
          throw new Error(`Alternative parent category with UID ${validated.alt_parent_category_uid} not found`);
        }
      }

      const updated = await updateEntity('categories', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Category updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_category: {
    description: 'Delete a category (checks for dependencies)',
    inputSchema: {
      type: 'object',
      properties: {
        uid: {
          type: 'string',
          description: 'UID of the category to delete',
        },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      // Check if category has specification groups
      const specGroups = await findEntitiesByField('specification-groups', 'category_uid', uid);
      if (specGroups.length > 0) {
        throw new Error(
          `Cannot delete category: ${specGroups.length} specification group(s) depend on it`
        );
      }

      // Check if category has models
      const models = await findEntitiesByField('models', 'category_uid', uid);
      if (models.length > 0) {
        throw new Error(`Cannot delete category: ${models.length} model(s) depend on it`);
      }

      // Check if category has child categories
      const children = await findEntitiesByField('categories', 'parent_category_uid', uid);
      if (children.length > 0) {
        throw new Error(
          `Cannot delete category: ${children.length} child category/categories depend on it`
        );
      }

      const deleted = await deleteEntity('categories', uid);
      if (!deleted) {
        throw new Error(`Category with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Category deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_categories: {
    description: 'List all categories or filter by parent category',
    inputSchema: {
      type: 'object',
      properties: {
        parent_category_uid: {
          type: 'string',
          description: 'Filter by parent category UID (optional)',
        },
      },
    },
    handler: async (input: unknown) => {
      const { parent_category_uid } = z
        .object({ parent_category_uid: z.string().optional() })
        .parse(input);

      let categories = await readEntities<Category>('categories');

      if (parent_category_uid !== undefined) {
        categories = categories.filter(
          (c) => c.parent_category_uid === parent_category_uid
        );
      }

      const formatted = categories.map(
        (c) =>
          `- ${c.label.en} (${c.name})${c.isMetaCategory ? ' [META]' : ''}\n  UID: ${c.uid}\n  Position Rank: ${c.position_rank}${
            c.alt_position_rank !== undefined ? `\n  Alt Position Rank: ${c.alt_position_rank}` : ''
          }${
            c.parent_category_uid ? `\n  Parent: ${c.parent_category_uid}` : ''
          }${
            c.alt_parent_category_uid ? `\n  Alt Parent: ${c.alt_parent_category_uid}` : ''
          }`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${categories.length} categories:\n\n${formatted.join('\n\n')}`
                : 'No categories found',
          },
        ],
      };
    },
  },

  get_category: {
    description: 'Get a single category by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: {
          type: 'string',
          description: 'UID of the category',
        },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const category = await findEntityByUID<Category>('categories', uid);
      if (!category) {
        throw new Error(`Category with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(category, null, 2),
          },
        ],
      };
    },
  },
};
