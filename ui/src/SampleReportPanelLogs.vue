<script setup lang="ts">
import { useApp } from './app';
import Log from './Log.vue';
import { MiXCRResult } from './results';

const props = defineProps<{
    sampleData: MiXCRResult
}>()

const app = useApp();

</script>

<template>
    <Log :handle="props.sampleData.logHandle" />
</template>
