import type { ImportFileHandle } from "@platforma-sdk/model";
import { PlRef } from "@platforma-sdk/model";
import { z } from "zod";

export const PresetName = z.object({
  type: z.literal("name"),
  name: z.string(),
});
export type PresetName = z.infer<typeof PresetName>;

export const PresetFile = z.object({
  type: z.literal("file"),
  file: z.string().transform((v) => v as ImportFileHandle),
});
export type PresetFile = z.infer<typeof PresetFile>;

export const Preset = z.discriminatedUnion("type", [PresetName, PresetFile]);
export type Preset = z.infer<typeof Preset>;

export const StopCodonType = z.enum(["amber", "ochre", "opal"]);
export type StopCodonType = z.infer<typeof StopCodonType>;

export const StopCodonReplacements = z
  .object({
    amber: z.string().optional(),
    ochre: z.string().optional(),
    opal: z.string().optional(),
  })
  .optional();

/** Per-step replacement of the workflow's sizing rule; an unset field keeps the rule's value. */
export const StepResourceOverride = z
  .object({
    memFloor: z.number().int().gte(1).optional(),
    memIntercept: z.number().int().gte(0).optional(),
    memSlope: z.number().gte(0).optional(),
    cap: z.number().int().gte(1).optional(),
    cpuIntercept: z.number().int().gte(1).optional(),
    cpuSlope: z.number().gte(0).optional(),
  })
  .refine((o) => o.cap === undefined || o.memFloor === undefined || o.cap >= o.memFloor, {
    message: "Cap must be at least the memory floor",
  });
export type StepResourceOverride = z.infer<typeof StepResourceOverride>;

/** Keyed by step: the MiXCR command, or `mitool-<command>`. */
export const StepResources = z.record(z.string(), StepResourceOverride);
export type StepResources = z.infer<typeof StepResources>;

const BlockArgsValidBase = z.object({
  defaultBlockLabel: z.string().optional(),
  customBlockLabel: z.string().optional(),
  input: PlRef,
  inputLibrary: PlRef.optional(),
  libraryFile: z
    .string()
    .transform((v) => v as ImportFileHandle)
    .optional(),
  isLibraryFileGzipped: z.boolean().optional(),
  preset: Preset,
  species: z.string().optional(),
  customSpecies: z.string().optional(),
  materialType: z.string().optional(),
  leftAlignmentMode: z.string().optional(),
  rightAlignmentMode: z.string().optional(),
  tagPattern: z.string().optional(),
  assembleClonesBy: z.string().optional(),
  imputeGermline: z.boolean().optional(),
  limitInput: z.number().int().optional(),
  perProcessMemGB: z.number().int().gte(1, "1GB or more required").optional(),
  perProcessCPUs: z.number().int().gte(1, "1 or more required").optional(),
  stepResources: StepResources.optional(),
  cloneClusteringMode: z.enum(["relaxed", "default", "off"]).optional(),
  title: z.string().optional(),
  presetCommonName: z.string().optional(),
  isGenericPreset: z.boolean().optional(),
  chains: z.array(z.string()).optional(),
  // When true, single-cell IG data is treated as heavy-chain-only (VHH / nanobody):
  // the light chain is not computed and clonotypes are not required to be paired.
  scHeavyOnly: z.boolean().optional(),
  exportMinQuality: z.boolean().optional(),
  stopCodonTypes: z.array(StopCodonType).optional(),
  stopCodonReplacements: StopCodonReplacements,
});

export const BlockArgsValid = BlockArgsValidBase;
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValidBase.partial({
  input: true,
  preset: true,
  defaultBlockLabel: true,
  customBlockLabel: true,
});
export type BlockArgs = z.infer<typeof BlockArgs>;
