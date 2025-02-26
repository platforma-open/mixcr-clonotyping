<script setup lang="ts">
import type { Preset } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { SupportedPresetList } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import type { ImportFileHandle, PlRef } from '@platforma-sdk/model';
import { getFilePathFromHandle } from '@platforma-sdk/model';
import type { ListOption } from '@platforma-sdk/ui-vue';
import { PlAccordionSection, PlBtnGroup, PlDropdown, PlDropdownRef, PlFileInput, PlTextField, ReactiveFileContent } from '@platforma-sdk/ui-vue';
import { computed, reactive, watch } from 'vue';
import { useApp } from './app';
import { retentive } from './retentive';

const app = useApp();

const data = reactive<{ presetType: Preset['type'] }>({
  presetType: app.model.args.preset?.type ?? 'name',
});

const speciesOptions: ListOption[] = [
  { label: 'Homo sapience', value: 'hsa' },
  { label: 'Mus musculus', value: 'mmu' },
  { label: 'Lama glama', value: 'lama' },
  { label: 'Alpaca', value: 'alpaca' },
  { label: 'Macaca fascicularis', value: 'mfas' },
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
  tab: "fromFile" | "fromBlock" | undefined;
}

const state = reactive<LocalState>({
  tab: undefined,
})

const computedTab = computed({
  get() {
    return state.tab ?? (app.model.args.libraryFile ? "fromFile" : "fromBlock");
  },
  set(tab) {
    state.tab = tab;
  },
});

watch(computedTab, (newValue, oldValue)=>{
  if (newValue === "fromFile") {
    app.model.args.inputLibrary = undefined;
  }
  if (newValue === "fromBlock") {
    app.model.args.libraryFile = undefined;
  }
})

//const computedAcc = computed(
//  () => { return (app.model.args.libraryFile || app.model.args.inputLibrary) ? true : false }
//)

const librarySourceOptions = [
  { label: "From library builder", value: "fromBlock" },
  { label: "From file", value: "fromFile" }
] as const satisfies ListOption [];
</script>

<template>
  <PlDropdownRef
    :options="inputOptions" :model-value="app.model.args.input" label="Select dataset"
    clearable @update:model-value="setInput"
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
  <PlAccordionSection label="Advanced Settings">
    <PlTextField
      v-model="app.model.args.limitInput" :parse="parseNumber" :clearable="() => undefined"
      label="Take only this number of reads into analysis"
    />

    <PlBtnGroup :options="librarySourceOptions" v-model="computedTab" label="Custom reference library" />
    <PlDropdownRef
      v-if="computedTab === 'fromBlock'"
      :options="app.model.outputs.libraryOptions" 
      v-model="app.model.args.inputLibrary"
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
      <PlTextField v-model="app.model.args.customSpecies" 
      :clearable="() => undefined"
      label="Species"
      placeholder="Type spicies name"
      />
    </template>

  </PlAccordionSection>
</template>
