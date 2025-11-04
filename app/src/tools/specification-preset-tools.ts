import { z } from 'zod';
import {
  SpecificationPreset,
  Specification,
  Category,
  Model,
  CreateSpecificationPresetInputSchema,
  UpdateSpecificationPresetInputSchema,
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

export const specificationPresetTools = {
  create_specification_preset: {
    description:
      'Create a specification preset at category or model level. Defines allowed values/constraints.',
    inputSchema: {
      type: 'object',
      properties: {
        preset_level: {
          type: 'string',
          enum: ['category', 'model'],
        },
        preset_target_uid: {
          type: 'string',
          description: 'UID of category or model (depending on preset_level)',
        },
        specification_uid: { type: 'string' },
        allowed_values: {
          type: 'object',
          description: 'Structure varies by specification type',
        },
      },
      required: ['preset_level', 'preset_target_uid', 'specification_uid', 'allowed_values'],
    },
    handler: async (input: unknown) => {
      const validated = CreateSpecificationPresetInputSchema.parse(input);

      // Verify specification exists
      const spec = await findEntityByUID<Specification>(
        'specifications',
        validated.specification_uid
      );
      if (!spec) {
        throw new Error(`Specification with UID ${validated.specification_uid} not found`);
      }

      // Verify target exists (category or model)
      if (validated.preset_level === 'category') {
        const category = await findEntityByUID<Category>(
          'categories',
          validated.preset_target_uid
        );
        if (!category) {
          throw new Error(`Category with UID ${validated.preset_target_uid} not found`);
        }
      } else {
        const model = await findEntityByUID<Model>('models', validated.preset_target_uid);
        if (!model) {
          throw new Error(`Model with UID ${validated.preset_target_uid} not found`);
        }
      }

      // Check for duplicate (unique constraint)
      const existing = await readEntities<SpecificationPreset>('specification-presets');
      const duplicate = existing.find(
        (p) =>
          p.preset_level === validated.preset_level &&
          p.preset_target_uid === validated.preset_target_uid &&
          p.specification_uid === validated.specification_uid
      );
      if (duplicate) {
        throw new Error(
          `A preset already exists for this specification at this ${validated.preset_level} level`
        );
      }

      const now = new Date().toISOString();
      const preset: SpecificationPreset = {
        uid: generateUID(),
        ...validated,
        created_at: now,
        updated_at: now,
      };

      await createEntity('specification-presets', preset);
      return {
        content: [
          {
            type: 'text',
            text: `Specification Preset created successfully!\nUID: ${preset.uid}\nLevel: ${preset.preset_level}\nSpecification: ${spec.name}`,
          },
        ],
      };
    },
  },

  update_specification_preset: {
    description: 'Update an existing specification preset',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        preset_level: {
          type: 'string',
          enum: ['category', 'model'],
        },
        preset_target_uid: { type: 'string' },
        specification_uid: { type: 'string' },
        allowed_values: { type: 'object' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const validated = UpdateSpecificationPresetInputSchema.parse(input);

      const existing = await findEntityByUID<SpecificationPreset>(
        'specification-presets',
        validated.uid
      );
      if (!existing) {
        throw new Error(`Specification Preset with UID ${validated.uid} not found`);
      }

      const updated = await updateEntity('specification-presets', validated.uid, {
        ...validated,
        updated_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: `Specification Preset updated successfully!\nUID: ${updated?.uid}`,
          },
        ],
      };
    },
  },

  delete_specification_preset: {
    description: 'Delete a specification preset',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const deleted = await deleteEntity('specification-presets', uid);
      if (!deleted) {
        throw new Error(`Specification Preset with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Specification Preset deleted successfully (UID: ${uid})`,
          },
        ],
      };
    },
  },

  list_specification_presets: {
    description: 'List specification presets, optionally filtered',
    inputSchema: {
      type: 'object',
      properties: {
        preset_level: {
          type: 'string',
          enum: ['category', 'model'],
        },
        preset_target_uid: { type: 'string' },
        specification_uid: { type: 'string' },
      },
    },
    handler: async (input: unknown) => {
      const { preset_level, preset_target_uid, specification_uid } = z
        .object({
          preset_level: z.enum(['category', 'model']).optional(),
          preset_target_uid: z.string().optional(),
          specification_uid: z.string().optional(),
        })
        .parse(input);

      let presets = await readEntities<SpecificationPreset>('specification-presets');

      if (preset_level) {
        presets = presets.filter((p) => p.preset_level === preset_level);
      }
      if (preset_target_uid) {
        presets = presets.filter((p) => p.preset_target_uid === preset_target_uid);
      }
      if (specification_uid) {
        presets = presets.filter((p) => p.specification_uid === specification_uid);
      }

      const formatted = presets.map(
        (p) =>
          `- Preset UID: ${p.uid}\n  Level: ${p.preset_level}\n  Target: ${p.preset_target_uid}\n  Specification: ${p.specification_uid}`
      );

      return {
        content: [
          {
            type: 'text',
            text:
              formatted.length > 0
                ? `Found ${presets.length} specification presets:\n\n${formatted.join('\n\n')}`
                : 'No specification presets found',
          },
        ],
      };
    },
  },

  get_specification_preset: {
    description: 'Get a single specification preset by UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const preset = await findEntityByUID<SpecificationPreset>('specification-presets', uid);
      if (!preset) {
        throw new Error(`Specification Preset with UID ${uid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(preset, null, 2),
          },
        ],
      };
    },
  },
};
