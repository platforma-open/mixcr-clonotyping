<script setup lang="ts">
import type { Preset } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { SupportedPresetList } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import type { ImportFileHandle, PlRef } from '@platforma-sdk/model';
import { getFilePathFromHandle } from '@platforma-sdk/model';
import type { ListOption } from '@platforma-sdk/ui-vue';
import { PlAccordionSection, PlBtnGroup, PlDropdown, PlDropdownMulti, PlDropdownRef, PlFileInput, PlTextField, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import { computed, reactive, watch } from 'vue';
import { useApp } from './app';
import { retentive } from './retentive';

const app = useApp();

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
  const rawContent = ReactiveFileContent.getContentJson(app.model.outputs.presets?.handle)?.value;
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

const isSingleCell = computed(() => preset.value?.analysisStages.includes('assembleCells') === true);

const allFileImports = computed(() => {
  return { ...(app.model.outputs.prerunFileImports ?? {}), ...(app.model.outputs.mainFileImports ?? {}) };
});

watch(needSpecies, (ns) => {
  if (ns === false // everething is loaded and we know that species is not specified as flag
    && app.model.args.species !== undefined)
    app.model.args.species = undefined;

  if (ns === true // the opposite of the above
    && app.model.args.species === undefined)
    app.model.args.species = 'hsa';
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
  hasAutoSelectedChains: boolean;
};

const state = reactive<LocalState>({
  tab: undefined,
  hasAutoSelectedChains: false,
});

const computedTab = computed({
  get() {
    return state.tab ?? (app.model.args.libraryFile ? 'fromFile' : 'fromBlock');
  },
  set(tab) {
    state.tab = tab;
  },
});

watch(computedTab, (newValue) => {
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

// Extract chains from library spec
const libraryChains = computed(() => {
  if (computedTab.value !== 'fromBlock' || !app.model.args.inputLibrary) {
    return undefined;
  }

  const spec = app.model.outputs.datasetSpec;
  if (!spec) return undefined;

  const chainString = spec.annotations?.['pl7.app/vdj/chain'];
  if (!chainString) return undefined;

  try {
    // The chain annotation should be a JSON-encoded array of chains
    const chains = JSON.parse(chainString) as string[];
    // Remove duplicates using Set
    return [...new Set(chains)];
  } catch {
    return undefined;
  }
});

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

  // If single cell mode, only return receptors
  if (isSingleCell.value) return receptors;

  // If library chains are available, filter chains to only those available in the library
  if (libraryChains.value && libraryChains.value.length > 0) {
    const filteredChains = chains.filter((chain) => libraryChains.value!.includes(chain.value));
    return filteredChains;
  }

  // Otherwise return all options
  return [...receptors, ...chains];
});

const receptorOrChainsModel = computed({
  get: () => (app.model.args.chains ?? []),
  set: (value) => {
    app.model.args.chains = value ?? [];
  },
});

// Watch for when library chains become available and auto-select them
watch(libraryChains, (newChains) => {
  if (newChains && newChains.length > 0 && !state.hasAutoSelectedChains) {
    const currentChains = app.model.args.chains || [];

    const isCurrentlyDefaultPlaceholder = currentChains.length === 3
      && currentChains.includes('IG')
      && currentChains.includes('TCRAB')
      && currentChains.includes('TCRGD');

    if (isCurrentlyDefaultPlaceholder) {
      app.model.args.chains = [...newChains];
    }
    state.hasAutoSelectedChains = true;
  }
});

// Watch for library removal or changes in app.model.args.inputLibrary
watch(() => app.model.args.inputLibrary, (newLibrary, oldLibrary) => {
  if (newLibrary !== oldLibrary) {
    state.hasAutoSelectedChains = false;
  }

  if (oldLibrary && !newLibrary && computedTab.value === 'fromBlock') {
    app.model.args.chains = ['IG', 'TCRAB', 'TCRGD'];
  }
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

  <PlDropdownMulti v-model="receptorOrChainsModel" label="Receptors" :options="receptorOrChainsOptions" >
    <template #tooltip>
      Restrict the analysis to certain receptor types.
    </template>
  </PlDropdownMulti>

  <PlAccordionSection label="Advanced Settings">
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
  </PlAccordionSection>
</template>
