<script setup lang="ts">
import { platforma, ProgressPrefix } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { useApp } from './app';
import { PlDropdown, PlTextArea, PlBlockPage, PlProgressBar } from '@platforma-sdk/ui-vue';
import { computed, ref, watch } from 'vue';
import { useTimeoutPoll } from '@vueuse/core';
import { AnyLogHandle } from '@platforma-sdk/model';

const app = useApp();

const done = computed(() => {
  const v = app.getOutputFieldOkOptional("done")
  if (v === undefined)
    return undefined;
  return new Set(v);
})

const currentLogKey = ref<string>("")
const logs = computed(() => app.outputValues.logs)
const sampleOptionsForLogs = computed(() => {
  if (app.outputValues.sampleLabels === undefined)
    return undefined;
  const entries = Object.entries(app.outputValues.sampleLabels) as [string, string][];
  entries.sort((a, b) => a[1].localeCompare(b[1]))
  return entries.map(e => {
    const sampleId = e[0];
    const sampleLabel = e[1];
    // proegress value exists === analysis for sample was started
    const started = app.outputValues.progress?.data?.find(l => l.key[0] === sampleId && l.value !== undefined) !== undefined;
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

</script>

<template>
  <PlDropdown :options="sampleOptionsForLogs ?? []" v-model="currentLogKey" label="Show log for..." />
  <PlTextArea :model-value="logState?.lines" :rows="30" readonly />
</template>
