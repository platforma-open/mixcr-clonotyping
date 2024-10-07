<script setup lang="ts">
import { ICellRendererParams } from '@ag-grid-community/core';
import { computed } from 'vue';
import { useApp } from './app';
import { MiXCRResult } from './results';
import { extractAlignmentChannels } from '@platforma-open/milaboratories.mixcr-clonotyping.model/src/reports';
import { AlignmentChannelLabels } from '@platforma-open/milaboratories.mixcr-clonotyping.model';

const app = useApp();

const props = defineProps<{
    params: ICellRendererParams<MiXCRResult>;
}>();

const dummyText = computed(() => {
    const alignReport = props.params.data?.alignReport;
    if (alignReport === undefined) return undefined;
    const alignmentChannels = extractAlignmentChannels(alignReport);

    // with human readable labels
    // return alignmentChannels.map(([c, v]) => `${AlignmentChannelLabels[c]}: ${v}`).join(", ")

    return alignmentChannels.map(([c, v]) => `${c}: ${v}`).join(", ")
})

</script>

<template>
    <div>{{ dummyText }}</div>
</template>
