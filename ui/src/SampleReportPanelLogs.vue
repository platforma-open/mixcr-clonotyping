<script setup lang="ts">
import { PlLogView } from '@platforma-sdk/ui-vue';
import { MiXCRResult } from './results';

defineProps<{
    sampleData: MiXCRResult
}>();
</script>

<template>
    <PlLogView :log-handle="sampleData.logHandle" />
</template>
