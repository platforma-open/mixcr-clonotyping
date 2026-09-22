import type { PlId } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import {
  AlignReport,
  AssembleReport,
  ProgressPrefix,
  Qc,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import type { AnyLogHandle } from "@platforma-sdk/model";
import { ReactiveFileContent } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "./app";

const reactiveFileContent = ReactiveFileContent.useGlobal();

// MiXCR runs as a single `analyze` command on most presets, and as separate align /
// refineTagsAndSort / assemble commands on bulk amplicon ones. Logs and progress arrive keyed
// by (sampleId, step); the log panel and the progress column each show one value per sample,
// so both take the step that has got furthest. Order is the order the commands run in.
const STEP_ORDER = ["analyze", "align", "refineTagsAndSort", "assemble"];

function stepRank(step: unknown): number {
  return typeof step === "string" ? STEP_ORDER.indexOf(step) : -1;
}

/** Keeps the entry of the most advanced step seen so far for each sample. */
function furthestStep<T>(
  entries: { key: unknown[]; value?: T }[],
): Map<string, { step: string; value: T }> {
  const best = new Map<string, { rank: number; step: string; value: T }>();
  for (const entry of entries) {
    if (entry.value === undefined) continue;
    const sampleId = entry.key[0] as string;
    const step = String(entry.key[1]);
    const rank = stepRank(step);
    const current = best.get(sampleId);
    if (current !== undefined && rank < current.rank) continue;
    best.set(sampleId, { rank, step, value: entry.value });
  }
  return new Map([...best].map(([sampleId, e]) => [sampleId, { step: e.step, value: e.value }]));
}

export type MiXCRResult = {
  label: string;
  sampleId: PlId;
  progress: string;
  logHandle?: AnyLogHandle;
  qc?: Qc;
  alignReport?: AlignReport;
  assembleReport?: AssembleReport;
};

/** Relatively rarely changing part of the results */
export const MiXCRResultsMap = computed(() => {
  const app = useApp();

  const sampleLabels = app.model.outputs.sampleLabels;
  if (sampleLabels === undefined) return undefined;

  // keys for qc's are calculated as soon as input data have locked inputs
  // (as early as possible to tell the list of samples we are analyzing here)
  const qc = app.model.outputs.qc;
  if (qc === undefined) return undefined;

  const resultMap = new Map<string, MiXCRResult>();

  // result map remembers the original insertion order, by sorting qc records,
  // we make all arrays derived from this map stably ordered
  const sortedQcData = [...qc.data];
  sortedQcData.sort((r1, r2) => (r1.key[0] as string).localeCompare(r2.key[0] as string));
  for (const qcData of sortedQcData) {
    const sampleId = qcData.key[0] as string;
    const result: MiXCRResult = {
      sampleId: sampleId as PlId,
      progress: "Queued",
      label: sampleLabels?.[sampleId] ?? `<no label / ${sampleId}>`,
    };
    resultMap.set(sampleId, result);
    if (qcData.value === undefined) continue;
    // globally cached
    result.qc = reactiveFileContent.getContentJson(qcData.value.handle, Qc).value;
  }

  const logs = app.model.outputs.logs;
  if (logs)
    for (const [sampleId, entry] of furthestStep(logs.data)) {
      const result = resultMap.get(sampleId);
      if (result) result.logHandle = entry.value;
    }

  const reports = app.model.outputs.reports;

  if (reports)
    for (const report of reports.data) {
      const sampleId = report.key[0] as string;
      const reportId = report.key[1] as string;
      if (report.key[2] !== "json" || report.value === undefined) continue;
      if (resultMap.get(sampleId))
        switch (reportId) {
          case "align":
            // globally cached
            resultMap.get(sampleId)!.alignReport = reactiveFileContent.getContentJson(
              report.value.handle,
              AlignReport,
            )?.value;
            break;
          case "assemble":
            // globally cached
            resultMap.get(sampleId)!.assembleReport = reactiveFileContent.getContentJson(
              report.value.handle,
              AssembleReport,
            )?.value;
            break;
        }
    }

  return resultMap;
});

/** Results augmented with execution progress */
export const MiXCRResultsFull = computed<MiXCRResult[] | undefined>(() => {
  const app = useApp();

  const progress = app.model.outputs.progress;
  if (progress === undefined) return undefined;

  const doneRaw = app.model.outputs.done;
  if (doneRaw === undefined) return undefined;
  const done = new Set(doneRaw);

  const rawMap = MiXCRResultsMap.value;
  if (rawMap === undefined) return undefined;

  // shallow cloning the map and it's values
  const resultMap = new Map([...rawMap].map((v) => [v[0], { ...v[1] }]));

  // adding progress information
  for (const [sampleId, entry] of furthestStep(progress.data)) {
    const result = resultMap.get(sampleId);
    if (result)
      result.progress = done.has(sampleId)
        ? "Done"
        : (entry.value.replace(ProgressPrefix, "") ?? "Not started");
  }

  return [...resultMap.values()];
});
