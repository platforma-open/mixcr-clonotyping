import type { StepRule } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { computed } from "vue";
import { MiXCRResultsMap } from "./results";

// Step logs arrive keyed by (sampleId, logKey); the workflow leads each logKey with the step's
// zero-padded run position (`005:assemble`), so sorting by it gives the run order.

function stepOf(logKey: string): string {
  return logKey.slice(logKey.indexOf(":") + 1);
}

/** A step the settings can edit, with its default rule when one is known. */
export type KnownStep = { step: string; defaultRule?: StepRule };

/** The step names of every finished run's logs, in run order: what the settings editor lists
 * when the prerun has not planned the preset. Their default rules are unknown then. `qc` takes
 * no override (its row in resources.lib.tengo), as the planned list leaves it out. */
export const KnownSteps = computed(() => {
  const seen = new Map<string, KnownStep>();
  for (const result of MiXCRResultsMap.value?.values() ?? [])
    for (const log of result.logs) {
      if (log.label === undefined) continue;
      const step = stepOf(log.key);
      if (step !== "qc" && !seen.has(step)) seen.set(step, { step });
    }
  return [...seen.values()];
});
