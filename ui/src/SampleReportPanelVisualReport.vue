<script setup lang="ts">
import { MiXCRResult } from './results';
import AlignmentsChart from './charts/AlignmentsChart.vue';
import ChainsChart from './charts/ChainsChart.vue';

defineProps<{
    sampleData: MiXCRResult
}>();
</script>

<template>
    <AlignmentsChart :align-report="sampleData.alignReport" />
    <ChainsChart :align-report="sampleData.alignReport" />
</template>
