<script setup lang="ts">
import { AgGridVue } from '@ag-grid-community/vue3';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry
} from '@ag-grid-community/core';
import { PlId } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import {
  AgGridTheme,
  PlAgOverlayLoading,
  PlAgOverlayNoRows,
  PlBlockPage,
  PlBtnGhost,
  PlMaskIcon24,
  PlSlideModal,
  PlAgTextAndButtonCell
} from '@platforma-sdk/ui-vue';
import { refDebounced, whenever } from '@vueuse/core';
import { reactive, shallowRef, watch } from 'vue';
import AlignmentStatsCell from './AlignmentStatsCell.vue';
import { useApp } from './app';
import ChainsStatsCell from './ChainsStatsCell.vue';
import ProgressCell from './ProgressCell.vue';
import { MiXCRResult, MiXCRResultsFull } from './results';
import SampleReportPanel from './SampleReportPanel.vue';
import SettingsPanel from './SettingsPanel.vue';

const app = useApp();

// @TODO
const result = refDebounced(MiXCRResultsFull, 100, {
  maxWait: 200
});

const data = reactive<{
  settingsOpen: boolean;
  sampleReportOpen: boolean;
  selectedSample: PlId | undefined;
}>({
  settingsOpen: app.outputValues.started === false,
  sampleReportOpen: false,
  selectedSample: undefined
});

watch(
  () => app.outputValues.started,
  (newVal, oldVal) => {
    if (oldVal === false && newVal === true) data.settingsOpen = false;
    if (oldVal === true && newVal === false) data.settingsOpen = true;
  }
);

whenever(
  () => data.settingsOpen,
  () => (data.sampleReportOpen = false)
);
whenever(
  () => data.sampleReportOpen,
  () => (data.settingsOpen = false)
);

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const gridApi = shallowRef<GridApi<any>>();
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
};

const defaultColumnDef: ColDef = {
  suppressHeaderMenuButton: true,
  lockPinned: true,
  sortable: false
};

const columnDefs: ColDef[] = [
  {
    colId: 'label',
    field: 'label',
    headerName: 'Sample',
    pinned: 'left',
    lockPinned: true,
    sortable: true,
    cellRenderer: PlAgTextAndButtonCell
  },
  {
    colId: 'progress',
    field: 'progress',
    cellRenderer: 'ProgressCell',
    headerName: 'Progress',
    cellStyle: {
      '--ag-cell-horizontal-padding': '0px',
      '--ag-cell-vertical-padding': '0px'
      // '--ag-cell-horizontal-border': 'solid rgb(150, 150, 200);',
      // 'border-width': '0'
    }
  },
  {
    colId: 'alignmentStats',
    field: 'alignReport',
    cellRenderer: 'AlignmentStatsCell',
    headerName: 'Alignments',
    flex: 1,
    cellStyle: {
      '--ag-cell-horizontal-padding': '12px'
      // '--ag-cell-horizontal-border': 'solid rgb(150, 150, 200);',
      // 'border-width': '0'
    }
  },
  {
    colId: 'chainsStats',
    field: 'alignReport',
    cellRenderer: 'ChainsStatsCell',
    headerName: 'Chains',
    flex: 1,
    cellStyle: {
      '--ag-cell-horizontal-padding': '12px'
      // '--ag-cell-horizontal-border': 'solid rgb(150, 150, 200);',
      // 'border-width': '0'
    }
  }
];

// watch(result, rd => {
//     console.dir(rd, { depth: 5 })
// }, { immediate: true })

const gridOptions: GridOptions<MiXCRResult> = {
  getRowId: (row) => row.data.sampleId,
  onRowDoubleClicked: (e) => {
    data.selectedSample = e.data?.sampleId;
    data.sampleReportOpen = data.selectedSample !== undefined;
  },
  components: {
    AlignmentStatsCell,
    ProgressCell,
    ChainsStatsCell,
    PlAgTextAndButtonCell
  }
};
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
        :theme="AgGridTheme"
        :style="{ height: '100%' }"
        :rowData="result"
        :defaultColDef="defaultColumnDef"
        :columnDefs="columnDefs"
        :grid-options="gridOptions"
        :loadingOverlayComponentParams="{ notReady: true }"
        :loadingOverlayComponent="PlAgOverlayLoading"
        :noRowsOverlayComponent="PlAgOverlayNoRows"
        @grid-ready="onGridReady"
      />
    </div>
  </PlBlockPage>
  <PlSlideModal
    v-model="data.settingsOpen"
    :shadow="true"
    :close-on-outside-click="app.outputValues.started"
  >
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
  <PlSlideModal
    v-model="data.sampleReportOpen"
    :close-on-outside-click="app.outputValues.started"
    width="80%"
  >
    <template #title>
      Results for
      {{
        (data.selectedSample ? app.outputValues.sampleLabels?.[data.selectedSample] : undefined) ??
        '...'
      }}
    </template>
    <SampleReportPanel v-model="data.selectedSample" />
  </PlSlideModal>
</template>
