import type { ImportFileHandleIndex, PlRef } from "@platforma-sdk/model";

/** MiXCR preset — either a named built-in or a preset file. */
export type Preset = { type: "name"; name: string } | { type: "file"; file: ImportFileHandleIndex };

export type StopCodonType = "amber" | "ochre" | "opal";

export type StopCodonReplacements = {
  amber?: string;
  ochre?: string;
  opal?: string;
};

export type CloneClusteringMode = "relaxed" | "default" | "off";

/** Preview runs a read-limited pass; full runs the whole dataset. */
export type RunMode = "dry" | "full";

/**
 * This block's init-params contract — the shape a block of this kind receives
 * at creation, and exactly what a project template serializes for it.
 *
 * Every field is optional. A block with no input picked and no preset chosen is
 * an ordinary state the UI reaches, so export has to be able to write it and
 * apply has to be able to take it back; a contract that demanded `input` would
 * make export and apply stop being inverses. Whether a configuration is
 * runnable is settled by the model's `args` lambda, not here.
 *
 * File-valued fields are narrowed to `index://` handles. An `upload://` handle
 * names an import local to one machine, so it cannot survive being written to a
 * template and applied elsewhere; the projection drops those rather than
 * writing a reference that resolves nowhere.
 */
export type BlockParams = {
  // Input wiring — PlRefs a template engine fills from an earlier entry's output.
  input?: PlRef;
  inputLibrary?: PlRef;
  libraryFile?: ImportFileHandleIndex;
  isLibraryFileGzipped?: boolean;

  // Analysis configuration — the recipe a template exists to reproduce.
  preset?: Preset;
  presetCommonName?: string;
  isGenericPreset?: boolean;
  species?: string;
  customSpecies?: string;
  materialType?: string;
  leftAlignmentMode?: string;
  rightAlignmentMode?: string;
  tagPattern?: string;
  assembleClonesBy?: string;
  imputeGermline?: boolean;
  chains?: string[];
  scHeavyOnly?: boolean;
  cloneClusteringMode?: CloneClusteringMode;
  exportMinQuality?: boolean;
  stopCodonTypes?: StopCodonType[];
  stopCodonReplacements?: StopCodonReplacements;

  // Run mode and per-process resource limits.
  runMode?: RunMode;
  limitInput?: number;
  perProcessMemGB?: number;
  perProcessCPUs?: number;

  // Display naming.
  defaultBlockLabel?: string;
  customBlockLabel?: string;
  title?: string;
};
