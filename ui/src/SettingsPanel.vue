<script setup lang="ts">
import { useApp } from './app';
import { ListOption, PlBtnGroup, PlDropdown, PlDropdownRef, PlFileInput } from '@platforma-sdk/ui-vue';
import { computed, reactive, watch } from 'vue';
import { retentive } from './retentive';
import { Preset } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { ImportFileHandle } from '@platforma-sdk/model';

const app = useApp();

const data = reactive<{ presetType: Preset['type'] }>({
  presetType: app.model.args.preset?.type ?? 'name'
})

const inputOptions = computed(() => app.outputValues.inputOptions ?? []);

const speciesOptions: ListOption[] = [
  { label: "Homo sapience", value: "hsa" },
  { label: "Mus musculus", value: "mmu" },
  { label: "Lama glama", value: "lama" },
  { label: "Alpaca", value: "alpaca" },
  { label: "Macaca fascicularis", value: "mfas" },
];

const presetSourceOptions: ListOption<Preset['type']>[] = [
  { label: "Built-in preset", value: "name" },
  { label: "Preset from file", value: "file" }
];

const presets = retentive(computed(() => app.outputValues.presets))

const presetOptions = computed(() => {
  return presets.value?.map(preset => (
    {
      text: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`,
      value: preset.presetName
    } satisfies ListOption
  ))
})

const preset = computed(() => {
  const preset = app.args.preset;
  return preset?.type === 'name'
    ? presets.value?.find(p => p.presetName === preset.name)
    : undefined
})
const needSpecies = computed(() => preset.value === undefined
  ? undefined
  : (preset.value.requiredFlags.findIndex(f => f === 'species') >= 0))

const allFileImports = computed(() => {
  return { ...(app.model.outputs.prerunFileImports ?? {}), ...(app.model.outputs.mainFileImports ?? {}) };
})

watch(needSpecies, ns => {
  if (ns === false && // everething is loaded and we know that species is not specified as flag
    app.model.args.species !== undefined)
    app.model.args.species = undefined;

  if (ns === true && // the opposite of the above
    app.model.args.species === undefined)
    app.model.args.species = "hsa";
})

function setPresetName(name?: string) {
  app.model.args.preset = name === undefined ? undefined : { type: 'name', name }
}

function setPresetFile(file?: ImportFileHandle) {
  app.model.args.preset = file === undefined ? undefined : { type: 'file', file }
}
</script>

<template>
  <PlDropdownRef :options="inputOptions ?? []" v-model="app.model.args.input" label="Select dataset" clearable />

  <PlBtnGroup :options="presetSourceOptions" v-model="data.presetType" />

  <PlDropdown v-if="data.presetType === 'name'" label="MiXCR Preset Name" :options="presetOptions ?? []"
    :model-value="app.model.args.preset?.type === 'name' ? app.model.args.preset.name : undefined"
    @update:model-value="setPresetName" clearable />

  <PlFileInput v-else show-filename-only file-dialog-title="Select preset file" placeholder="preset.yaml"
    :extensions="['yaml']"
    :progress="(app.model.args.preset?.type === 'file' && app.model.args.preset.file) ? allFileImports[app.model.args.preset.file] : undefined"
    :model-value="app.model.args.preset?.type === 'file' ? app.model.args.preset.file : undefined"
    @update:model-value="setPresetFile" clearable />

  <PlDropdown v-if="needSpecies" :options="speciesOptions" v-model="app.model.args.species" label="Select species" />
</template>
