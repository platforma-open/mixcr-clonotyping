<script lang="ts" setup>
import { AlignReport } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { computed } from 'vue';
import { PlChartStackedBar } from '@platforma-sdk/ui-vue';
import { useChainsChartSettings } from './chainsChartSettings';

const props = defineProps<{
  alignReport?: AlignReport;
}>();

const alignReport = computed(() => props.alignReport);

const settings = useChainsChartSettings(alignReport);
</script>

<template>
  <PlChartStackedBar :settings="settings" />
</template>
