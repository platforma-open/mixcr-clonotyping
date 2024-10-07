<script setup lang="ts">
import { computed } from 'vue';
import { useApp } from './app';
import { MiXCRResult } from './results';
import { extractAlignmentChannels, ImmuneChains } from '@platforma-open/milaboratories.mixcr-clonotyping.model/src/reports';

const props = defineProps<{
    sampleData: MiXCRResult
}>()

const app = useApp();

const alignmantStats = computed(() => props.sampleData.alignReport === undefined ? undefined : extractAlignmentChannels(props.sampleData.alignReport))
const chainStats = computed(() => props.sampleData.alignReport === undefined ? undefined : ImmuneChains.map(c => [c, props.sampleData.alignReport!.chainUsage.chains[c]?.total ?? 0] as const))

</script>

<template>
    <pre>
        {{ alignmantStats }}
        {{ chainStats }}
    </pre>
</template>
