<script setup lang="ts">
import type { Preset } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { SupportedPresetList } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import type { ImportFileHandle, PlRef } from '@platforma-sdk/model';
import { getFilePathFromHandle } from '@platforma-sdk/model';
import type { ListOption } from '@platforma-sdk/ui-vue';
import { PlAccordionSection, PlBtnGroup, PlDropdown, PlDropdownMulti, PlDropdownRef, PlFileInput, PlTextField, PlNumberField, PlCheckbox, ReactiveFileContent, PlTooltip } from '@platforma-sdk/ui-vue';
import { computed, reactive, watch } from 'vue';
import { useApp } from './app';
import { retentive } from './retentive';

const app = useApp();

const reactiveFileContent = ReactiveFileContent.useGlobal();

const data = reactive<{ presetType: Preset['type'] }>({
  presetType: app.model.args.preset?.type ?? 'name',
});

const speciesOptions: ListOption[] = [
  { label: 'Homo sapiens', value: 'hsa' },
  { label: 'Mus musculus', value: 'mmu' },
  { label: 'Lama glama', value: 'lama' },
  { label: 'Alpaca', value: 'alpaca' },
  { label: 'Macaca fascicularis', value: 'mfas' },
  { label: 'Macaca mulatta', value: 'mmul' },
  { label: 'Chicken', value: 'gallus' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'Rat', value: 'rat' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Spalax', value: 'spalax' },
];

const presetSourceOptions: ListOption<Preset['type']>[] = [
  { label: 'Built-in preset', value: 'name' },
  { label: 'Preset from file', value: 'file' },
];

const inputOptions = retentive(computed(() => app.model.outputs.inputOptions));
const presets = retentive(computed(() => {
  const rawContent = reactiveFileContent.getContentJson(app.model.outputs.presets?.handle)?.value;
  if (rawContent === undefined)
    return undefined;
  return SupportedPresetList.parse(rawContent);
}));

const presetOptions = computed(() => {
  return presets.value?.map((preset) => (
    {
      label: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`,
      value: preset.presetName,
    } satisfies ListOption
  ));
});

const preset = computed(() => {
  const preset = app.model.args.preset;
  return preset?.type === 'name'
    ? presets.value?.find((p) => p.presetName === preset.name)
    : undefined;
});
const needSpecies = computed(() => preset.value === undefined
  ? undefined
  : (preset.value.requiredFlags.findIndex((f) => f === 'species') >= 0));

const needLeftAlignmentMode = computed(() => preset.value === undefined
  ? undefined
  : ((preset.value.requiredFlags as unknown as readonly string[]).findIndex((f) => f === 'leftAlignmentMode') >= 0));
const needRightAlignmentMode = computed(() => preset.value === undefined
  ? undefined
  : ((preset.value.requiredFlags as unknown as readonly string[]).findIndex((f) => f === 'rightAlignmentMode') >= 0));
const needMaterialType = computed(() => preset.value === undefined
  ? undefined
  : ((preset.value.requiredFlags as unknown as readonly string[]).findIndex((f) => f === 'materialType') >= 0));
const needTagPattern = computed(() => preset.value === undefined
  ? undefined
  : ((preset.value.requiredFlags as unknown as readonly string[]).findIndex((f) => f === 'tagPattern') >= 0));
const needAssembleClonesBy = computed(() => preset.value === undefined
  ? undefined
  : ((preset.value.requiredFlags as unknown as readonly string[]).findIndex((f) => f === 'assembleClonesBy') >= 0));

const isSingleCell = computed(() => preset.value?.analysisStages.includes('assembleCells') === true);

// Compute and sync generic preset flag: requires all except tagPattern
const isGenericPresetComputed = computed(() => {
  const rf = preset.value?.requiredFlags as unknown as readonly string[] | undefined;
  if (rf === undefined) return undefined;
  const includes = (x: string) => rf.findIndex((f) => f === x) >= 0;
  return (includes('leftAlignmentMode')
    && includes('rightAlignmentMode')
    && includes('assembleClonesBy')) || includes('tagPattern');
});

watch(isGenericPresetComputed, (v) => {
  // propagate to model args as optional boolean
  (app.model.args as unknown as { isGenericPreset?: boolean }).isGenericPreset = v === undefined ? undefined : v;
});

const allFileImports = computed(() => {
  return { ...(app.model.outputs.prerunFileImports ?? {}), ...(app.model.outputs.mainFileImports ?? {}) };
});

watch(needSpecies, (ns) => {
  if (ns === false // everything is loaded and we know that species is not specified as flag
    && app.model.args.species !== undefined)
    app.model.args.species = undefined;

  if (ns === true // the opposite of the above
    && app.model.args.species === undefined)
    app.model.args.species = 'hsa';
});

const leftAlignmentModeOptions: ListOption[] = [
  { label: 'Primers', value: '--floating-left-alignment-boundary' },
  { label: 'No primers', value: '--rigid-left-alignment-boundary' },
];
const rightAlignmentModeOptions: ListOption[] = [
  { label: 'C primers', value: '--floating-right-alignment-boundary C' },
  { label: 'J primers', value: '--floating-right-alignment-boundary J' },
  { label: 'No primers', value: '--rigid-right-alignment-boundary C' },
];
const materialTypeOptions: ListOption[] = [
  { label: 'RNA', value: '--rna' },
  { label: 'DNA', value: '--dna' },
];
const assembleClonesByOptions: ListOption[] = [
  { label: 'CDR3', value: 'CDR3' },
  { label: 'FR1 – FR4', value: 'VDJRegion' },
  { label: 'CDR1 – FR4', value: 'CDR1_TO_FR4' },
  { label: 'FR2 – FR4', value: 'FR2_TO_FR4' },
  { label: 'CDR2 – FR4', value: 'CDR2_TO_FR4' },
  { label: 'FR3 – FR4', value: 'FR3_TO_FR4' },
  { label: 'CDR3 – FR4', value: 'CDR3_TO_FR4' },
  { label: 'FR1 – CDR3', value: '{FR1Begin:CDR3End}' },
  { label: 'CDR1 – CDR3', value: '{CDR1Begin:CDR3End}' },
  { label: 'FR2 – CDR3', value: '{FR2Begin:CDR3End}' },
  { label: 'CDR2 – CDR3', value: '{CDR2Begin:CDR3End}' },
  { label: 'FR3 – CDR3', value: '{FR3Begin:CDR3End}' },
];

watch(needLeftAlignmentMode, (v) => {
  if (v === false && app.model.args.leftAlignmentMode !== undefined)
    app.model.args.leftAlignmentMode = undefined;
  if (v === true && app.model.args.leftAlignmentMode === undefined)
    app.model.args.leftAlignmentMode = '--rigid-left-alignment-boundary';
});
watch(needRightAlignmentMode, (v) => {
  if (v === false && app.model.args.rightAlignmentMode !== undefined)
    app.model.args.rightAlignmentMode = undefined;
  if (v === true && app.model.args.rightAlignmentMode === undefined)
    app.model.args.rightAlignmentMode = '--floating-right-alignment-boundary C';
});
watch(needMaterialType, (v) => {
  if (v === false && app.model.args.materialType !== undefined)
    app.model.args.materialType = undefined;
  if (v === true && app.model.args.materialType === undefined)
    app.model.args.materialType = '--dna';
});
watch(needTagPattern, (v) => {
  if (v === false && app.model.args.tagPattern !== undefined)
    app.model.args.tagPattern = undefined;
  if (v === true && app.model.args.tagPattern === undefined)
    app.model.args.tagPattern = '';
});
watch(needAssembleClonesBy, (v) => {
  if (v === false && app.model.args.assembleClonesBy !== undefined)
    app.model.args.assembleClonesBy = undefined;
  if (v === true && app.model.args.assembleClonesBy === undefined)
    app.model.args.assembleClonesBy = 'CDR3';
});

function setPresetName(name?: string) {
  if (name === undefined) {
    app.model.args.preset = undefined;
    app.model.args.presetCommonName = undefined;
  } else {
    app.model.args.preset = { type: 'name', name };
    app.model.args.presetCommonName = presetOptions.value?.find((o) => o.value === name)?.label;
  }
}

/* @deprecated Migrate to SDK method when will be published */
function extractFileName(filePath: string) {
  return filePath.replace(/^.*[\\/]/, '');
}

function setPresetFile(file?: ImportFileHandle) {
  if (file === undefined) {
    app.model.args.preset = undefined;
    app.model.args.presetCommonName = undefined;
  } else {
    app.model.args.preset = { type: 'file', file };
    app.model.args.presetCommonName = extractFileName(getFilePathFromHandle(file));
  }
}

/* @deprecated Migrate to SDK method when will be published */
function plRefsEqual(ref1: PlRef, ref2: PlRef) {
  return ref1.blockId === ref2.blockId && ref1.name === ref2.name;
}

function setInput(inputRef?: PlRef) {
  app.model.args.input = inputRef;
  if (inputRef)
    app.model.args.title = inputOptions.value?.find((o) => plRefsEqual(o.ref, inputRef))?.label;
  else
    app.model.args.title = undefined;
}

function parseNumber(v: string): number {
  const parsed = Number(v);

  if (!Number.isFinite(parsed)) {
    throw Error('Not a number');
  }

  return parsed;
}

type LocalState = {
  tab: 'fromFile' | 'fromBlock' | undefined;
};

const state = reactive<LocalState>({
  tab: undefined,
});

const computedTab = computed({
  get() {
    return state.tab ?? (app.model.args.libraryFile ? 'fromFile' : 'fromBlock');
  },
  set(tab) {
    state.tab = tab;
  },
});

watch(computedTab, (newValue, _oldValue) => {
  if (newValue === 'fromFile') {
    app.model.args.inputLibrary = undefined;
  }
  if (newValue === 'fromBlock') {
    app.model.args.libraryFile = undefined;
  }
});

const librarySourceOptions = [
  { label: 'From library builder', value: 'fromBlock' },
  { label: 'From file', value: 'fromFile' },
] as const satisfies ListOption [];

const computedSpecies = computed({
  get: () => (app.model.args.libraryFile ? app.model.args.customSpecies : undefined),
  set: (value) => {
    app.model.args.customSpecies = value;
  },
});

watch(
  () => app.model.args.libraryFile,
  (newFile) => {
    if (!newFile) {
      app.model.args.customSpecies = undefined;
    }
  },
);

watch(
  () => app.model.args.libraryFile,
  (newFile) => {
    if (newFile) {
      const libraryFileName = extractFileName(getFilePathFromHandle(newFile));
      app.model.args.isLibraryFileGzipped = libraryFileName?.toLowerCase().endsWith('.gz') || false;
    }
  },
);

const receptorOrChainsOptions = computed(() => {
  const receptors = [
    { value: 'IG', label: 'IG' },
    { value: 'TCRAB', label: 'TCR-αβ' },
    { value: 'TCRGD', label: 'TCR-ɣδ' },
  ];
  const chains = [
    { value: 'IGHeavy', label: 'IG Heavy' },
    { value: 'IGLight', label: 'IG Light' },
    { value: 'TCRAlpha', label: 'TCR-α' },
    { value: 'TCRBeta', label: 'TCR-β' },
    { value: 'TCRGamma', label: 'TCR-ɣ' },
    { value: 'TCRDelta', label: 'TCR-δ' },
  ];
  if (isSingleCell.value) return receptors;
  return [...receptors, ...chains];
});

const receptorOrChainsModel = computed({
  get: () => (app.model.args.chains ?? []),
  set: (value) => {
    app.model.args.chains = value ?? [];
  },
});

const highDiversityLibrary = computed({
  get: () => app.model.args.highDiversityLibrary ?? false,
  set: (value: boolean) => {
    app.model.args.highDiversityLibrary = value;
  },
});
</script>

<template>
  <PlDropdownRef
    :options="inputOptions" :model-value="app.model.args.input" label="Select dataset"
    clearable
    @update:model-value="setInput"
  />

  <PlBtnGroup v-model="data.presetType" :options="presetSourceOptions" />

  <PlDropdown
    v-if="data.presetType === 'name'" label="MiXCR Preset Name" :options="presetOptions"
    :model-value="app.model.args.preset?.type === 'name' ? app.model.args.preset.name : undefined"
    clearable @update:model-value="setPresetName"
  />

  <PlFileInput
    v-else show-filename-only file-dialog-title="Select preset file" placeholder="preset.yaml"
    :extensions="['yaml']"
    :progress="(app.model.args.preset?.type === 'file' && app.model.args.preset.file) ? allFileImports[app.model.args.preset.file] : undefined"
    :model-value="app.model.args.preset?.type === 'file' ? app.model.args.preset.file : undefined"
    clearable @update:model-value="setPresetFile"
  />

  <PlDropdown v-if="needSpecies" v-model="app.model.args.species" :options="speciesOptions" label="Select species" />

  <PlDropdownMulti
    v-model="receptorOrChainsModel"
    label="Receptors"
    :options="receptorOrChainsOptions"
    :required="true"
  >
    <template #tooltip>
      Restrict the analysis to certain receptor types.
    </template>
  </PlDropdownMulti>
  <PlDropdown
    v-if="needLeftAlignmentMode"
    v-model="app.model.args.leftAlignmentMode"
    :options="leftAlignmentModeOptions"
    label="5'-end"
    :required="true"
  >
    <template #tooltip>
      <p>Alignment mode at 5'-end of the library:</p>
      <ul>
        <li><b>Primers</b>: primers or adapters at 5'-end present; typical for V-gene single-primer/multiplex protocols. Uses semi‑local alignment on the left side.</li>
        <li><b>No primers</b>: no primers/adapters at 5'-end; typical for 5' RACE with template-switch oligo. Uses global alignment on the left side.</li>
      </ul>
    </template>
  </PlDropdown>

  <PlDropdown
    v-if="needRightAlignmentMode"
    v-model="app.model.args.rightAlignmentMode"
    :options="rightAlignmentModeOptions"
    label="3'-end"
    :required="true"
  >
    <template #tooltip>
      <p>Alignment algorithm at 3'-end of the library:</p>
      <ul>
        <li><b>C gene primers</b>: typically used with C gene single primer / multiplex protocols. Instructs C gene aligner to use semi-local alignment on the right side.</li>
        <li><b>J gene primers</b>: typically used with J gene single primer / multiplex protocols. Instructs J gene aligner to use semi-local alignment on the right side and skips C gene alignment.</li>
        <li><b>No primers / primers removed</b>: typically used when primers are trimmed using tag pattern or with some preprocessing.</li>
      </ul>
    </template>
  </PlDropdown>

  <PlDropdown
    v-if="needMaterialType"
    v-model="app.model.args.materialType"
    :options="materialTypeOptions"
    label="Material type"
    :required="true"
  >
    <template #tooltip>
      <p>Use RNA (exons) or DNA (introns) reference:</p>
      <ul>
        <li><b>RNA</b>: VTranscriptWithP will be used for V alignment.</li>
        <li><b>DNA</b>: VGeneWithP will be used for V alignment; C gene alignment will be skipped since it is too far from CDR3 in DNA data.</li>
      </ul>
    </template>
  </PlDropdown>

  <PlTextField
    v-if="needTagPattern"
    v-model="app.model.args.tagPattern"
    :clearable="() => undefined"
    label="Tag pattern"
    :required="true"
  >
    <template #tooltip>
      Specify tag pattern using MiXCR syntax
    </template>
  </PlTextField>

  <PlDropdown
    v-if="needAssembleClonesBy"
    v-model="app.model.args.assembleClonesBy"
    :options="assembleClonesByOptions"
    label="Assemble clones by"
    :required="true"
  >
    <template #tooltip>
      Feature span used to group reads into clonotypes
    </template>
  </PlDropdown>

  <PlAccordionSection label="Advanced Settings">
    <PlCheckbox
      v-model="highDiversityLibrary"
    >
      High diversity dataset
      <PlTooltip class="info" position="top">
        <template #tooltip>Use for high diversity datasets. Relaxed error correction, faster assembly.</template>
      </PlTooltip>
    </PlCheckbox>

    <PlTextField
      v-model="app.model.args.limitInput" :parse="parseNumber" :clearable="() => undefined"
      label="Take only this number of reads into analysis"
    />

    <PlBtnGroup v-model="computedTab" :options="librarySourceOptions" label="Custom reference library" />
    <PlDropdownRef
      v-if="computedTab === 'fromBlock'"
      v-model="app.model.args.inputLibrary"
      :options="app.model.outputs.libraryOptions"
      label="Custom library"
      clearable
    />
    <template v-if="computedTab === 'fromFile'">
      <PlFileInput
        v-model="app.model.args.libraryFile"
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

    <PlNumberField
      v-model="app.model.args.perProcessMemGB"
      label="Set memory per every sample process (GB)"
      :minValue="1"
      :maxValue="999999"
    />

    <PlNumberField
      v-model="app.model.args.perProcessCPUs"
      label="Set CPUs number per every sample process"
      :minValue="1"
      :maxValue="999999"
    />
  </PlAccordionSection>
</template>
