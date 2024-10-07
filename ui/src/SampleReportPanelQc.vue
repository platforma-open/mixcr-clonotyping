<script setup lang="ts">
import { useApp } from './app';
import { MiXCRResult } from './results';

const props = defineProps<{
    sampleData: MiXCRResult
}>()

const app = useApp();

</script>

<template>
    <pre>
        {{ props.sampleData.qc }}
    </pre>
</template>
