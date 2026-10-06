<script setup lang="ts">
import { PlAccordion, PlAccordionSection, PlLogView } from "@platforma-sdk/ui-vue";
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
       single view as before the split. A section honours its model-value only inside a
       PlAccordion with `multiple`; standalone it keeps its own closed state. -->
  <PlAccordion v-if="sampleData.logs.length > 1" multiple>
    <PlAccordionSection
      v-for="log in sampleData.logs"
      :key="log.key"
      :label="log.label"
      :model-value="!collapsed[log.key]"
      @update:model-value="collapsed[log.key] = !$event"
    >
      <PlLogView :log-handle="log.handle" />
    </PlAccordionSection>
  </PlAccordion>
  <PlLogView v-else :log-handle="sampleData.logs[0]?.handle" />
</template>
