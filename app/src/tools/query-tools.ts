import { z } from 'zod';
import {
  Category,
  SpecificationGroup,
  Specification,
  Model,
  Machine,
  MachineModelInstance,
  MachineSpecificationValue,
  SpecificationPreset,
} from 'schemas/index.js';
import { readEntities, findEntityByUID } from '../lib/storage.js';

export const queryTools = {
  get_category_tree: {
    description: 'Get full category hierarchy with specification groups and specifications',
    inputSchema: {
      type: 'object',
      properties: {
        category_uid: { type: 'string' },
      },
      required: ['category_uid'],
    },
    handler: async (input: unknown) => {
      const { category_uid } = z.object({ category_uid: z.string() }).parse(input);

      const category = await findEntityByUID<Category>('categories', category_uid);
      if (!category) {
        throw new Error(`Category with UID ${category_uid} not found`);
      }

      const specGroups = (await readEntities<SpecificationGroup>('specification-groups')).filter(
        (g) => g.category_uid === category_uid
      );

      const allSpecs = await readEntities<Specification>('specifications');

      const tree = {
        category,
        specification_groups: specGroups.map((group) => ({
          ...group,
          specifications: allSpecs.filter((s) => s.specification_group_uid === group.uid),
        })),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tree, null, 2),
          },
        ],
      };
    },
  },

  validate_machine: {
    description: 'Check if a machine is ready to publish (all required specs filled)',
    inputSchema: {
      type: 'object',
      properties: {
        machine_uid: { type: 'string' },
      },
      required: ['machine_uid'],
    },
    handler: async (input: unknown) => {
      const { machine_uid } = z.object({ machine_uid: z.string() }).parse(input);

      const machine = await findEntityByUID<Machine>('machines', machine_uid);
      if (!machine) {
        throw new Error(`Machine with UID ${machine_uid} not found`);
      }

      // Get primary model and its category
      const primaryModel = await findEntityByUID<Model>('models', machine.primary_model_uid);
      if (!primaryModel) {
        throw new Error(`Primary model not found`);
      }

      const category = await findEntityByUID<Category>('categories', primaryModel.category_uid);
      if (!category) {
        throw new Error(`Category not found`);
      }

      // Get all required specifications for this category
      const allSpecs = await readEntities<Specification>('specifications');
      const specGroups = (await readEntities<SpecificationGroup>('specification-groups')).filter(
        (g) => g.category_uid === category.uid
      );
      const specGroupUIDs = new Set(specGroups.map((g) => g.uid));
      const requiredSpecs = allSpecs.filter(
        (s) => s.required && specGroupUIDs.has(s.specification_group_uid)
      );

      // Get all model instances for this machine
      const instances = (await readEntities<MachineModelInstance>('machine-model-instances')).filter(
        (i) => i.machine_uid === machine_uid
      );

      // Get all specification values
      const allValues = await readEntities<MachineSpecificationValue>(
        'machine-specification-values'
      );
      const instanceUIDs = new Set(instances.map((i) => i.uid));
      const machineValues = allValues.filter((v) => instanceUIDs.has(v.machine_model_instance_uid));

      // Check for missing required specs
      const missingSpecs = [];
      for (const instance of instances) {
        for (const requiredSpec of requiredSpecs) {
          const hasValue = machineValues.some(
            (v) =>
              v.machine_model_instance_uid === instance.uid &&
              v.specification_uid === requiredSpec.uid
          );
          if (!hasValue) {
            missingSpecs.push({
              instance_uid: instance.uid,
              instance_label: instance.instance_label || `Position ${instance.position}`,
              specification_name: requiredSpec.name,
              specification_label: requiredSpec.label.en,
            });
          }
        }
      }

      const isValid = missingSpecs.length === 0;

      return {
        content: [
          {
            type: 'text',
            text: isValid
              ? `✓ Machine is ready to publish!\nAll ${requiredSpecs.length} required specifications are filled.`
              : `✗ Machine is NOT ready to publish.\nMissing ${missingSpecs.length} required specification(s):\n\n${missingSpecs
                  .map(
                    (m) =>
                      `- ${m.specification_label} (${m.specification_name})\n  Instance: ${m.instance_label}`
                  )
                  .join('\n\n')}`,
          },
        ],
      };
    },
  },

  search_entities: {
    description: 'Search across all entity types by name or label',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        entity_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: limit search to specific types',
        },
      },
      required: ['query'],
    },
    handler: async (input: unknown) => {
      const { query, entity_types } = z
        .object({
          query: z.string(),
          entity_types: z.array(z.string()).optional(),
        })
        .parse(input);

      const searchTerm = query.toLowerCase();
      const results: any[] = [];

      const typesToSearch = entity_types || [
        'categories',
        'specification-groups',
        'specifications',
        'models',
        'machines',
      ];

      for (const entityType of typesToSearch) {
        try {
          const entities = await readEntities(entityType as any);
          const matches = entities.filter((e: any) => {
            const nameMatch = e.name?.toLowerCase().includes(searchTerm);
            const labelMatch =
              e.label?.en?.toLowerCase().includes(searchTerm) ||
              e.label?.de?.toLowerCase().includes(searchTerm) ||
              e.label?.es?.toLowerCase().includes(searchTerm);
            return nameMatch || labelMatch;
          });

          results.push(
            ...matches.map((m: any) => ({
              type: entityType,
              uid: m.uid,
              name: m.name,
              label: m.label?.en || m.name,
            }))
          );
        } catch (error) {
          // Skip if entity type doesn't exist
        }
      }

      return {
        content: [
          {
            type: 'text',
            text:
              results.length > 0
                ? `Found ${results.length} results:\n\n${results
                    .map((r) => `- [${r.type}] ${r.label} (${r.name})\n  UID: ${r.uid}`)
                    .join('\n\n')}`
                : `No results found for "${query}"`,
          },
        ],
      };
    },
  },

  get_relationships: {
    description: 'Get all entities related to a specific UID',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
      },
      required: ['uid'],
    },
    handler: async (input: unknown) => {
      const { uid } = z.object({ uid: z.string() }).parse(input);

      const relationships: any = {
        entity_uid: uid,
        related: {},
      };

      // Try to find the entity in each collection
      const category = await findEntityByUID<Category>('categories', uid);
      if (category) {
        relationships.entity_type = 'category';
        relationships.entity = category;

        // Find related spec groups
        const specGroups = (await readEntities<SpecificationGroup>('specification-groups')).filter(
          (g) => g.category_uid === uid
        );
        relationships.related.specification_groups = specGroups;

        // Find related models
        const models = (await readEntities<Model>('models')).filter((m) => m.category_uid === uid);
        relationships.related.models = models;

        return {
          content: [{ type: 'text', text: JSON.stringify(relationships, null, 2) }],
        };
      }

      const model = await findEntityByUID<Model>('models', uid);
      if (model) {
        relationships.entity_type = 'model';
        relationships.entity = model;

        // Find presets
        const presets = (await readEntities<SpecificationPreset>('specification-presets')).filter(
          (p) => p.preset_target_uid === uid && p.preset_level === 'model'
        );
        relationships.related.presets = presets;

        // Find machines using this model
        const machines = (await readEntities<Machine>('machines')).filter(
          (m) => m.primary_model_uid === uid
        );
        relationships.related.machines = machines;

        return {
          content: [{ type: 'text', text: JSON.stringify(relationships, null, 2) }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `No entity found with UID: ${uid}`,
          },
        ],
      };
    },
  },
};
