<script setup lang="ts">
import { PlId } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { useApp } from './app';
import { computed, reactive } from 'vue';
import { MiXCRResultsMap } from './results';
import { debouncedRef } from '@vueuse/core';
import SampleReportPanelLogs from './SampleReportPanelLogs.vue';
import { PlBtnGroup, SimpleOption } from '@platforma-sdk/ui-vue';
import SampleReportPanelReports from './SampleReportPanelReports.vue';
import SampleReportPanelQc from './SampleReportPanelQc.vue';
import SampleReportPanelVisualReport from './SampleReportPanelVisualReport.vue';

const sampleId = defineModel<PlId | undefined>()

const app = useApp();
const resultMap = debouncedRef(MiXCRResultsMap, 300);
const sampleData = computed(() => {
  if (sampleId.value === undefined || resultMap.value === undefined) return undefined;
  return resultMap.value.get(sampleId.value);
})

type TabId = "visualReport" | "qc" | "logs" | "reports";

const data = reactive<{
  currentTab: TabId
}>({
  currentTab: 'qc'
})

const tabOptions: SimpleOption<TabId>[] = [
  { value: 'visualReport', text: 'Visual Report' },
  { value: 'qc', text: 'Quality Checks' },
  { value: 'logs', text: 'Log' },
  { value: 'reports', text: 'Reports' },
]
</script>

<template>
  <PlBtnGroup :options="tabOptions" v-model="data.currentTab" />
  <div v-if="sampleId !== undefined && sampleData !== undefined">
    <SampleReportPanelVisualReport v-if="data.currentTab === 'visualReport'" :sample-data="sampleData" />
    <SampleReportPanelQc v-if="data.currentTab === 'qc'" :sample-data="sampleData" />
    <SampleReportPanelLogs v-else-if="data.currentTab === 'logs'" :sample-data="sampleData" />
    <SampleReportPanelReports v-else-if="data.currentTab === 'reports'" :sample-id="sampleId" />
  </div>
  <div v-else>No sample selected</div>
</template>
