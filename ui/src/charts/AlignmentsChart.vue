<script setup lang="ts">
import type { AlignReport } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import {
  PlChartStackedBar,
} from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useAlignmentChartSettings } from './alignmentChartSettings';

const props = defineProps<{
  alignReport?: AlignReport;
}>();

const alignReport = computed(() => props.alignReport);

const settings = useAlignmentChartSettings(alignReport);
</script>

<template>
  <PlChartStackedBar :settings="settings" />
</template>
