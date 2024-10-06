<script setup lang="ts">
import { useApp } from './app';
import { PlDropdown } from '@platforma-sdk/ui-vue';
import { computed, watch } from 'vue';
import { retentive } from './retentive';

const app = useApp();

const inputOptions = computed(() =>
  app.outputValues.inputOptions?.map((v) => ({
    text: v.label,
    value: v.ref,
  }))
);

const args = app.createArgsModel();

const presets = retentive(computed(() => app.outputValues.presets))

const presetOptions = computed(() => {
  return presets.value?.map(preset => ({ text: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`, value: preset.presetName }))
})

const preset = computed(() => app.args.preset === undefined ? undefined : presets.value?.find(p => p.presetName === app.args.preset))
const needSpecies = computed(() => preset.value === undefined ? undefined : (preset.value.requiredFlags.findIndex(f => f === 'species') >= 0))

watch(needSpecies, ns => {
  if (ns === false && // everething is loaded and we know that species is not specified as flag
    args.model.species !== undefined)
    args.model.species = undefined;

  if (ns === true && // the opposite of the above
    args.model.species === undefined)
    args.model.species = "hsa";
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
  <pl-dropdown :options="inputOptions ?? []" v-model="args.model.input" label="Select dataset" clearable />
  <pl-dropdown :options="presetOptions ?? []" v-model="args.model.preset" label="Select preset" clearable />
  <pl-dropdown v-if="needSpecies" :options="speciesOptions" v-model="args.model.species" label="Select species" />
</template>
