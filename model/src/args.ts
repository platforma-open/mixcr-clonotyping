import { ImportFileHandle, Ref, ValueType } from '@platforma-sdk/model';
import { ZodAnyDef, ZodSchema, z } from 'zod';
import { PlId } from './helpers';

const Species = z.union([
  z.literal('hsa'),
  z.literal('mmu'),
  z.literal('lama'),
  z.literal('alpaca'),
  z.literal('mfas')
]);

export const PresetName = z.object({
  type: z.literal('name'),
  name: z.string()
});
export type PresetName = z.infer<typeof PresetName>;

export const PresetFile = z.object({
  type: z.literal('file'),
  file: z.string().transform((v) => v as ImportFileHandle)
});
export type PresetFile = z.infer<typeof PresetFile>;

export const Preset = z.discriminatedUnion('type', [PresetName, PresetFile]);
export type Preset = z.infer<typeof Preset>;

export const BlockArgsValid = z
  .object({
    input: Ref,
    preset: Preset,
    species: z.string().optional(),
    limitInput: z.number().int().optional(),
    title: z.string().optional(),
    presetCommonName: z.string().optional()
  })
  .strict();
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValid.partial({ input: true, preset: true });
export type BlockArgs = z.infer<typeof BlockArgs>;
