<script setup lang="ts">
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { platforma } from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { useApp } from './app';
import { PlDropdown } from '@milaboratory/platforma-uikit';
import { computed } from 'vue';
import { asyncComputed } from '@vueuse/core';

const app = useApp();

app.createArgsModel();

const inputOptions = computed(() =>
  app.getOutputFieldOkOptional("inputOptions")?.map((v) => ({
    text: v.label,
    value: v.ref,
  }))
);

const args = app.createArgsModel();

// const presets = asyncComputed(async () => {
//   const presetsFile = app.getOutputFieldOkOptional("presets")
//   if (presetsFile === undefined)
//     return undefined;
//   return JSON.parse(new TextDecoder().decode(await platforma.blobDriver.getContent(presetsFile.handle)))
// })

const presets = computed(() => app.getOutputFieldOkOptional("presets"))

const presetOptions = computed(() => {
  return presets.value?.map(preset => ({ text: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`, value: preset.presetName }))
})

const preset = computed(() => app.args.preset === undefined ? undefined : presets.value?.find(p => p.presetName === app.args.preset))

const needSpecies = computed(() => app.args.preset === undefined ? undefined : presets.value?.find(p => p.presetName === app.args.preset))

</script>

<template>
  <div class="container">
    <pl-dropdown :options="inputOptions ?? []" v-model="args.model.input" label="Select dataset" clearable />
    <pl-dropdown :options="presetOptions ?? []" v-model="args.model.preset" label="Select preset" clearable />
    <pre>{{ preset }}</pre>
  </div>
</template>

<style lang="css">
button {
  padding: 12px 0;
}

.container {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  gap: 24px;
}
</style>
