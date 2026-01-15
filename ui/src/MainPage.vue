<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';

import type { PlId, Qc } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { plRefsEqual, type ImportFileHandle } from '@platforma-sdk/model';
import type { PlAgHeaderComponentParams } from '@platforma-sdk/ui-vue';
import {
  AgGridTheme,
  PlAgCellStatusTag,
  PlAgChartStackedBarCell,
  PlAgOverlayLoading,
  PlAgOverlayNoRows,
  PlAgTextAndButtonCell,
  PlBlockPage,
  PlBtnGhost,
  PlMaskIcon24,
  PlSlideModal,
  autoSizeRowNumberColumn,
  createAgGridColDef,
  makeRowNumberColDef,
  PlBtnExportArchive,
  type FileExportEntry,
} from '@platforma-sdk/ui-vue';
import { refDebounced, whenever } from '@vueuse/core';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-enterprise';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-enterprise';
import { computed, reactive, shallowRef, watch, watchEffect } from 'vue';
import { useApp } from './app';
import { getAlignmentChartSettings } from './charts/alignmentChartSettings';
import { getChainsChartSettings } from './charts/chainsChartSettings';
import { parseProgressString } from './parseProgress';
import type { MiXCRResult } from './results';
import { MiXCRResultsFull } from './results';
import SampleReportPanel from './SampleReportPanel.vue';
import SettingsPanel from './SettingsPanel.vue';

const app = useApp();

// updating defaultBlockLabel
watchEffect(() => {
  const parts: string[] = [];
  // Add dataset name if available
  if (app.model.args.input) {
    const inputOption = app.model.outputs.inputOptions?.find((p) => app.model.args.input && plRefsEqual(p.ref, app.model.args.input));
    if (inputOption?.label) {
      parts.push(inputOption.label);
    }
  }
  // Add chains if available
  if (app.model.args.chains && app.model.args.chains.length > 0) {
    parts.push(app.model.args.chains.join(', '));
  }
  app.model.args.defaultBlockLabel = parts.filter(Boolean).join(' - ');
});

// @TODO
const result = refDebounced(MiXCRResultsFull, 100, {
  maxWait: 200,
});

// Export archive configuration
const fileExports = computed(() => {
  const rawTsvs = app.model.outputs.rawTsvs;
  const sampleLabels = app.model.outputs.sampleLabels;

  if (!rawTsvs || !sampleLabels) {
    return undefined;
  }

  const exports: FileExportEntry[] = [];

  for (const pCol of rawTsvs) {
    for (const { key, value } of pCol.data) {
      if (value) {
        const fileName = `${sampleLabels[key[0]]}_${pCol.id}.tsv`;
        exports.push({
          importHandle: `${key[0]}_${pCol.id}` as ImportFileHandle,
          blobHandle: value,
          fileName,
        });
      }
    }
  }

  return exports;
});

const exportSuggestedFileName = computed(() => {
  const date = new Date().toISOString().split('T')[0];
  const title = app.model.args.title ?? 'Untitled';
  return `${date}_ClonotypingResultsRaw_${title}.zip`;
});

const exportDisabled = computed(() => {
  return !app.model.outputs.rawTsvs || !app.model.outputs.sampleLabels;
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

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const qcPriority = { OK: 0, WARN: 1, ALERT: 2 };

const gridApi = shallowRef<GridApi>();
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
  autoSizeRowNumberColumn(params.api);
};

const defaultColumnDef: ColDef = {
  suppressHeaderMenuButton: true,
  lockPinned: true,
  sortable: false,
};

const columnDefs: ColDef<MiXCRResult>[] = [
  makeRowNumberColDef(),
  createAgGridColDef<MiXCRResult, string>({
    colId: 'label',
    field: 'label',
    headerName: 'Sample',
    headerComponentParams: { type: 'Text' } satisfies PlAgHeaderComponentParams,
    pinned: 'left',
    lockPinned: true,
    sortable: true,
    cellRenderer: PlAgTextAndButtonCell,
    cellRendererParams: {
      invokeRowsOnDoubleClick: true,
    },
  }),
  createAgGridColDef<MiXCRResult, string>({
    colId: 'progress',
    field: 'progress',
    headerName: 'Progress',
    headerComponentParams: { type: 'Progress' } satisfies PlAgHeaderComponentParams,
    progress(cellData) {
      const parsed = parseProgressString(cellData);

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
  createAgGridColDef({
    colId: 'qc',
    field: 'qc',
    width: 126,
    cellRendererSelector: (cellData) => {
      const type = (cellData.data?.qc as MiXCRResult['qc'])?.reduce(
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
    headerComponentParams: { type: 'Text' } satisfies PlAgHeaderComponentParams,
    noGutters: true, // this means "no padding" i. e. --ag-cell-horizontal-padding: 0px & --ag-cell-vertical-padding: 0px
  }),
  createAgGridColDef<MiXCRResult, string>({
    colId: 'alignmentStats',
    headerName: 'Alignments',
    headerComponentParams: { type: 'Text' } satisfies PlAgHeaderComponentParams,
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
  }),
  createAgGridColDef<MiXCRResult, string>({
    colId: 'chainsStats',
    headerName: 'Chains',
    headerComponentParams: { type: 'Text' } satisfies PlAgHeaderComponentParams,
    flex: 1,
    cellStyle: {
      '--ag-cell-horizontal-padding': '12px',
      // '--ag-cell-horizontal-border': 'solid rgb(150, 150, 200);',
      // 'border-width': '0'
    },
    cellRendererSelector: (cellData) => {
      const value = getChainsChartSettings(cellData.data?.alignReport);
      return {
        component: PlAgChartStackedBarCell,
        params: { value },
      };
    },
  }),
];

const gridOptions: GridOptions<MiXCRResult> = {
  getRowId: (row) => row.data.sampleId,
  onRowDoubleClicked: (e) => {
    data.selectedSample = e.data?.sampleId;
    data.sampleReportOpen = data.selectedSample !== undefined;
  },
  components: {
    PlAgTextAndButtonCell,
  },
};
</script>

<template>
  <PlBlockPage
    title="MiXCR Clonotyping"
  >
    <template #append>
      <PlBtnExportArchive
        :file-exports="fileExports"
        :suggested-file-name="exportSuggestedFileName"
        :disabled="exportDisabled"
        :file-picker-types="[{
          description: 'ZIP files',
          accept: { 'application/zip': ['.zip'] }
        }]"
      >
        Export raw results
      </PlBtnExportArchive>
      <PlBtnGhost @click.stop="() => (data.settingsOpen = true)">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
    <div :style="{ flex: 1 }">
      <AgGridVue
        :theme="AgGridTheme" :style="{ height: '100%' }" :rowData="result" :defaultColDef="defaultColumnDef"
        :columnDefs="columnDefs" :grid-options="gridOptions" :loadingOverlayComponentParams="{ notReady: true }"
        :loadingOverlayComponent="PlAgOverlayLoading" :noRowsOverlayComponent="PlAgOverlayNoRows"
        @grid-ready="onGridReady"
      />
    </div>
  </PlBlockPage>
  <PlSlideModal v-model="data.settingsOpen" :shadow="true" :close-on-outside-click="app.model.outputs.started">
    <template #title>Settings</template>
    <SettingsPanel />
  </PlSlideModal>
  <PlSlideModal v-model="data.sampleReportOpen" :close-on-outside-click="app.model.outputs.started" width="80%">
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
