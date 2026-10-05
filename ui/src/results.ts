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

// MiXCR runs as one command per step. Step logs and progress arrive keyed by (sampleId, step).
// The workflow leads each step key with its zero-padded run position (`05:assemble`), so the
// keys sort in run order and the furthest step sorts last. The log panel shows every step's
// log in that order; the progress column shows one line per sample, the furthest step's. A
// result from before the split has only the single log, keyed by (sampleId); both kinds arrive
// in the same list.

type Entries<T> = { key: unknown[]; value?: T }[];

/** Splits one list into the single-log entries (key length 1) and the per-step ones (length 2). */
function splitByKeyLength<T>(entries: Entries<T> | undefined): {
  single: Entries<T>;
  perStep: Entries<T>;
} {
  const single: Entries<T> = [];
  const perStep: Entries<T> = [];
  for (const e of entries ?? []) (e.key.length === 1 ? single : perStep).push(e);
  return { single, perStep };
}

/** Keeps the value of the furthest step seen for each sample. */
function furthestStep<T>(entries: Entries<T>): Map<string, T> {
  const best = new Map<string, { step: string; value: T }>();
  for (const entry of entries) {
    if (entry.value === undefined) continue;
    const sampleId = entry.key[0] as string;
    const step = String(entry.key[1]);
    const current = best.get(sampleId);
    if (current !== undefined && step < current.step) continue;
    best.set(sampleId, { step, value: entry.value });
  }
  return new Map([...best].map(([sampleId, e]) => [sampleId, e.value]));
}

/** One value per sample: the single-log entry, replaced by the furthest step's where one exists. */
function latestPerSample<T>(entries: Entries<T> | undefined): Map<string, T> {
  const { single, perStep } = splitByKeyLength(entries);
  const out = new Map<string, T>();
  for (const e of single) if (e.value !== undefined) out.set(e.key[0] as string, e.value);
  for (const [sampleId, value] of furthestStep(perStep)) out.set(sampleId, value);
  return out;
}

/** One MiXCR step's log. `key` is the workflow's `05:assemble`; `label` is undefined for the
 * single log of a result from before the split, so that log shows as it always has. */
export type StepLog = { key: string; label?: string; handle: AnyLogHandle };

/** Each sample's step logs in run order, or its single log when it has no step logs. */
function logsPerSample(entries: Entries<AnyLogHandle> | undefined): Map<string, StepLog[]> {
  const { single, perStep } = splitByKeyLength(entries);
  const out = new Map<string, StepLog[]>();
  const ordered = [...perStep].sort((a, b) => String(a.key[1]).localeCompare(String(b.key[1])));
  for (const e of ordered) {
    if (e.value === undefined) continue;
    const sampleId = e.key[0] as string;
    const key = String(e.key[1]);
    let logs = out.get(sampleId);
    if (!logs) {
      logs = [];
      out.set(sampleId, logs);
    }
    logs.push({ key, label: key.replace(/^\d+:/, ""), handle: e.value });
  }
  for (const e of single) {
    const sampleId = e.key[0] as string;
    if (e.value !== undefined && !out.has(sampleId))
      out.set(sampleId, [{ key: "analyze", handle: e.value }]);
  }
  return out;
}

export type MiXCRResult = {
  label: string;
  sampleId: PlId;
  progress: string;
  logs: StepLog[];
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
      logs: [],
    };
    resultMap.set(sampleId, result);
    if (qcData.value === undefined) continue;
    // globally cached
    result.qc = reactiveFileContent.getContentJson(qcData.value.handle, Qc).value;
  }

  const logs = logsPerSample(app.model.outputs.logs?.data);
  for (const [sampleId, stepLogs] of logs) {
    const result = resultMap.get(sampleId);
    if (result) result.logs = stepLogs;
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

  // adding progress information.
  // A step whose stdout carries no progress line yet reports the empty string. Taking it would
  // blank the column, so the last step that did report one stands until the next one speaks.
  // `qc` never reports one at all.
  const reported = (entries: Entries<string> | undefined) => entries?.filter((p) => p.value !== "");
  const lines = latestPerSample(reported(progress.data));
  for (const [sampleId, line] of lines) {
    const result = resultMap.get(sampleId);
    if (result) result.progress = done.has(sampleId) ? "Done" : line.replace(ProgressPrefix, "");
  }

  return [...resultMap.values()];
});
