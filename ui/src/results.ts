import {
  AlignReport,
  AssembleReport,
  PlId,
  ProgressPrefix,
  Qc
} from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { AnyLogHandle } from '@platforma-sdk/model';
import { ReactiveFileContent } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from './app';

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

  const sampleLabels = app.outputValues.sampleLabels;
  if (sampleLabels === undefined) return undefined;

  // keys for qc's are calculated as soon as input data have locked inputs
  // (as early as possible to tell the list of samples we are analyzing here)
  const qc = app.outputValues.qc;
  if (qc === undefined) return undefined;

  const resultMap = new Map<string, MiXCRResult>();

  // result map remembers the original insertion order, by sorting qc records,
  // we make all arrays derived from this map stabily ordered
  const sortedQcData = [...qc.data];
  sortedQcData.sort((r1, r2) => (r1.key[0] as string).localeCompare(r2.key[0] as string));
  for (const qcData of sortedQcData) {
    const sampleId = qcData.key[0] as string;
    const result: MiXCRResult = {
      sampleId: sampleId as PlId,
      progress: 'Queued',
      label: sampleLabels?.[sampleId] ?? `<no label / ${sampleId}>`
    };
    resultMap.set(sampleId, result);
    if (qcData.value === undefined) continue;
    // globally cached
    result.qc = ReactiveFileContent.getContentJson(qcData.value.handle, Qc).value;
  }

  const logs = app.outputValues.logs;
  if (logs)
    for (const logData of logs.data) {
      const sampleId = logData.key[0] as string;
      if (resultMap.get(sampleId)) resultMap.get(sampleId)!.logHandle = logData.value;
    }

  const reports = app.outputValues.reports;

  if (reports)
    for (const report of reports.data) {
      const sampleId = report.key[0] as string;
      const reportId = report.key[1] as string;
      if (report.key[2] !== 'json' || report.value === undefined) continue;
      if (resultMap.get(sampleId))
        switch (reportId) {
          case 'align':
            // globally cached
            resultMap.get(sampleId)!.alignReport = ReactiveFileContent.getContentJson(
              report.value.handle,
              AlignReport
            )?.value;
            break;
          case 'assemble':
            // globally cached
            resultMap.get(sampleId)!.assembleReport = ReactiveFileContent.getContentJson(
              report.value.handle,
              AssembleReport
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

  // shellow cloning the map and it's values
  const resultMap = new Map([...rawMap].map((v) => [v[0], { ...v[1] }]));

  // adding progress information
  for (const p of progress.data) {
    const sampleId = p.key[0] as string;
    if (resultMap.get(sampleId))
      if (p?.value)
        resultMap.get(sampleId)!.progress = done.has(sampleId)
          ? 'Done'
          : p.value?.replace(ProgressPrefix, '') ?? 'Not started';
  }

  return [...resultMap.values()];
});
