<script setup lang="ts">
import { MiXCRResult } from './results';
import AlignmentRow from './components/AlignmentRow.vue';
import ChainRow from './components/ChainRow.vue';

defineProps<{
    sampleData: MiXCRResult
}>();
</script>

<template>
    <h4>Alignments</h4>
    <AlignmentRow size="large" :align-report="sampleData.alignReport" />
    <h4>Chain Usage</h4>
    <ChainRow size="large" :align-report="sampleData.alignReport" />
</template>
