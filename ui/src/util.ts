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

/** ———————————————————————————————————————— */
/** Small utilities */

const td = new TextDecoder('utf-8');

function readYamlScalar(raw: string): string {
  // grab everything after the first ":", trim, and strip simple quotes
  const val = raw.split(':', 2)[1]?.trim() ?? '';
  return val.replace(/^['"]|['"]$/g, '');
}

function splitLines(s: string): string[] {
  return s.replace(/\r\n?/g, '\n').split('\n');
}

/** Minimal YAML reader: only understands
 *  mixins:
 *    - type: ...
 *      species: ...
 */
function parsePresetYaml(yaml: string): PresetFileContent {
  const out: PresetFileContent = {};
  const lines = splitLines(yaml);

  // Find start of `mixins:` block.
  const start = lines.findIndex((l) => l.trim() === 'mixins:');
  if (start === -1) return out;

  const mixins: Array<{ type: string; species?: string }> = [];

  // Consume following indented list items beginning with "-".
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // skip empties

    // Stop if we left the `mixins:` indentation (new top-level key)
    if (!/^\s/.test(line)) break;

    if (/^\s*-\s*/.test(line)) {
      // Start a new mixin; it might be " - type: X" on the same line
      const sameLine = line.replace(/^\s*-\s*/, '');
      const current: { type: string; species?: string } = { type: '' };

      if (/^\s*type\s*:/.test(sameLine)) current.type = readYamlScalar(sameLine);

      // Read subsequent indented property lines (type/species)
      for (i = i + 1; i < lines.length; i++) {
        const next = lines[i];
        if (!/^\s{2,}\S/.test(next)) { // out of this list item's body
          i -= 1; // step back so outer loop processes this line
          break;
        }
        const t = next.trim();
        if (t.startsWith('type:')) current.type = readYamlScalar(t);
        else if (t.startsWith('species:')) current.species = readYamlScalar(t);
      }

      if (current.type) mixins.push(current);
      continue;
    }
  }

  if (mixins.length) out.mixins = mixins;
  return out;
}

/** ———————————————————————————————————————— */
/** File readers / extractors */

async function getFileText(file: LocalImportFileHandle): Promise<string | undefined> {
  try {
    const data = await getRawPlatformaInstance().lsDriver.getLocalFileContent(file);
    return td.decode(data);
  } catch (err) {
    console.warn('Failed to read local file content:', err);
    return undefined;
  }
}

/**
 * Reads and parses a preset file to extract content (focused on mixins)
 */
export async function readPresetFile(
  file: LocalImportFileHandle,
): Promise<PresetFileContent | undefined> {
  const text = await getFileText(file);
  return text ? parsePresetYaml(text) : undefined;
}

/**
 * Reads preset content from a generic ImportFileHandle.
 * Supports only upload:// handles (UI-local).
 */
export async function readPresetFromHandle(
  fileHandle: ImportFileHandle,
): Promise<PresetFileContent | undefined> {
  if (typeof fileHandle !== 'string') return undefined;
  if (!fileHandle.startsWith('upload://')) return undefined;
  return readPresetFile(fileHandle as LocalImportFileHandle);
}

/** Extract species from already-parsed content */
export function extractSpeciesFromPreset(
  preset: PresetFileContent | undefined,
): string | undefined {
  return preset?.mixins?.find((m) => m.type === 'SetSpecies')?.species;
}

/** Extract species directly from a file handle */
export async function extractSpeciesFromPresetFile(
  fileHandle: ImportFileHandle,
): Promise<string | undefined> {
  const content = await readPresetFromHandle(fileHandle);
  return extractSpeciesFromPreset(content);
}
