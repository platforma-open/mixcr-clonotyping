<script setup lang="ts">
import type { PlId } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { computed, reactive, watch } from "vue";
import { MiXCRResultsMap } from "./results";
import { debouncedRef } from "@vueuse/core";
import SampleReportPanelLogs from "./SampleReportPanelLogs.vue";
import type { SimpleOption } from "@platforma-sdk/ui-vue";
import { PlBtnGroup } from "@platforma-sdk/ui-vue";
import SampleReportPanelReports from "./SampleReportPanelReports.vue";
import SampleReportPanelQc from "./SampleReportPanelQc.vue";
import SampleReportPanelVisualReport from "./SampleReportPanelVisualReport.vue";
import SampleReportPanelResources from "./SampleReportPanelResources.vue";
import { useApp } from "./app";

const app = useApp();

const sampleId = defineModel<PlId | undefined>();

const resultMap = debouncedRef(MiXCRResultsMap, 300);
const sampleData = computed(() => {
  if (sampleId.value === undefined || resultMap.value === undefined) return undefined;
  return resultMap.value.get(sampleId.value);
});

type TabId = "visualReport" | "qc" | "logs" | "reports" | "resources";

const data = reactive<{
  currentTab: TabId;
}>({
  currentTab: "visualReport",
});

// The Resources tab is a debug view: it shows only while the block reports step requests.
const showResources = computed(() => app.model.data.reportStepRequests === true);

const tabOptions = computed<SimpleOption<TabId>[]>(() => [
  { value: "visualReport", text: "Visual Report" },
  { value: "qc", text: "Quality Checks" },
  { value: "logs", text: "Log" },
  { value: "reports", text: "Reports" },
  ...(showResources.value ? [{ value: "resources" as const, text: "Resources" }] : []),
]);

// Turning the report off while the tab is open leaves no tab selected; fall back to the first.
watch(showResources, (shown) => {
  if (!shown && data.currentTab === "resources") data.currentTab = "visualReport";
});
</script>

<template>
  <PlBtnGroup v-model="data.currentTab" :options="tabOptions" />
  <div v-if="sampleId !== undefined && sampleData !== undefined" class="pl-scrollable">
    <SampleReportPanelVisualReport
      v-if="data.currentTab === 'visualReport'"
      :sample-data="sampleData"
    />
    <SampleReportPanelQc v-if="data.currentTab === 'qc'" :sample-data="sampleData" />
    <SampleReportPanelLogs
      v-else-if="data.currentTab === 'logs'"
      :key="sampleId"
      :sample-data="sampleData"
    />
    <SampleReportPanelReports v-else-if="data.currentTab === 'reports'" :sample-id="sampleId" />
    <SampleReportPanelResources
      v-else-if="data.currentTab === 'resources' && showResources"
      :key="sampleId"
      :sample-id="sampleId"
      :sample-data="sampleData"
    />
  </div>
  <div v-else>No sample selected</div>
</template>

<style lang="css" scoped>
.pl-scrollable {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  padding: 0 6px;
  margin: 0 -6px;
}
</style>
