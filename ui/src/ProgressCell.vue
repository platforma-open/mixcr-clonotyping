<script setup lang="ts">
import { ICellRendererParams } from '@ag-grid-community/core';
import { computed } from 'vue';
import { useApp } from './app';
import { MiXCRResult } from './results';
import { extractAlignmentChannels } from '@platforma-open/milaboratories.mixcr-clonotyping.model/src/reports';

const app = useApp();

const props = defineProps<{
    params: ICellRendererParams<MiXCRResult>;
}>();

</script>

<template>
    <div>P: {{ params.data?.progress }}</div>
</template>
