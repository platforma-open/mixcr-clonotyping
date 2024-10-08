<script setup lang="ts">
import { computed } from 'vue';
import { useApp } from './app';
import { MiXCRResult } from './results';

const props = defineProps<{
    sampleData: MiXCRResult
}>()

const app = useApp();

const qc = computed(() => props.sampleData.qc)

</script>

<template>
    <pre class="pl-scrollable" style="max-height: 400px;">
        {{ qc }}
    </pre>
</template>
