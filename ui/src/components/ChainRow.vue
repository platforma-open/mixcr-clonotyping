<script lang="ts" setup>
import { AlignReport, ImmuneChains } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { AlignmentChainColors } from '@platforma-open/milaboratories.mixcr-clonotyping.model/src/reports';
import { computed } from 'vue';
import StackedRow from './StackedRow.vue';
import { pick } from '@milaboratories/helpers';
import AlignmentLegend from '../components/AlignmentLegend.vue';

const props = defineProps<{
  alignReport?: AlignReport;
  size?: 'large';
  showFractionInLabel?: boolean;
}>();

const parts = computed(() => props.alignReport === undefined ? [] : ImmuneChains.flatMap(chain => {
  const s = props.alignReport?.chainUsage.chains[chain];
  if (!s) {
    return [];
  }

  return Object.entries(pick(s, 'total', 'hasStops', 'isOOF')).map(([key, value]) => {
    return {
      color: AlignmentChainColors[chain]?.[key as 'total' | 'hasStops' | 'isOOF'] ?? '#000',
      label: chain + `(${key}): ${value}`,
      value,
    };
  });
}));

const legends = computed(() => parts.value.map(p => ({
  color: p.color,
  text: p.label
})));
</script>

<template>
  <StackedRow :size="size" :value="parts" />
  <AlignmentLegend v-if="size === 'large'" :legends="legends" />
</template>
