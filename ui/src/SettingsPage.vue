<script setup lang="ts">
import { platforma, ProgressPrefix } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { useApp } from './app';
import { PlDropdown, PlTextArea } from '@milaboratories/uikit';
import { computed, ref, watch } from 'vue';
import { asyncComputed, useTimeoutPoll } from '@vueuse/core';
import { AnyLogHandle } from '@platforma-sdk/model';

const app = useApp();

const inputOptions = computed(() =>
  app.getOutputFieldOkOptional("inputOptions")?.map((v) => ({
    text: v.label,
    value: v.ref,
  }))
);

const args = app.createArgsModel();

const presets = computed(() => app.getOutputFieldOkOptional("presets"))

const presetOptions = computed(() => {
  return presets.value?.map(preset => ({ text: `${preset.label}${preset.vendor ? ' - ' + preset.vendor : ''}`, value: preset.presetName }))
})

const preset = computed(() => app.args.preset === undefined ? undefined : presets.value?.find(p => p.presetName === app.args.preset))
const needSpecies = computed(() => preset.value === undefined ? undefined : (preset.value.requiredFlags.findIndex(f => f === 'species') >= 0))

const progress = computed(() => app.getOutputFieldOkOptional("progress"))
const sampleLabels = computed(() => app.getOutputFieldOkOptional("sampleLabels"))
const done = computed(() => {
  const v = app.getOutputFieldOkOptional("done")
  if (v === undefined)
    return undefined;
  return new Set(v);
})

const currentLogKey = ref<string>("")
const logs = computed(() => app.getOutputFieldOkOptional("logs"))
const sampleOptionsForLogs = computed(() => {
  if (sampleLabels.value === undefined)
    return undefined;
  const entries = Object.entries(sampleLabels.value) as [string, string][];
  entries.sort((a, b) => a[1].localeCompare(b[1]))
  return entries.map(e => {
    const sampleId = e[0];
    const sampleLabel = e[1];
    // proegress value exists === analysis for sample was started
    const started = progress.value?.data?.find(l => l.key[0] === sampleId && l.value !== undefined) !== undefined;
    const finished = done.value?.has(sampleId) === true;
    const status = started ? finished ? " [Finished]" : " [Running]" : ""
    return {
      value: sampleId,
      text: sampleLabel + status,
    };
  })
})

const logHandle = computed(() => {
  if (currentLogKey.value === undefined)
    return undefined;
  return logs.value?.data?.find(l => l.key[0] === currentLogKey.value && l.value !== undefined)?.value;
})

type LogState = {
  logHandle: AnyLogHandle,
  lines: string,
  lastOffset: number,
  finished: boolean
}

const logState = ref<LogState>()

// from here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchLogs() {
  let currentLogState: LogState | undefined = logState.value;
  if (currentLogState === undefined)
    return;

  while (true) {
    const result = await platforma.logDriver.readText(currentLogState.logHandle, 100, currentLogState.lastOffset)

    if (result.shouldUpdateHandle)
      return;

    if (currentLogState.logHandle !== logState.value?.logHandle)
      // somebody changed target log while we were fetching log data
      return;

    const newLines = (new TextDecoder().decode(result.data)).replace(new RegExp(`${escapeRegExp(ProgressPrefix)}`, 'g'), '')
    currentLogState = { ...currentLogState, lines: currentLogState.lines + newLines, lastOffset: result.newOffset, finished: !result.live }
    if (result.newOffset >= result.size)
      break
  }

  logState.value = currentLogState;
}

// Only trigger after last fetch is done
const { pause: pauseFetchingLogs, resume: resumeFetchingLogs } = useTimeoutPoll(fetchLogs, 1500, { immediate: false })

watch(logState, () => {
  if (logState.value?.finished) pauseFetchingLogs();
})

watch(logHandle, (lh) => {
  if (lh === undefined) {
    logState.value = undefined;
    pauseFetchingLogs()
    return;
  }

  if (lh !== logState?.value?.logHandle) {
    logState.value = { logHandle: lh, lastOffset: 0, lines: "", finished: false };
    resumeFetchingLogs();
  }
}, { immediate: true })

//  = computed(() => {


// })

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
  <div class="container">
    <pl-dropdown :options="inputOptions ?? []" v-model="args.model.input" label="Select dataset" clearable />
    <pl-dropdown :options="presetOptions ?? []" v-model="args.model.preset" label="Select preset" clearable />
    <pl-dropdown v-if="needSpecies" :options="speciesOptions" v-model="args.model.species" label="Select species" />
    <pl-dropdown :options="sampleOptionsForLogs ?? []" v-model="currentLogKey" label="Show log for..." />
    <pl-text-area :model-value="logState?.lines" :rows="30" readonly />
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
