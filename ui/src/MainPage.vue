<script setup lang="ts">
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { AgGridVue } from '@ag-grid-community/vue3';

import { useApp } from './app';
import { computed, reactive, shallowRef, watch, watchEffect } from 'vue';
import {
    ColDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
} from '@ag-grid-community/core';
import { PlBtnGhost, PlSlideModal, PlBlockPage } from '@platforma-sdk/ui-vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MiXCRResult, MiXCRResultsFull } from './results';
import SettingsPanel from './SettingsPanel.vue';
import { PlId } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import AlignmentStatsCell from './AlignmentStatsCell.vue';
import ProgressCell from './ProgressCell.vue';

const app = useApp();

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const gridApi = shallowRef<GridApi<any>>();
const onGridReady = (params: GridReadyEvent) => {
    gridApi.value = params.api;
};

const columnDefs = computed<ColDef[]>(() => [
    {
        colId: 'label',
        field: 'label',
        headerName: "Sample label"
    },
    {
        colId: 'progress',
        field: 'progress',
        cellRenderer: 'ProgressCell',
        headerName: "Progress"
    },
    {
        colId: 'alignmentStats',
        field: 'alignReport',
        cellRenderer: 'AlignmentStatsCell',
        headerName: "Alignments"
    },
]);

watch(MiXCRResultsFull, rd => {
    console.dir(rd, { depth: 5 })
}, { immediate: true })

const gridOptions: GridOptions<MiXCRResult> = {
    getRowId: (row) => row.data.sampleId,
    components: {
        AlignmentStatsCell,
        ProgressCell
    }
};

const data = reactive<{
    settingsOpen: boolean,
    sampleReportOpen: boolean,
    selectedSample: PlId | undefined
}>({
    settingsOpen: app.outputValues.started === false,
    sampleReportOpen: false,
    selectedSample: undefined,
})

watchEffect(() => { if (data.settingsOpen) data.selectedSample = undefined; })

watch(computed(() => app.outputValues.started), (newVal, oldVal) => {
    if (oldVal === false && newVal === true)
        data.settingsOpen = false;
    if (oldVal === true && newVal === false)
        data.settingsOpen = true;
})

watch(computed(() => data.selectedSample), (newVal, oldVal) => {
    if (oldVal === false && newVal === true)
        data.settingsOpen = false;
    if (oldVal === true && newVal === false)
        data.settingsOpen = true;
})

</script>

<template>
    <PlBlockPage>
        <template #title>MiXCR Clonotyping</template>
        <template #append>
            <PlBtnGhost :icon="'settings-2'" @click.stop="() => data.settingsOpen = true">Settings</PlBtnGhost>
        </template>
        <div v-if="MiXCRResultsFull !== undefined" class="ag-theme-quartz" :style="{ flex: 1 }">
            <ag-grid-vue :style="{ height: '100%' }" @grid-ready="onGridReady" :rowData="MiXCRResultsFull"
                :columnDefs="columnDefs" :grid-options="gridOptions">
            </ag-grid-vue>
        </div>
        <div v-else :style="{ flex: 1 }">
            Not started
        </div>
    </PlBlockPage>
    <PlSlideModal v-model="data.settingsOpen" width="50%" :shadow="true"
        :close-on-outside-click="app.outputValues.started">
        <template #title>Settings</template>
        <SettingsPanel />
    </PlSlideModal>
    <PlSlideModal v-model="data.selectedSample !== undefined" width="50%" :shadow="true"
        :close-on-outside-click="app.outputValues.started">
        <template #title>Settings</template>
        <SettingsPanel />
    </PlSlideModal>
</template>
