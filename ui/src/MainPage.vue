<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import type { PlId, Qc } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import {
  PlBlockPage,
  PlBtnGhost,
  PlMaskIcon24,
  PlSlideModal,
  PlAgCellStatusTag,
  useAgGridOptions,
} from '@platforma-sdk/ui-vue';
import { refDebounced, whenever } from '@vueuse/core';
import { reactive, watch } from 'vue';
import { useApp } from './app';
import type { MiXCRResult } from './results';
import { MiXCRResultsFull } from './results';
import SampleReportPanel from './SampleReportPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import { getAlignmentChartSettings } from './charts/alignmentChartSettings';
import { getChainsChartSettings } from './charts/chainsChartSettings';
import { PlAgChartStackedBarCell } from '@platforma-sdk/ui-vue';
import { parseProgressString } from './parseProgress';

const app = useApp();

// @TODO
const result = refDebounced(MiXCRResultsFull, 100, {
  maxWait: 200,
});

const data = reactive<{
  settingsOpen: boolean;
  sampleReportOpen: boolean;
  selectedSample: PlId | undefined;
}>({
  settingsOpen: app.model.outputs.started === false,
  sampleReportOpen: false,
  selectedSample: undefined,
});

watch(
  () => app.model.outputs.started,
  (newVal, oldVal) => {
    if (oldVal === false && newVal === true) data.settingsOpen = false;
    if (oldVal === true && newVal === false) data.settingsOpen = true;
  },
);

whenever(
  () => data.settingsOpen,
  () => (data.sampleReportOpen = false),
);
whenever(
  () => data.sampleReportOpen,
  () => (data.settingsOpen = false),
);

const qcPriority = { OK: 0, WARN: 1, ALERT: 2 };

const { gridOptions } = useAgGridOptions<MiXCRResult>(({ column }) => ({
  defaultColumnDef: {
    suppressHeaderMenuButton: true,
    lockPinned: true,
    sortable: false,
  },
  rowNumbersColumn: true,
  notReady: result.value === undefined, // not true, but it seems like it was there
  rowData: result.value, // @TODO (there is a bug in ag grid probably for 'undefined value')
  getRowId: (row) => row.data.sampleId,
  onRowDoubleClicked: (e) => {
    data.selectedSample = e.data?.sampleId;
    data.sampleReportOpen = data.selectedSample !== undefined;
  },
  columnDefs: [
    {
      field: 'label',
      headerName: 'Sample',
      pinned: 'left',
      lockPinned: true,
      sortable: true,
      textWithButton: true, // This is probably not good and it is better to use some overridden typed cellRenderer: 'TextWithButton' | 'SomethingElse' | (cellData) => ....
    },
    // At this point we should pass a parameter of type (And instead of column you can use builder)
    column<string>({
      field: 'progress',
      headerName: 'Progress',
      progress(value) {
        const parsed = parseProgressString(value); // now its string

        if (parsed.stage === 'Queued') {
          return {
            status: 'not_started',
            text: parsed.stage,
          };
        }

        return {
          status: parsed.stage === 'Done' ? 'done' : 'running',
          percent: parsed.percentage,
          text: parsed.stage,
          suffix: parsed.etaLabel ?? '',
        };
      },
    }),
    {
      field: 'qc',
      width: 96,
      cellRendererSelector: (cellData) => {
        const type = cellData.data?.qc?.reduce(
          (result: Qc[number]['status'], item) =>
            qcPriority[item.status] > qcPriority[result] ? item.status : result,
          'OK',
        );
        return {
          component: PlAgCellStatusTag,
          params: { type },
        };
      },
      headerName: 'Quality',
      noGutters: true, // this means "no padding" i. e. --ag-cell-horizontal-padding: 0px & --ag-cell-vertical-padding: 0px
    },
    {
      colId: 'alignmentStats',
      headerName: 'Alignments',
      flex: 1,
      cellStyle: {
        '--ag-cell-horizontal-padding': '12px',
      },
      cellRendererSelector: (cellData) => {
        const value = getAlignmentChartSettings(cellData.data?.alignReport);
        return {
          component: PlAgChartStackedBarCell,
          params: { value },
        };
      },
    },
    {
      colId: 'chainsStats',
      headerName: 'Chains',
      flex: 1,
      cellStyle: {
        '--ag-cell-horizontal-padding': '12px',
      },
      cellRendererSelector: (cellData) => {
        const value = getChainsChartSettings(cellData.data?.alignReport);
        return {
          component: PlAgChartStackedBarCell,
          params: { value },
        };
      },
    },
  ],
}));

</script>

<template>
  <PlBlockPage>
    <template #title>MiXCR Clonotyping</template>
    <template #append>
      <PlBtnGhost @click.stop="() => (data.settingsOpen = true)">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
    <div :style="{ flex: 1 }">
      <AgGridVue
        :style="{ height: '100%' }"
        v-bind="gridOptions"
      />
    </div>
  </PlBlockPage>
  <PlSlideModal
    v-model="data.settingsOpen"
    :shadow="true"
    :close-on-outside-click="app.model.outputs.started"
  >
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
  <PlSlideModal
    v-model="data.sampleReportOpen"
    :close-on-outside-click="app.model.outputs.started"
    width="80%"
  >
    <template #title>
      Results for
      {{
        (data.selectedSample ? app.model.outputs.sampleLabels?.[data.selectedSample] : undefined) ??
          '...'
      }}
    </template>
    <SampleReportPanel v-model="data.selectedSample" />
  </PlSlideModal>
</template>
