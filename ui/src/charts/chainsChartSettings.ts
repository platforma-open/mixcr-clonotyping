import type { Ref } from 'vue';
import { computed, unref } from 'vue';
import type { AlignReport } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { AlignmentChainColors, ImmuneChains } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import type {
  PlChartStackedBarSettings,
} from '@platforma-sdk/ui-vue';
import { pick } from '@milaboratories/helpers';

export function getChainsChartSettings(alignReport: AlignReport | undefined) {
  return {
    title: 'Chains',
    data: alignReport === undefined
      ? []
      : ImmuneChains.flatMap((chain) => {
          const s = alignReport?.chainUsage.chains[chain];

          return s
            ? Object.entries(pick(s, 'total', 'hasStops', 'isOOF')).map(([key, value]) => {
                return {
                  color: AlignmentChainColors[chain]?.[key as 'total' | 'hasStops' | 'isOOF'] ?? '#000',
                  label: chain + `(${key}): ${value}`,
                  value,
                };
              })
            : [];
        }),
  };
}

export function useChainsChartSettings(alignReportRef: Ref<AlignReport | undefined>) {
  return computed<PlChartStackedBarSettings>(() => {
    const alignReport = unref(alignReportRef);
    return getChainsChartSettings(alignReport);
  });
}
