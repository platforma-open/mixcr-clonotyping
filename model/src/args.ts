import type { ImportFileHandle } from '@platforma-sdk/model';
import { PlRef } from '@platforma-sdk/model';
import { z } from 'zod';

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
  isLibraryFileGzipped: z.boolean().optional(),
  preset: Preset,
  species: z.string().optional(),
  customSpecies: z.string().optional(),
  materialType: z.enum(['RNA', 'DNA']).optional(),
  leftAlignmentMode: z.enum(['floating-left-alignment-boundary', 'rigid-left-alignment-boundary']).optional(),
  rightAlignmentMode: z.enum(['floating-right-alignment-boundary', 'rigid-right-alignment-boundary']).optional(),
  tagPattern: z.string().optional(),
  assembleClonesBy: z.enum(['CDR3', 'VDJRegion']).optional(),
  limitInput: z.number().int().optional(),
  perProcessMemGB: z.number().int().gte(1, '1GB or more required').optional(),
  perProcessCPUs: z.number().int().gte(1, '1 or more required').optional(),
  title: z.string().optional(),
  presetCommonName: z.string().optional(),
  chains: z.array(z.string()).optional(),
});
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValid.partial({ input: true, preset: true });
export type BlockArgs = z.infer<typeof BlockArgs>;
