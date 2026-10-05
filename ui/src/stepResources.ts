import type {
  StepGrant,
  StepRequest,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import {
  HeapFlag,
  parseGrant,
  parseHeapBytes,
  ResourcesPrefix,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import type { AnyLogHandle } from "@platforma-sdk/model";
import { getRawPlatformaInstance } from "@platforma-sdk/model";
import type { Ref } from "vue";
import { computed, onScopeDispose, reactive, watch } from "vue";
import { useApp } from "./app";
import type { StepLog } from "./results";

// Step outputs arrive keyed by (sampleId, logKey); the workflow leads each logKey with the step's
// zero-padded run position (`05:assemble`), so sorting by it gives the run order.

export type StepResourcesRow = {
  logKey: string;
  step: string;
  request?: StepRequest;
};

const GiB = 1024 ** 3;

export function formatGiB(bytes: number | undefined): string {
  return bytes === undefined ? "–" : `${(bytes / GiB).toFixed(1)} GiB`;
}

function stepOf(logKey: string): string {
  return logKey.slice(logKey.indexOf(":") + 1);
}

/** sampleId -> what each of its steps requested, in run order. */
export const StepResourcesBySample = computed(() => {
  const app = useApp();
  const bySample = new Map<string, StepResourcesRow[]>();
  for (const e of app.model.outputs.stepRequests?.data ?? []) {
    if (e.value === undefined) continue;
    const sampleId = String(e.key[0]);
    const logKey = String(e.key[1]);
    let rows = bySample.get(sampleId);
    if (rows === undefined) bySample.set(sampleId, (rows = []));
    rows.push({ logKey, step: stepOf(logKey), request: e.value });
  }
  for (const rows of bySample.values()) rows.sort((a, b) => a.logKey.localeCompare(b.logKey));
  return bySample;
});

/** One request per step name, in run order: the steps the settings editor lists. */
export const KnownSteps = computed(() => {
  const seen = new Map<string, StepRequest>();
  for (const rows of StepResourcesBySample.value.values())
    for (const r of rows)
      if (r.request !== undefined && !seen.has(r.step)) seen.set(r.step, r.request);
  return [...seen.values()];
});

export type StepGrantInfo = { grant?: StepGrant; heapBytes?: number };

const decoder = new TextDecoder();

/** The first line of the log that contains `pattern`, or undefined while there is none. */
async function findLine(handle: AnyLogHandle, pattern: string): Promise<string | undefined> {
  const platforma = getRawPlatformaInstance();
  if (!platforma) return undefined;
  const response = await platforma.logDriver.readText(handle, 1, 0, pattern);
  if (response.shouldUpdateHandle) return undefined;
  const line = decoder.decode(response.data);
  return line.includes(pattern) ? line : undefined;
}

/**
 * logKey -> the grant and heap each step's log opens with. The lines are read with the log
 * driver's search, and read again every few seconds for the steps that have not printed them yet.
 */
export function useStepGrants(logs: Ref<StepLog[]>) {
  const found = reactive(new Map<string, StepGrantInfo>());
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const poll = async () => {
    timer = undefined;
    for (const log of logs.value) {
      if (log.label === undefined) continue; // the single log of a result from before the split
      const current = found.get(log.key) ?? {};
      if (current.grant !== undefined && current.heapBytes !== undefined) continue;
      try {
        const grant = current.grant ?? parseGrant(await findLine(log.handle, ResourcesPrefix));
        const heapBytes = current.heapBytes ?? parseHeapBytes(await findLine(log.handle, HeapFlag));
        found.set(log.key, { grant, heapBytes });
      } catch {
        // A step that has not started has no log content yet; the next poll reads it.
      }
    }
    const missing = logs.value.some(
      (l) => l.label !== undefined && found.get(l.key)?.grant === undefined,
    );
    if (missing && !disposed) timer = setTimeout(poll, 3000);
  };

  watch(
    () => logs.value.map((l) => l.key).join(","),
    () => {
      if (timer === undefined) void poll();
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    disposed = true;
    if (timer !== undefined) clearTimeout(timer);
  });

  return found;
}
