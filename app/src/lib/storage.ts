import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get data directory path (./data at project root)
const DATA_DIR = join(__dirname, '..', '..', '..', 'data');

export type EntityType =
  | 'categories'
  | 'specification-groups'
  | 'specifications'
  | 'enum-options'
  | 'models'
  | 'specification-presets'
  | 'machines'
  | 'machine-model-instances'
  | 'machine-specification-values';

// Initialize data directory and files
export async function initializeStorage(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  const entityTypes: EntityType[] = [
    'categories',
    'specification-groups',
    'specifications',
    'enum-options',
    'models',
    'specification-presets',
    'machines',
    'machine-model-instances',
    'machine-specification-values',
  ];

  for (const entityType of entityTypes) {
    const filePath = getFilePath(entityType);
    if (!existsSync(filePath)) {
      await writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }
}

function getFilePath(entityType: EntityType): string {
  return join(DATA_DIR, `${entityType}.json`);
}

export async function readEntities<T>(entityType: EntityType): Promise<T[]> {
  try {
    const filePath = getFilePath(entityType);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

export async function writeEntities<T>(
  entityType: EntityType,
  entities: T[]
): Promise<void> {
  const filePath = getFilePath(entityType);
  await writeFile(filePath, JSON.stringify(entities, null, 2), 'utf-8');
}

export async function findEntityByUID<T extends { uid: string }>(
  entityType: EntityType,
  uid: string
): Promise<T | undefined> {
  const entities = await readEntities<T>(entityType);
  return entities.find((e) => e.uid === uid);
}

export async function createEntity<T extends { uid: string }>(
  entityType: EntityType,
  entity: T
): Promise<T> {
  const entities = await readEntities<T>(entityType);
  entities.push(entity);
  await writeEntities(entityType, entities);
  return entity;
}

export async function updateEntity<T extends { uid: string }>(
  entityType: EntityType,
  uid: string,
  updates: Partial<T>
): Promise<T | undefined> {
  const entities = await readEntities<T>(entityType);
  const index = entities.findIndex((e) => e.uid === uid);

  if (index === -1) {
    return undefined;
  }

  entities[index] = { ...entities[index], ...updates };
  await writeEntities(entityType, entities);
  return entities[index];
}

export async function deleteEntity<T extends { uid: string }>(
  entityType: EntityType,
  uid: string
): Promise<boolean> {
  const entities = await readEntities<T>(entityType);
  const filteredEntities = entities.filter((e) => e.uid !== uid);

  if (filteredEntities.length === entities.length) {
    return false; // Entity not found
  }

  await writeEntities(entityType, filteredEntities);
  return true;
}

export async function findEntitiesByField<T>(
  entityType: EntityType,
  field: string,
  value: any
): Promise<T[]> {
  const entities = await readEntities<T>(entityType);
  return entities.filter((e: any) => e[field] === value);
}
