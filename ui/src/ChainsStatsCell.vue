<script setup lang="ts">
import { ICellRendererParams } from 'ag-grid-enterprise';
import ChainRow from './components/ChainRow.vue';
import { MiXCRResult } from './results';

defineProps<{
    params: ICellRendererParams<MiXCRResult>;
}>();
</script>

<template>
    <ChainRow style="height: 100%;" :align-report="params.data?.alignReport" />
</template>
