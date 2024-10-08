<script lang="ts" setup>
import { AlignmentChannelLabels, AlignmentChannelColors, AlignReport } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { extractAlignmentChannels } from '@platforma-open/milaboratories.mixcr-clonotyping.model/src/reports';
import { computed } from 'vue';
import * as json from '../debug/alignerReport.json';
import StackedRow from './StackedRow.vue';
import AlignmentLegend from '../components/AlignmentLegend.vue';

const props = defineProps<{
  alignReport?: AlignReport;
  size?: 'large';
  showFractionInLabel?: boolean;
}>();

const options = computed(() => {
    const alignReport = props.alignReport;
    if (alignReport === undefined) return [];
    const alignmentChannels = extractAlignmentChannels(alignReport);

    return alignmentChannels.map(([channel, value]) => {
        return {
            channel,
            value,
        };
    });
});

const parts = computed(() => {
  const parts = options.value || [];
  return parts.map((p) => {
    return {
      color: AlignmentChannelColors[p.channel] ?? '#000',
      value: p.value,
      label: AlignmentChannelLabels[p.channel],
    };
  });
});

const legends = computed(() => parts.value.map(p => ({
  color: p.color,
  text: p.label
})));
</script>

<template>
  <StackedRow :size="size" :value="parts"/>
  <AlignmentLegend v-if="size === 'large' && legends.length" :legends="legends" />
</template>
