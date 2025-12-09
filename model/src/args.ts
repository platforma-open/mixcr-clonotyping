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

const BlockArgsValidBase = z.object({
  input: PlRef,
  inputLibrary: PlRef.optional(),
  libraryFile: z.string().transform((v) => v as ImportFileHandle).optional(),
  isLibraryFileGzipped: z.boolean().optional(),
  preset: Preset,
  species: z.string().optional(),
  customSpecies: z.string().optional(),
  materialType: z.string().optional(),
  leftAlignmentMode: z.string().optional(),
  rightAlignmentMode: z.string().optional(),
  tagPattern: z.string().optional(),
  assembleClonesBy: z.string().optional(),
  limitInput: z.number().int().optional(),
  perProcessMemGB: z.number().int().gte(1, '1GB or more required').optional(),
  perProcessCPUs: z.number().int().gte(1, '1 or more required').optional(),
  highDiversityLibrary: z.boolean().optional(),
  title: z.string().optional(),
  presetCommonName: z.string().optional(),
  isGenericPreset: z.boolean().optional(),
  chains: z.array(z.string()).optional(),
});

export const BlockArgsValid = BlockArgsValidBase.superRefine(
  (data, ctx) => {
    // If preset is a file (custom preset), chains must be provided and non-empty
    if (data.preset.type === 'file') {
      if (data.chains === undefined || data.chains.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Chains selection is required when using a custom preset file',
          path: ['chains'],
        });
      }
    }
  },
);
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValidBase.partial({ input: true, preset: true });
export type BlockArgs = z.infer<typeof BlockArgs>;
