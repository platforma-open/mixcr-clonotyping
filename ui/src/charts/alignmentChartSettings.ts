import type { Ref } from 'vue';
import { computed, unref } from 'vue';
import type { AlignReport } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { AlignmentChannelLabels } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { extractAlignmentChannels } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import type {
  Color,
} from '@platforma-sdk/ui-vue';
import {
  Gradient,
} from '@platforma-sdk/ui-vue';
import { call } from '@milaboratories/helpers';

type Category = keyof typeof AlignmentChannelLabels;

export function getAlignmentChartSettings(alignReport: AlignReport | undefined) {
  const data = call(() => {
    if (alignReport === undefined) return [];

    const alignmentChannels = extractAlignmentChannels(alignReport);

    return alignmentChannels.map(([category, value]) => {
      return {
        category,
        value,
      };
    });
  });

  const total = data.reduce((x, y) => x + y.value, 0);

  // Note: I'll create a "Color Palette" page in the ui-examples block to make it clear how to choose colors

  const viridis = Gradient('viridis');

  const magma = Gradient('magma');

  const categoryColors = {
    Success: viridis.getNthOf(2, 5),
    NoHits: magma.getNthOf(1, 9),
    NoCDR3Parts: magma.getNthOf(2, 9),
    NoVHits: magma.getNthOf(3, 9),
    NoJHits: magma.getNthOf(4, 9),
    VAndJOnDifferentTargets: magma.getNthOf(5, 9),
    LowTotalScore: magma.getNthOf(6, 9),
    NoBarcode: magma.getNthOf(7, 9),
    SampleNotMatched: magma.getNthOf(8, 9),
    FailedAfterAOverlap: magma.getNthOf(9, 9),
  } satisfies Record<Category, Color>;

  return {
    title: 'Alignments',
    data: data.map(({ category, value }) => {
      const color = categoryColors[category];
      return {
        label: AlignmentChannelLabels[category],
        value,
        color,
        description: [AlignmentChannelLabels[category], 'Fraction:' + (Math.round(value * 100 / total)) + '%'].join('\n'),
      };
    }),
  };
}

export function useAlignmentChartSettings(alignReportRef: Ref<AlignReport | undefined>) {
  return computed(() => {
    const alignReport = unref(alignReportRef);

    return getAlignmentChartSettings(alignReport);
  });
}
