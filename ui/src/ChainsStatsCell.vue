<script setup lang="ts">
import { ICellRendererParams } from 'ag-grid-enterprise';
import { MiXCRResult } from './results';
import ChainRow from './components/ChainRow.vue';

defineProps<{
  params: ICellRendererParams<MiXCRResult>;
}>();
</script>

<template>
  <ChainRow style="height: 100%" :align-report="params.data?.alignReport" />
</template>
