<script setup lang="ts">
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { AgGridVue } from '@ag-grid-community/vue3';

import { useApp } from './app';
import { computed, reactive, shallowRef, watch } from 'vue';
import {
    ColDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
} from '@ag-grid-community/core';
import { ReactiveFileContent, PlBtnGhost, PlTextField, PlSlideModal, PlBlockPage } from '@platforma-sdk/ui-vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

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
        headerName: "Progress"
    },
    {
        colId: 'aligned',
        field: 'aligned',
        headerName: "Aligned"
    }
]);

type MiXCRResultRow = {
    id: string,
    label: string,
    progress: string,
    aligned?: number,
}

const rowData = computed<MiXCRResultRow[] | undefined>(() =>
    results?.value?.map(r => ({
        id: r.sampleId,
        label: r.label,
        progress: r.progress,
        aligned: r?.reports?.["align"]?.["aligned"] as number
    }))
);

watch(rowData, rd => {
    console.dir(rd, { depth: 5 })
}, { immediate: true })

const gridOptions: GridOptions<MiXCRResultRow> = {
    getRowId: (row) => row.data.id,
};

const data = reactive({
    settingsOpen: false,
    value: ""
})

</script>

<template>
    <PlBlockPage>
        <template #title>Samples & Metadata</template>
        <template #append>
            <PlBtnGhost :icon="'settings-2'" @click.stop="() => data.settingsOpen = true">Clear</PlBtnGhost>
        </template>
        <div class="container">
            <div class="ag-theme-quartz" :style="{ height: '300px' }">
                <ag-grid-vue :style="{ height: '100%' }" @grid-ready="onGridReady" :rowData="rowData"
                    :columnDefs="columnDefs" :grid-options="gridOptions">
                </ag-grid-vue>
            </div>
        </div>
    </PlBlockPage>
    <PlSlideModal v-model="data.settingsOpen" width="50%">
        <template #title>Settings</template>
        <PlTextField label="Paramter" v-model="data.value" />
        <!-- <PlContainer :style="{ marginTop: '40px', marginLeft: '5px', marginRight: '5px' }">
            <PlTextField label="Dataset Name" @update:model-value="v => dataset.update(ds => ds.label = v ?? '')"
                :model-value="dataset.value.label" />
            <PlCheckbox :model-value="dataset.value.content.gzipped"
                @update:model-value="v => dataset.update(ds => ds.content.gzipped = v)">
                Gzipped
            </PlCheckbox>
            <PlBtnGroup :model-value="currentReadIndices" @update:model-value="setReadIndices"
                :options="readIndicesOptions" />
            <PlBtnPrimary icon="clear" @click="() => data.deleteModalOpen = true">Delete Dataset</PlBtnPrimary>
        </PlContainer> -->
    </PlSlideModal>
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
