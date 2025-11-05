import { z } from 'zod';

const MiXCRStage = z.union([
  z.literal('mitool-parse'),
  z.literal('mitool-refine-tags'),
  z.literal('mitool-consensus'),
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
  z.literal('findShmTrees'),
]);
type MiXCRStage = z.infer<typeof MiXCRStage>;

const SupportedMiXCRFlags = z.union([
  z.literal('species'),
  z.literal('materialType'),
  z.literal('leftAlignmentMode'),
  z.literal('rightAlignmentMode'),
  z.literal('tagPattern'),
  z.literal('assembleClonesBy'),
]);
type SupportedMiXCRFlags = z.infer<typeof SupportedMiXCRFlags>;

const SupportedPresetOverview = z.object({
  vendor: z.string().nullable(),
  label: z.string(),
  presetName: z.string(),
  requiredFlags: z.array(SupportedMiXCRFlags),
  analysisStages: z.array(MiXCRStage),
  reportTypes: z.array(MiXCRStage),
});
type SupportedPresetOverview = z.infer<typeof SupportedPresetOverview>;

export const SupportedPresetList = z.array(z.unknown()).transform((presets) =>
  presets
    .map((p) => SupportedPresetOverview.safeParse(p))
    .filter((p) => p.success)
    .map((p) => p.data),
);
export type SupportedPresetList = z.infer<typeof SupportedPresetList>;
