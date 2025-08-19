import { getRawPlatformaInstance, type LocalImportFileHandle, type ImportFileHandle } from '@platforma-sdk/model';

type Entries<T> = {
  [K in keyof T]: [K, Required<T[K]>];
}[keyof T][];

export function typeSafeEntries<T extends Record<string, T> | ArrayLike<T>>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

export interface PresetFileContent {
  mixins?: Array<{ type: string; species?: string }>;
  [key: string]: unknown;
}

/**
 * Reads and parses a preset file to extract species information
 * @param file - The LocalImportFileHandle to read
 * @returns Promise<PresetFileContent | undefined>
 */
export async function readPresetFile(file: LocalImportFileHandle): Promise<PresetFileContent | undefined> {
  try {
    // Read file content using Platforma SDK
    const data = await getRawPlatformaInstance().lsDriver.getLocalFileContent(file);

    // Convert ArrayBuffer to string
    const content = new TextDecoder('utf-8').decode(data);

    // Simple YAML parsing for mixins section
    return parsePresetYaml(content);
  } catch (error) {
    console.warn('Failed to read preset file:', error);
    return undefined;
  }
}

/**
 * Reads preset content from a generic ImportFileHandle
 * Only local (index://) handles are supported in UI
 */
export async function readPresetFromHandle(
  fileHandle: ImportFileHandle,
): Promise<PresetFileContent | undefined> {
  try {
    if (typeof fileHandle === 'string' && fileHandle.startsWith('upload://')) {
      return await readPresetFile(fileHandle as LocalImportFileHandle);
    }
    return undefined;
  } catch (error) {
    console.warn('Failed to read preset from handle:', error);
    return undefined;
  }
}

/**
 * Extracts species from preset file content
 * @param presetContent - Parsed preset content
 * @returns Species string or undefined
 */
export function extractSpeciesFromPreset(presetContent: PresetFileContent | undefined): string | undefined {
  if (!presetContent?.mixins) return undefined;

  const setSpeciesMixin = presetContent.mixins.find(
    (mixin) => mixin.type === 'SetSpecies',
  );

  return setSpeciesMixin?.species;
}

/**
 * Extracts species from preset file handle (async)
 * @param fileHandle - ImportFileHandle to read
 * @returns Promise<string | undefined>
 */
export async function extractSpeciesFromPresetFile(fileHandle: ImportFileHandle): Promise<string | undefined> {
  try {
    const content = await readPresetFromHandle(fileHandle);
    return extractSpeciesFromPreset(content);
  } catch {
    return undefined;
  }
}

/**
 * Simple YAML parser for preset files (focused on mixins section)
 * @param yamlContent - YAML content as string
 * @returns Parsed preset content
 */
function parsePresetYaml(yamlContent: string): PresetFileContent {
  const result: PresetFileContent = {};
  const lines = yamlContent.split('\n');

  let currentSection: string | null = null;
  const mixins: Array<{ type: string; species?: string }> = [];
  let currentMixin: { type: string; species?: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for top-level sections
    if (trimmed === 'mixins:') {
      currentSection = 'mixins';
      continue;
    }

    // Handle mixins section
    if (currentSection === 'mixins') {
      // Check for list item (starts with -)
      if (trimmed.startsWith('- ')) {
        // Save previous mixin if exists
        if (currentMixin) {
          mixins.push(currentMixin);
        }

        // Start new mixin
        const content = trimmed.substring(2).trim();
        if (content.startsWith('type:')) {
          const type = content.split(':')[1]?.trim();
          currentMixin = { type: type || '' };
        }
      } else if (currentMixin && trimmed.includes(':')) {
        // Handle mixin properties
        const [key, value] = trimmed.split(':').map((s) => s.trim());
        if (key === 'type') {
          currentMixin.type = value;
        } else if (key === 'species') {
          currentMixin.species = value;
        }
      } else if (!trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
        // End of mixins section
        if (currentMixin) {
          mixins.push(currentMixin);
          currentMixin = null;
        }
        currentSection = null;
      }
    }
  }

  // Add final mixin if exists
  if (currentMixin) {
    mixins.push(currentMixin);
  }

  if (mixins.length > 0) {
    result.mixins = mixins;
  }

  return result;
}
