<script setup lang="ts">
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { AgGridVue } from '@ag-grid-community/vue3';

import { platforma } from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { useApp } from './app';
import { ShallowRef, computed, ref, shallowRef, watch } from 'vue';
import {
    ColDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
} from '@ag-grid-community/core';
import { BlobHandleAndSize } from '@milaboratory/sdk-ui';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ProgressPrefix } from '@milaboratory/milaboratories.mixcr-clonotyping.model';

const app = useApp();

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const gridApi = shallowRef<GridApi<any>>();
const onGridReady = (params: GridReadyEvent) => {
    gridApi.value = params.api;
};

type FileHandle = BlobHandleAndSize["handle"];

const fileContents = new Map<FileHandle, ShallowRef<any>>();

function getFileContent(handle: FileHandle | undefined): ShallowRef<any> | undefined {
    if (handle === undefined)
        return undefined;
    const refFromMap = fileContents.get(handle);
    if (refFromMap !== undefined)
        return refFromMap;
    const newRef = shallowRef<any>();
    fileContents.set(handle, newRef);

    // Initiating actual upload
    (async () => {
        try {
            const content = await platforma.blobDriver.getContent(handle);
            newRef.value = JSON.parse(new TextDecoder().decode(content));
        } catch (err: unknown) {
            // ignoring and leaving ref unpopulated
        }
    })()

    return newRef;
}

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

type MiXCRResult = {
    label: string,
    sampleId: string,
    progress: string,
    qc?: any,
    reports: Record<string, any>
}

const results = computed<MiXCRResult[] | undefined>(() => {
    const sampleLabels = app.getOutputFieldOkOptional("sampleLabels")

    // keys for qc's are calculated as soon as input data have locked inputs
    // (as early as possible to tell the list of samples we are analyzing here)
    const qc = app.getOutputFieldOkOptional("qc");
    if (qc === undefined)
        return undefined;

    const progress = app.getOutputFieldOkOptional("progress");
    if (progress === undefined)
        return undefined;

    const doneRaw = app.getOutputFieldOkOptional("done");
    if (doneRaw === undefined)
        return undefined;
    const done = new Set(doneRaw);

    const resultsMap = new Map<string, MiXCRResult>()
    for (const qcData of qc.data) {
        const sampleId = qcData.key[0] as string;
        const result: MiXCRResult = {
            sampleId,
            progress: "",
            label: sampleLabels?.[sampleId] ?? sampleId,
            reports: {}
        }
        resultsMap.set(sampleId, result);
        const qcRef = getFileContent(qcData.value?.handle);
        if (qcRef)
            result.qc = qcRef.value
    }

    for (const p of progress.data) {
        const sampleId = p.key[0] as string;
        if (p?.value)
            resultsMap.get(sampleId)!.progress = done.has(sampleId) ? "Done" : (p.value?.replace(ProgressPrefix, "") ?? "Not started")
    }

    const reports = app.getOutputFieldOkOptional("reports");

    if (reports)
        for (const report of reports.data) {
            const sampleId = report.key[0] as string;
            const reportId = report.key[1] as string;
            if (report.key[2] !== "json")
                continue;
            const reportRef = getFileContent(report.value?.handle);
            if (reportRef?.value)
                resultsMap.get(sampleId)!.reports[reportId] = reportRef?.value
        }

    const results = [...resultsMap.values()];
    results.sort((r1, r2) => r1.label.localeCompare(r2.label))
    return results;
});

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
</script>

<template>
    <div class="container">
        <div class="ag-theme-quartz" :style="{ height: '300px' }">
            <ag-grid-vue :style="{ height: '100%' }" @grid-ready="onGridReady" :rowData="rowData"
                :columnDefs="columnDefs" :grid-options="gridOptions">
            </ag-grid-vue>
        </div>
    </div>
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
