<script setup lang="ts">
import { ICellRendererParams } from 'ag-grid-enterprise';
import { MiXCRResult } from './results';
import AlignmentRow from './components/AlignmentRow.vue';

defineProps<{
  params: ICellRendererParams<MiXCRResult>;
}>();
</script>

<template>
  <AlignmentRow style="height: 100%" :align-report="params.data?.alignReport" />
</template>
