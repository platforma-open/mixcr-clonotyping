<script setup lang="ts">
import { useApp } from './app';
import { PlDropdown, PlDropdownRef } from '@platforma-sdk/ui-vue';
import { computed, watch } from 'vue';
import { retentive } from './retentive';

const app = useApp();

const inputOptions = computed(() => app.outputValues.inputOptions ?? []);

const presets = retentive(computed(() => app.outputValues.presets))

const presetOptions = computed(() => {
  return presets.value?.map(preset => ({ text: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`, value: preset.presetName }))
})

const preset = computed(() => app.args?.preset === undefined ? undefined : presets.value?.find(p => p.presetName === app.args.preset))
const needSpecies = computed(() => preset.value === undefined ? undefined : (preset.value.requiredFlags.findIndex(f => f === 'species') >= 0))

watch(needSpecies, ns => {
  if (ns === false && // everething is loaded and we know that species is not specified as flag
    app.model.args.species !== undefined)
    app.model.args.species = undefined;

  if (ns === true && // the opposite of the above
    app.model.args.species === undefined)
    app.model.args.species = "hsa";
})

const speciesOptions = [
  { text: "Homo sapience", value: "hsa" },
  { text: "Mus musculus", value: "mmu" },
  { text: "Lama glama", value: "lama" },
  { text: "Alpaca", value: "alpaca" },
  { text: "Macaca fascicularis", value: "mfas" },
];

</script>

<template>
  <PlDropdownRef :options="inputOptions ?? []" v-model="app.model.args.input" label="Select dataset" clearable />
  <PlDropdown :options="presetOptions ?? []" v-model="app.model.args.preset" label="Select preset" clearable />
  <PlDropdown v-if="needSpecies" :options="speciesOptions" v-model="app.model.args.species" label="Select species" />
</template>
