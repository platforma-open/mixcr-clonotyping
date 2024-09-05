import { z } from 'zod';

export const MiXCRStage = z.union([
  z.literal('parse'),
  z.literal('refineTags'),
  z.literal('consensus'),
  z.literal('align'),
  z.literal('refineTagsAndSort'),
  z.literal('exportAlignments'),
  z.literal('assemblePartial'),
  z.literal('extend'),
  z.literal('assemble'),
  z.literal('assembleContigs'),
  z.literal('assembleCells'),
  z.literal('exportClones'),
  z.literal('exportCloneGroups'),
  z.literal('qc'),
  z.literal('findAlleles'),
  z.literal('findShmTrees')
]);
export type MiXCRStage = z.infer<typeof MiXCRStage>;

export const SupportedMiXCRFlags = z.literal('species');
export type SupportedMiXCRFlags = z.infer<typeof SupportedMiXCRFlags>;

export const SupportedPresetOverview = z.object({
  vendor: z.string().nullable(),
  label: z.string(),
  presetName: z.string(),
  requiredFlags: z.array(SupportedMiXCRFlags),
  analysisStages: z.array(MiXCRStage),
  reportTypes: z.array(MiXCRStage)
});
export type SupportedPresetOverview = z.infer<typeof SupportedPresetOverview>;

export const SupportedPresetList = z.array(z.unknown()).transform((presets) =>
  presets
    .map((p) => SupportedPresetOverview.safeParse(p))
    .filter((p) => p.success)
    .map((p) => p.data!)
);
export type SupportedPresetList = z.infer<typeof SupportedPresetList>;
