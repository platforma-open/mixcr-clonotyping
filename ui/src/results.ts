import { computed } from "vue";
import { useApp } from "./app";
import { ReactiveFileContent } from "@platforma-sdk/ui-vue";
import { ProgressPrefix } from "@platforma-open/milaboratories.mixcr-clonotyping.model";

type MiXCRResult = {
    label: string,
    sampleId: string,
    progress: string,
    qc?: any,
    reports: Record<string, any>
}

const app = useApp();

export function mainMixcrResults() {
  return computed<MiXCRResult[] | undefined>(() => {
    const sampleLabels = app.getOutputFieldOkOptional('sampleLabels');

    // keys for qc's are calculated as soon as input data have locked inputs
    // (as early as possible to tell the list of samples we are analyzing here)
    const qc = app.getOutputFieldOkOptional('qc');
    if (qc === undefined) return undefined;

    const progress = app.getOutputFieldOkOptional('progress');
    if (progress === undefined) return undefined;

    const doneRaw = app.getOutputFieldOkOptional('done');
    if (doneRaw === undefined) return undefined;
    const done = new Set(doneRaw);

    const resultsMap = new Map<string, MiXCRResult>();
    for (const qcData of qc.data) {
      const sampleId = qcData.key[0] as string;
      const result: MiXCRResult = {
        sampleId,
        progress: '',
        label: sampleLabels?.[sampleId] ?? sampleId,
        reports: {}
      };
      resultsMap.set(sampleId, result);
      // globally cached
      const qcRef = ReactiveFileContent.getContentJson(qcData.value?.handle);
      if (qcRef) result.qc = qcRef.value;
    }

    for (const p of progress.data) {
      const sampleId = p.key[0] as string;
      if (p?.value)
        resultsMap.get(sampleId)!.progress = done.has(sampleId)
          ? 'Done'
          : p.value?.replace(ProgressPrefix, '') ?? 'Not started';
    }

    const reports = app.getOutputFieldOkOptional('reports');

    if (reports)
      for (const report of reports.data) {
        const sampleId = report.key[0] as string;
        const reportId = report.key[1] as string;
        if (report.key[2] !== 'json') continue;
        // globally cached
        const reportRef = ReactiveFileContent.getContentJson(report.value?.handle);
        if (reportRef?.value) resultsMap.get(sampleId)!.reports[reportId] = reportRef?.value;
      }

    const results = [...resultsMap.values()];
    results.sort((r1, r2) => r1.label.localeCompare(r2.label));
    return results;
  });
}
