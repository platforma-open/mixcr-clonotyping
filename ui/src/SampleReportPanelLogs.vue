<script setup lang="ts">
import { PlAccordionSection, PlLogView } from "@platforma-sdk/ui-vue";
import { reactive } from "vue";
import type { MiXCRResult } from "./results";

defineProps<{
  sampleData: MiXCRResult;
}>();

// Every step's section opens by default; the user collapses the ones read.
const collapsed = reactive<Record<string, boolean>>({});
</script>

<template>
  <!-- One section per MiXCR step, in run order. A sample with one log, or none yet, shows the
       single view as before the split. -->
  <template v-if="sampleData.logs.length > 1">
    <PlAccordionSection
      v-for="log in sampleData.logs"
      :key="log.key"
      :label="log.label"
      :model-value="!collapsed[log.key]"
      @update:model-value="collapsed[log.key] = !$event"
    >
      <PlLogView :log-handle="log.handle" />
    </PlAccordionSection>
  </template>
  <PlLogView v-else :log-handle="sampleData.logs[0]?.handle" />
</template>
