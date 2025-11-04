import { z } from 'zod';
import {
  Model,
  Category,
  CreateModelInputSchema,
  UpdateModelInputSchema,
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

export const modelTools = {
  create_model: {
    description: 'Create a new machine model within a category',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        category_uid: { type: 'string' },
        manufacturer_uid: { type: 'string' },
      },
      required: ['name', 'category_uid'],
    },
    handler: async (input: unknown) => {
      const validated = CreateModelInputSchema.parse(input);

      const category = await findEntityByUID<Category>('categories', validated.category_uid);
      if (!category) {
        throw new Error(`Category with UID ${validated.category_uid} not found`);
      }

      const now = new Date().toISOString();
      const model: Model = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('models', model);
      return {
        content: [
          {
            type: 'text',
            text: `Model created successfully!\nUID: ${model.uid}\nName: ${model.name}\nCategory: ${category.name}`,
          },
        ],
      };
    },
  },

  update_model: {
    description: 'Update an existing model',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        name: { type: 'string' },
        category_uid: { type: 'string' },
        manufacturer_uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateModelInputSchema.parse(input);

      const existing = await findEntityByUID<Model>('models', validated.uid);
      if (!existing) {
        throw new Error(`Model with UID ${validated.uid} not found`);
      }

      if (validated.category_uid) {
        const category = await findEntityByUID<Category>('categories', validated.category_uid);
        if (!category) {
          throw new Error(`Category with UID ${validated.category_uid} not found`);
        }
      }

      const updated = await updateEntity('models', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Model updated successfully!\nUID: ${updated?.uid}\nName: ${updated?.name}`,
          },
        ],
      };
    },
  },

  delete_model: {
    description: 'Delete a model (checks for dependencies)',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      // Check if model has presets
      const presets = await findEntitiesByField('specification-presets', 'preset_target_uid', uid);
      if (presets.length > 0) {
        throw new Error(`Cannot delete model: ${presets.length} preset(s) depend on it`);
      }

      // Check if model is used in machines
      const machines = await findEntitiesByField('machines', 'primary_model_uid', uid);
      if (machines.length > 0) {
        throw new Error(
          `Cannot delete model: ${machines.length} machine(s) use it as primary model`
        );
      }

      // Check if model is used in machine model instances
      const instances = await findEntitiesByField('machine-model-instances', 'model_uid', uid);
      if (instances.length > 0) {
        throw new Error(
          `Cannot delete model: ${instances.length} machine model instance(s) depend on it`
        );
      }

      const deleted = await deleteEntity('models', uid);
      if (!deleted) {
        throw new Error(`Model with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Model deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_models: {
    description: 'List all models or filter by category',
    inputSchema: {
      type: 'object',
      properties: {
        category_uid: { type: 'string' },
      },
    },
    handler: async (input: unknown) => {
      const { category_uid } = z.object({ category_uid: z.string().optional() }).parse(input);

      let models = await readEntities<Model>('models');

      if (category_uid) {
        models = models.filter((m) => m.category_uid === category_uid);
      }

      const formatted = models.map(
        (m) => `- ${m.name}\n  UID: ${m.uid}\n  Category: ${m.category_uid}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${models.length} models:\n\n${formatted.join('\n\n')}`
                : 'No models found',
          },
        ],
      };
    },
  },

  get_model: {
    description: 'Get a single model by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const model = await findEntityByUID<Model>('models', uid);
      if (!model) {
        throw new Error(`Model with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(model, null, 2),
          },
        ],
      };
    },
  },
};
