<script setup lang="ts">
import type {
  Preset,
  StopCodonType,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { SupportedPresetList } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import type { ImportFileHandle, PlRef } from "@platforma-sdk/model";
import { getFilePathFromHandle } from "@platforma-sdk/model";
import type { ListOption } from "@platforma-sdk/ui-vue";
import {
  PlAccordionSection,
  PlAlert,
  PlBtnGroup,
  PlCheckbox,
  PlDropdown,
  PlDropdownMulti,
  PlDropdownRef,
  PlFileInput,
  PlNumberField,
  PlSectionSeparator,
  PlTextField,
  PlTooltip,
  ReactiveFileContent,
} from "@platforma-sdk/ui-vue";
import { computed, reactive, watch } from "vue";
import { useApp } from "./app";
import { retentive } from "./retentive";

const app = useApp();

const reactiveFileContent = ReactiveFileContent.useGlobal();

const data = reactive<{ presetType: Preset["type"] }>({
  presetType: app.model.data.preset?.type ?? "name",
});

const speciesOptions: ListOption[] = [
  { label: "Homo sapiens", value: "hsa" },
  { label: "Mus musculus", value: "mmu" },
  { label: "Lama glama", value: "lama" },
  { label: "Alpaca", value: "alpaca" },
  { label: "Macaca fascicularis", value: "mfas" },
  { label: "Macaca mulatta", value: "mmul" },
  { label: "Chicken", value: "gallus" },
  { label: "Rabbit", value: "rabbit" },
  { label: "Rat", value: "rat" },
  { label: "Sheep", value: "sheep" },
  { label: "Spalax", value: "spalax" },
];

const presetSourceOptions: ListOption<Preset["type"]>[] = [
  { label: "Built-in preset", value: "name" },
  { label: "Preset from file", value: "file" },
];

const inputOptions = retentive(computed(() => app.model.outputs.inputOptions));
const hasMultiplexedFastq = retentive(computed(() => app.model.outputs.hasMultiplexedFastq));
const hasInputOptions = computed(() => (inputOptions.value?.length ?? 0) > 0);
const presets = retentive(
  computed(() => {
    const rawContent = reactiveFileContent.getContentJson(app.model.outputs.presets?.handle)?.value;
    if (rawContent === undefined) return undefined;
    return SupportedPresetList.parse(rawContent);
  }),
);

const presetOptions = computed(() => {
  return presets.value?.map(
    (preset) =>
      ({
        label: `${preset.label}${preset.vendor ? " - " + preset.vendor : ""}`,
        value: preset.presetName,
      }) satisfies ListOption,
  );
});

const preset = computed(() => {
  const preset = app.model.data.preset;
  return preset?.type === "name"
    ? presets.value?.find((p) => p.presetName === preset.name)
    : undefined;
});
const needSpecies = computed(() =>
  preset.value === undefined
    ? undefined
    : preset.value.requiredFlags.findIndex((f) => f === "species") >= 0,
);

const needLeftAlignmentMode = computed(() =>
  preset.value === undefined
    ? undefined
    : (preset.value.requiredFlags as unknown as readonly string[]).findIndex(
        (f) => f === "leftAlignmentMode",
      ) >= 0,
);
const needRightAlignmentMode = computed(() =>
  preset.value === undefined
    ? undefined
    : (preset.value.requiredFlags as unknown as readonly string[]).findIndex(
        (f) => f === "rightAlignmentMode",
      ) >= 0,
);
const needMaterialType = computed(() =>
  preset.value === undefined
    ? undefined
    : (preset.value.requiredFlags as unknown as readonly string[]).findIndex(
        (f) => f === "materialType",
      ) >= 0,
);
const needTagPattern = computed(() =>
  preset.value === undefined
    ? undefined
    : (preset.value.requiredFlags as unknown as readonly string[]).findIndex(
        (f) => f === "tagPattern",
      ) >= 0,
);
const needAssembleClonesBy = computed(() =>
  preset.value === undefined
    ? undefined
    : (preset.value.requiredFlags as unknown as readonly string[]).findIndex(
        (f) => f === "assembleClonesBy",
      ) >= 0,
);

const isSingleCell = computed(
  () => preset.value?.analysisStages.includes("assembleCells") === true,
);

// Compute and sync generic preset flag: requires all except tagPattern
const isGenericPresetComputed = computed(() => {
  const rf = preset.value?.requiredFlags as unknown as readonly string[] | undefined;
  if (rf === undefined) return undefined;
  const includes = (x: string) => rf.findIndex((f) => f === x) >= 0;
  return (
    (includes("leftAlignmentMode") &&
      includes("rightAlignmentMode") &&
      includes("assembleClonesBy")) ||
    includes("tagPattern")
  );
});

watch(isGenericPresetComputed, (v) => {
  // propagate to model args as optional boolean
  app.model.data.isGenericPreset = v === undefined ? undefined : v;
});

const allFileImports = computed(() => app.model.outputs.fileImports ?? {});

watch(needSpecies, (ns) => {
  if (
    ns === false && // everything is loaded and we know that species is not specified as flag
    app.model.data.species !== undefined
  )
    app.model.data.species = undefined;

  if (
    ns === true && // the opposite of the above
    app.model.data.species === undefined
  )
    app.model.data.species = "hsa";
});

const leftAlignmentModeOptions: ListOption[] = [
  { label: "Primers", value: "--floating-left-alignment-boundary" },
  { label: "No primers", value: "--rigid-left-alignment-boundary" },
];
const rightAlignmentModeOptions: ListOption[] = [
  { label: "C primers", value: "--floating-right-alignment-boundary C" },
  { label: "J primers", value: "--floating-right-alignment-boundary J" },
  { label: "No primers", value: "--rigid-right-alignment-boundary C" },
];
const materialTypeOptions: ListOption[] = [
  { label: "RNA", value: "--rna" },
  { label: "DNA", value: "--dna" },
];
const assembleClonesByOptions: ListOption[] = [
  { label: "CDR3", value: "CDR3" },
  { label: "FR1 – FR4", value: "VDJRegion" },
  { label: "CDR1 – FR4", value: "CDR1_TO_FR4" },
  { label: "FR2 – FR4", value: "FR2_TO_FR4" },
  { label: "CDR2 – FR4", value: "CDR2_TO_FR4" },
  { label: "FR3 – FR4", value: "FR3_TO_FR4" },
  { label: "CDR3 – FR4", value: "CDR3_TO_FR4" },
  { label: "FR1 – CDR3", value: "{FR1Begin:CDR3End}" },
  { label: "CDR1 – CDR3", value: "{CDR1Begin:CDR3End}" },
  { label: "FR2 – CDR3", value: "{FR2Begin:CDR3End}" },
  { label: "CDR2 – CDR3", value: "{CDR2Begin:CDR3End}" },
  { label: "FR3 – CDR3", value: "{FR3Begin:CDR3End}" },
];

watch(needLeftAlignmentMode, (v) => {
  if (v === false && app.model.data.leftAlignmentMode !== undefined)
    app.model.data.leftAlignmentMode = undefined;
  if (v === true && app.model.data.leftAlignmentMode === undefined)
    app.model.data.leftAlignmentMode = "--rigid-left-alignment-boundary";
});
watch(needRightAlignmentMode, (v) => {
  if (v === false && app.model.data.rightAlignmentMode !== undefined)
    app.model.data.rightAlignmentMode = undefined;
  if (v === true && app.model.data.rightAlignmentMode === undefined)
    app.model.data.rightAlignmentMode = "--floating-right-alignment-boundary C";
});
watch(needMaterialType, (v) => {
  if (v === false && app.model.data.materialType !== undefined)
    app.model.data.materialType = undefined;
  if (v === true && app.model.data.materialType === undefined)
    app.model.data.materialType = "--dna";
});
watch(needTagPattern, (v) => {
  if (v === false && app.model.data.tagPattern !== undefined) app.model.data.tagPattern = undefined;
  if (v === true && app.model.data.tagPattern === undefined) app.model.data.tagPattern = "";
});
watch(needAssembleClonesBy, (v) => {
  if (v === false && app.model.data.assembleClonesBy !== undefined)
    app.model.data.assembleClonesBy = undefined;
  if (v === true && app.model.data.assembleClonesBy === undefined)
    app.model.data.assembleClonesBy = "CDR3";
});

function setPresetName(name?: string) {
  if (name === undefined) {
    app.model.data.preset = undefined;
    app.model.data.presetCommonName = undefined;
  } else {
    app.model.data.preset = { type: "name", name };
    app.model.data.presetCommonName = presetOptions.value?.find((o) => o.value === name)?.label;
  }
}

/* @deprecated Migrate to SDK method when will be published */
function extractFileName(filePath: string) {
  return filePath.replace(/^.*[\\/]/, "");
}

function setPresetFile(file?: ImportFileHandle) {
  if (file === undefined) {
    app.model.data.preset = undefined;
    app.model.data.presetCommonName = undefined;
  } else {
    app.model.data.preset = { type: "file", file };
    app.model.data.presetCommonName = extractFileName(getFilePathFromHandle(file));
  }
}

/* @deprecated Migrate to SDK method when will be published */
function plRefsEqual(ref1: PlRef, ref2: PlRef) {
  return ref1.blockId === ref2.blockId && ref1.name === ref2.name;
}

function setInput(inputRef?: PlRef) {
  app.model.data.input = inputRef;
  if (inputRef)
    app.model.data.title = inputOptions.value?.find((o) => plRefsEqual(o.ref, inputRef))?.label;
  else app.model.data.title = undefined;
}

const DRY_RUN_READS_BULK = 100_000;
const DRY_RUN_READS_SC = 500_000;

const runModeOptions: ListOption<"dry" | "full">[] = [
  { label: "Preview", value: "dry" },
  { label: "Full run", value: "full" },
];

watch(
  () => app.model.data.runMode,
  (value) => {
    if (value === "dry" && app.model.data.limitInput === undefined) {
      app.model.data.limitInput = isSingleCell.value ? DRY_RUN_READS_SC : DRY_RUN_READS_BULK;
    }
  },
);

watch(isSingleCell, () => {
  if (app.model.data.runMode === "dry") {
    app.model.data.limitInput = isSingleCell.value ? DRY_RUN_READS_SC : DRY_RUN_READS_BULK;
  }
  // Heavy-chain only (VHH) is single-cell only; clear it when leaving single-cell mode.
  if (!isSingleCell.value && app.model.data.scHeavyOnly) {
    app.model.data.scHeavyOnly = undefined;
  }
});

type LocalState = {
  tab: "fromFile" | "fromBlock" | undefined;
};

const state = reactive<LocalState>({
  tab: undefined,
});

const computedTab = computed({
  get() {
    return state.tab ?? (app.model.data.libraryFile ? "fromFile" : "fromBlock");
  },
  set(tab) {
    state.tab = tab;
  },
});

watch(computedTab, (newValue, _oldValue) => {
  if (newValue === "fromFile") {
    app.model.data.inputLibrary = undefined;
  }
  if (newValue === "fromBlock") {
    app.model.data.libraryFile = undefined;
  }
});

const librarySourceOptions = [
  { label: "From library builder", value: "fromBlock" },
  { label: "From file", value: "fromFile" },
] as const satisfies ListOption[];

const computedSpecies = computed({
  get: () => (app.model.data.libraryFile ? app.model.data.customSpecies : undefined),
  set: (value) => {
    app.model.data.customSpecies = value;
  },
});

watch(
  () => app.model.data.libraryFile,
  (newFile) => {
    if (!newFile) {
      app.model.data.customSpecies = undefined;
    }
  },
);

watch(
  () => app.model.data.libraryFile,
  (newFile) => {
    if (newFile) {
      const libraryFileName = extractFileName(getFilePathFromHandle(newFile));
      app.model.data.isLibraryFileGzipped = libraryFileName?.toLowerCase().endsWith(".gz") || false;
    }
  },
);

const receptorOrChainsOptions = computed(() => {
  const receptors = [
    { value: "IG", label: "IG" },
    { value: "TCRAB", label: "TCR-αβ" },
    { value: "TCRGD", label: "TCR-ɣδ" },
  ];
  const chains = [
    { value: "IGHeavy", label: "IG Heavy" },
    { value: "IGLight", label: "IG Light" },
    { value: "TCRAlpha", label: "TCR-α" },
    { value: "TCRBeta", label: "TCR-β" },
    { value: "TCRGamma", label: "TCR-ɣ" },
    { value: "TCRDelta", label: "TCR-δ" },
  ];
  if (isSingleCell.value) return receptors;
  return [...receptors, ...chains];
});

const receptorOrChainsModel = computed({
  get: () => app.model.data.chains ?? [],
  set: (value) => {
    app.model.data.chains = value ?? [];
  },
});

const cloneClusteringModeOptions: ListOption[] = [
  { value: "default", label: "Default MiXCR error correction, slower assembly" },
  { value: "relaxed", label: "Relaxed error correction, faster assembly" },
  { value: "off", label: "No error correction, fastest assembly" },
];

const cloneClusteringMode = computed({
  get: () => app.model.data.cloneClusteringMode ?? "default",
  set: (value: string) => {
    app.model.data.cloneClusteringMode = value as "relaxed" | "default" | "off";
  },
});

const exportMinQuality = computed({
  get: () => app.model.data.exportMinQuality ?? false,
  set: (value: boolean) => {
    app.model.data.exportMinQuality = value;
  },
});

const imputeGermline = computed({
  get: () => app.model.data.imputeGermline ?? false,
  set: (value: boolean) => {
    app.model.data.imputeGermline = value;
  },
});

const scHeavyOnly = computed({
  get: () => app.model.data.scHeavyOnly ?? false,
  set: (value: boolean) => {
    app.model.data.scHeavyOnly = value;
  },
});

// Heavy-chain only (VHH) mode only supports the IG receptor. Warn (and block via model
// validation) if it is enabled while any non-IG receptor is selected.
const scHeavyOnlyReceptorConflict = computed(
  () =>
    isSingleCell.value &&
    scHeavyOnly.value &&
    (app.model.data.chains ?? []).some((c) => c !== "IG"),
);

const stopCodonOptions: ListOption<StopCodonType>[] = [
  { label: "Amber (TAG)", value: "amber" },
  { label: "Ochre (TAA)", value: "ochre" },
  { label: "Opal/Umber (TGA)", value: "opal" },
];

const aminoAcidOptions: ListOption[] = [
  { label: "A (Ala)", value: "A" },
  { label: "C (Cys)", value: "C" },
  { label: "D (Asp)", value: "D" },
  { label: "E (Glu)", value: "E" },
  { label: "F (Phe)", value: "F" },
  { label: "G (Gly)", value: "G" },
  { label: "H (His)", value: "H" },
  { label: "I (Ile)", value: "I" },
  { label: "K (Lys)", value: "K" },
  { label: "L (Leu)", value: "L" },
  { label: "M (Met)", value: "M" },
  { label: "N (Asn)", value: "N" },
  { label: "P (Pro)", value: "P" },
  { label: "Q (Gln)", value: "Q" },
  { label: "R (Arg)", value: "R" },
  { label: "S (Ser)", value: "S" },
  { label: "T (Thr)", value: "T" },
  { label: "V (Val)", value: "V" },
  { label: "W (Trp)", value: "W" },
  { label: "Y (Tyr)", value: "Y" },
];

const stopCodonSelection = computed({
  get: () => app.model.data.stopCodonTypes ?? [],
  set: (value: StopCodonType[]) => {
    app.model.data.stopCodonTypes = value.length > 0 ? value : undefined;
  },
});

const stopCodonReplacementModel = (type: StopCodonType) =>
  computed({
    get: () => app.model.data.stopCodonReplacements?.[type],
    set: (value: string | undefined) => {
      const current = app.model.data.stopCodonReplacements ?? {};
      if (value === undefined) {
        if (current[type] !== undefined) {
          delete current[type];
        }
        app.model.data.stopCodonReplacements =
          Object.keys(current).length > 0 ? current : undefined;
      } else {
        app.model.data.stopCodonReplacements = { ...current, [type]: value };
      }
    },
  });

const amberReplacement = stopCodonReplacementModel("amber");
const ochreReplacement = stopCodonReplacementModel("ochre");
const opalReplacement = stopCodonReplacementModel("opal");

watch(stopCodonSelection, (selected) => {
  const current = app.model.data.stopCodonReplacements;
  if (!current) return;
  const next = { ...current };
  for (const key of Object.keys(next) as StopCodonType[]) {
    if (!selected.includes(key)) delete next[key];
  }
  app.model.data.stopCodonReplacements = Object.keys(next).length > 0 ? next : undefined;
});
</script>

<template>
  <PlAlert v-if="!hasInputOptions && hasMultiplexedFastq" type="warn" icon>
    Multiplexed FASTQ detected. Add a <b>FASTQ Demultiplexing</b> block above this one to split by
    sample.
  </PlAlert>
  <PlAlert v-else-if="!hasInputOptions" type="warn" icon>
    Make sure you have an executed <b>Samples &amp; Data</b> block above this one.
  </PlAlert>

  <PlDropdownRef
    :options="inputOptions"
    :model-value="app.model.data.input"
    label="Select dataset"
    clearable
    :required="true"
    :error="!app.model.data.input ? 'Input dataset is required' : undefined"
    @update:model-value="setInput"
  />

  <PlBtnGroup v-model="data.presetType" :options="presetSourceOptions" />

  <PlDropdown
    v-if="data.presetType === 'name'"
    label="MiXCR Preset Name"
    :options="presetOptions"
    :model-value="app.model.data.preset?.type === 'name' ? app.model.data.preset.name : undefined"
    :required="true"
    :error="!app.model.data.preset ? 'Preset is required' : undefined"
    clearable
    @update:model-value="setPresetName"
  />

  <PlFileInput
    v-else
    show-filename-only
    file-dialog-title="Select preset file"
    placeholder="preset.yaml"
    :extensions="['yaml']"
    :progress="
      app.model.data.preset?.type === 'file' && app.model.data.preset.file
        ? allFileImports[app.model.data.preset.file]
        : undefined
    "
    :model-value="app.model.data.preset?.type === 'file' ? app.model.data.preset.file : undefined"
    clearable
    @update:model-value="setPresetFile"
  />

  <PlDropdown
    v-if="needSpecies"
    v-model="app.model.data.species"
    :options="speciesOptions"
    label="Select species"
  />

  <PlDropdownMulti
    v-model="receptorOrChainsModel"
    label="Receptors"
    :options="receptorOrChainsOptions"
    :required="true"
    :error="
      !app.model.data.chains || app.model.data.chains.length === 0
        ? 'Chains selection is required'
        : undefined
    "
  >
    <template #tooltip> Restrict the analysis to certain receptor types. </template>
  </PlDropdownMulti>
  <PlDropdown
    v-if="needLeftAlignmentMode"
    v-model="app.model.data.leftAlignmentMode"
    :options="leftAlignmentModeOptions"
    label="5'-end"
    :required="true"
  >
    <template #tooltip>
      <p>Alignment mode at 5'-end of the library:</p>
      <ul>
        <li>
          <b>Primers</b>: primers or adapters at 5'-end present; typical for V-gene
          single-primer/multiplex protocols. Uses semi‑local alignment on the left side.
        </li>
        <li>
          <b>No primers</b>: no primers/adapters at 5'-end; typical for 5' RACE with template-switch
          oligo. Uses global alignment on the left side.
        </li>
      </ul>
    </template>
  </PlDropdown>

  <PlDropdown
    v-if="needRightAlignmentMode"
    v-model="app.model.data.rightAlignmentMode"
    :options="rightAlignmentModeOptions"
    label="3'-end"
    :required="true"
  >
    <template #tooltip>
      <p>Alignment algorithm at 3'-end of the library:</p>
      <ul>
        <li>
          <b>C gene primers</b>: typically used with C gene single primer / multiplex protocols.
          Instructs C gene aligner to use semi-local alignment on the right side.
        </li>
        <li>
          <b>J gene primers</b>: typically used with J gene single primer / multiplex protocols.
          Instructs J gene aligner to use semi-local alignment on the right side and skips C gene
          alignment.
        </li>
        <li>
          <b>No primers / primers removed</b>: typically used when primers are trimmed using tag
          pattern or with some preprocessing.
        </li>
      </ul>
    </template>
  </PlDropdown>

  <PlDropdown
    v-if="needMaterialType"
    v-model="app.model.data.materialType"
    :options="materialTypeOptions"
    label="Material type"
    :required="true"
  >
    <template #tooltip>
      <p>Use RNA (exons) or DNA (introns) reference:</p>
      <ul>
        <li><b>RNA</b>: VTranscriptWithP will be used for V alignment.</li>
        <li>
          <b>DNA</b>: VGeneWithP will be used for V alignment; C gene alignment will be skipped
          since it is too far from CDR3 in DNA data.
        </li>
      </ul>
    </template>
  </PlDropdown>

  <PlTextField
    v-if="needTagPattern"
    v-model="app.model.data.tagPattern"
    :clearable="() => ''"
    label="Tag pattern"
    :required="true"
  >
    <template #tooltip> Specify tag pattern using MiXCR syntax </template>
  </PlTextField>

  <PlDropdown
    v-if="needAssembleClonesBy"
    v-model="app.model.data.assembleClonesBy"
    :options="assembleClonesByOptions"
    label="Assemble clones by"
    :required="true"
  >
    <template #tooltip> Feature span used to group reads into clonotypes </template>
  </PlDropdown>

  <PlCheckbox v-if="needAssembleClonesBy" v-model="imputeGermline">
    Impute non-covered parts from germline
    <PlTooltip class="info" position="top">
      <template #tooltip
        >Export additional sequence columns for the gene-feature regions outside the assembling
        feature span (and the full VDJRegion), reconstructing the non-covered parts from the
        germline reference of the assigned V/J gene. Imputed bases are not observed in the reads;
        they are not used for clonotype assembly.</template
      >
    </PlTooltip>
  </PlCheckbox>

  <PlBtnGroup v-model="app.model.data.runMode" :options="runModeOptions" label="Run mode">
    <template #tooltip>
      Preview — runs the analysis on a small fraction of reads per sample. Use it to check that
      settings are correct and results look reasonable before launching a full run, which may take
      much longer.
    </template>
  </PlBtnGroup>

  <template v-if="app.model.data.runMode === 'dry'">
    <PlNumberField
      v-model="app.model.data.limitInput"
      label="Reads per sample limit"
      :clearable="true"
      :minValue="1"
      :error-message="
        app.model.data.limitInput == null ? 'Read limit is required for Preview mode' : undefined
      "
    >
      <template #tooltip>
        Number of reads to use per sample in the dry run. Recommended: 100,000 for bulk data,
        500,000 for single-cell data.
      </template>
    </PlNumberField>
    <p v-if="isSingleCell" class="sc-warning-message">
      For single-cell data, limiting reads reduces per-cell coverage and may affect assembly
      quality. Consider running 1–2 complete samples at full depth instead.
    </p>
  </template>

  <PlAccordionSection label="Advanced Settings">
    <PlCheckbox v-if="isSingleCell" v-model="scHeavyOnly">
      Heavy-chain only (VHH)
      <PlTooltip class="info" position="top">
        <template #tooltip
          >Enable for single-cell heavy-chain-only data (e.g. VHH / nanobodies) with no light chain.
          Clonotypes are built from the heavy chain alone and cells are not required to have a
          paired light chain. Requires selecting only the IG receptor.</template
        >
      </PlTooltip>
    </PlCheckbox>
    <PlAlert v-if="scHeavyOnlyReceptorConflict" type="warn">
      Heavy-chain only (VHH) mode supports only the IG receptor. Remove the other selected receptors
      to run.
    </PlAlert>
    <PlSectionSeparator>MiXCR Settings</PlSectionSeparator>
    <PlDropdown
      v-model="cloneClusteringMode"
      :options="cloneClusteringModeOptions"
      label="Error correction"
    >
      <template #tooltip>
        <ul>
          <li><b>Default MiXCR error correction:</b> The standard MiXCR clustering mode.</li>
          <li>
            <b>Relaxed error correction:</b> Relaxes fuzzy matching criteria, speeding up assembly.
          </li>
          <li>
            <b>No error correction:</b> Further accelerates the process but disables error
            correction.
          </li>
        </ul>
      </template>
    </PlDropdown>

    <PlCheckbox v-model="exportMinQuality">
      Export minimum quality scores
      <PlTooltip class="info" position="top">
        <template #tooltip
          >Export additional columns with the minimum quality scores for each
          complementarity-determining region (CDR1, CDR2, CDR3) and framework region (FR1, FR2, FR3,
          FR4). If a specific assembling feature (e.g., VDJRegion) is used, its minimum quality will
          also be exported.</template
        >
      </PlTooltip>
    </PlCheckbox>

    <PlBtnGroup
      v-model="computedTab"
      :options="librarySourceOptions"
      label="Custom reference library"
    />
    <PlDropdownRef
      v-if="computedTab === 'fromBlock'"
      v-model="app.model.data.inputLibrary"
      :options="app.model.outputs.libraryOptions"
      label="Custom library"
      clearable
    />
    <template v-if="computedTab === 'fromFile'">
      <PlFileInput
        v-model="app.model.data.libraryFile"
        :progress="app.model.outputs.libraryUploadProgress"
        file-dialog-title="Select library file"
        clearable
      />
      <PlTextField
        v-model="computedSpecies"
        :clearable="() => undefined"
        label="Species"
        placeholder="Type spicies name"
      />
    </template>

    <PlSectionSeparator>Stop codon replacement</PlSectionSeparator>
    <PlDropdownMulti
      v-model="stopCodonSelection"
      label="Stop codons"
      :options="stopCodonOptions"
      clearable
    >
      <template #tooltip> Select stop codons to replace in amino acid sequences. </template>
    </PlDropdownMulti>
    <PlDropdown
      v-if="stopCodonSelection.includes('amber')"
      v-model="amberReplacement"
      :options="aminoAcidOptions"
      label="Replace Amber (TAG) with"
      clearable
    />
    <PlDropdown
      v-if="stopCodonSelection.includes('ochre')"
      v-model="ochreReplacement"
      :options="aminoAcidOptions"
      label="Replace Ochre (TAA) with"
      clearable
    />
    <PlDropdown
      v-if="stopCodonSelection.includes('opal')"
      v-model="opalReplacement"
      :options="aminoAcidOptions"
      label="Replace Opal/Umber (TGA) with"
      clearable
    />

    <PlSectionSeparator>Resource Allocation</PlSectionSeparator>
    <PlNumberField
      v-model="app.model.data.perProcessMemGB"
      label="Set memory per every sample process (GB)"
      :minValue="1"
      :maxValue="999999"
    />

    <PlNumberField
      v-model="app.model.data.perProcessCPUs"
      label="Set CPUs number per every sample process"
      :minValue="1"
      :maxValue="999999"
    />
  </PlAccordionSection>
</template>

<style scoped>
.sc-warning-message {
  font-size: 0.85em;
  color: var(--pl-color-warning, #b45309);
  margin: 0;
}
</style>
