import type { ImportFileHandle } from '@platforma-sdk/model';
import { PlRef } from '@platforma-sdk/model';
import { z } from 'zod';

// @TODO (unused)
const _Species = z.union([
  z.literal('hsa'),
  z.literal('mmu'),
  z.literal('lama'),
  z.literal('alpaca'),
  z.literal('mfas'),
]);

export const PresetName = z.object({
  type: z.literal('name'),
  name: z.string(),
});
export type PresetName = z.infer<typeof PresetName>;

export const PresetFile = z.object({
  type: z.literal('file'),
  file: z.string().transform((v) => v as ImportFileHandle),
});
export type PresetFile = z.infer<typeof PresetFile>;

export const Preset = z.discriminatedUnion('type', [PresetName, PresetFile]);
export type Preset = z.infer<typeof Preset>;

export const BlockArgsValid = z.object({
  input: PlRef,
  inputLibrary: PlRef.optional(),
  libraryFile: z.string().transform((v) => v as ImportFileHandle).optional(),
  preset: Preset,
  species: z.string().optional(),
  customSpecies: z.string().optional(),
  limitInput: z.number().int().optional(),
  title: z.string().optional(),
  presetCommonName: z.string().optional(),
});
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValid.partial({ input: true, preset: true });
export type BlockArgs = z.infer<typeof BlockArgs>;
