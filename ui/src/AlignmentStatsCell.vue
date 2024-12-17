<script setup lang="ts">
import { ICellRendererParams } from 'ag-grid-enterprise';
import AlignmentRow from './components/AlignmentRow.vue';
import { MiXCRResult } from './results';

defineProps<{
    params: ICellRendererParams<MiXCRResult>;
}>();
</script>

<template>
    <AlignmentRow style="height: 100%;" :align-report="params.data?.alignReport" />
</template>
