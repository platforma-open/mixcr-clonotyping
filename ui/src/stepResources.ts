import type {
  StepGrant,
  StepRequest,
  StepRule,
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
import { MiXCRResultsMap } from "./results";

// Step outputs arrive keyed by (sampleId, logKey); the workflow leads each logKey with the step's
// zero-padded run position (`005:assemble`), so sorting by it gives the run order.

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

/** One request per step name, in run order: the steps the settings editor lists. Steps whose
 * row takes no override (`qc`) are left out, as the planned list leaves them out. */
export const KnownSteps = computed(() => {
  const seen = new Map<string, KnownStep>();
  for (const rows of StepResourcesBySample.value.values())
    for (const r of rows)
      if (r.request?.overridable && !seen.has(r.step))
        seen.set(r.step, { step: r.step, defaultRule: r.request.defaultRule });
  // Without step requests, the step logs of a finished run still name the steps; their default
  // rules are then unknown. `qc` takes no override (its row in resources.lib.tengo).
  for (const result of MiXCRResultsMap.value?.values() ?? [])
    for (const log of result.logs) {
      if (log.label === undefined) continue;
      const step = stepOf(log.key);
      if (step !== "qc" && !seen.has(step)) seen.set(step, { step });
    }
  return [...seen.values()];
});

/** A step the settings can edit, with its default rule when one is known. */
export type KnownStep = { step: string; defaultRule?: StepRule };

export type StepGrantInfo = { grant?: StepGrant; heapBytes?: number };

/** A grant read from one log handle. A re-run gives the step a new handle under the same key, so
 * the handle is kept to tell a stale entry from a current one. */
type FoundGrant = StepGrantInfo & { handle: AnyLogHandle };

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
 * An entry read from a handle the step no longer has (the sample ran again) is dropped and read
 * again from the new one.
 */
export function useStepGrants(logs: Ref<StepLog[]>) {
  const found = reactive(new Map<string, FoundGrant>());
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  // The entry for a log, or undefined when there is none or it was read from an earlier handle.
  const currentEntry = (log: StepLog): FoundGrant | undefined => {
    const entry = found.get(log.key);
    return entry?.handle === log.handle ? entry : undefined;
  };

  const poll = async () => {
    timer = undefined;
    for (const log of logs.value) {
      if (log.label === undefined) continue; // the single log of a result from before the split
      const current = currentEntry(log) ?? { handle: log.handle };
      if (current.grant !== undefined && current.heapBytes !== undefined) continue;
      try {
        const grant = current.grant ?? parseGrant(await findLine(log.handle, ResourcesPrefix));
        const heapBytes = current.heapBytes ?? parseHeapBytes(await findLine(log.handle, HeapFlag));
        found.set(log.key, { handle: log.handle, grant, heapBytes });
      } catch {
        // A step that has not started has no log content yet; the next poll reads it.
      }
    }
    const missing = logs.value.some((l) => {
      const info = currentEntry(l);
      return l.label !== undefined && (info?.grant === undefined || info.heapBytes === undefined);
    });
    if (missing && !disposed) timer = setTimeout(poll, 3000);
  };

  watch(
    () => logs.value.map((l) => `${l.key}=${l.handle}`).join(","),
    () => {
      if (timer === undefined) void poll();
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    disposed = true;
    if (timer !== undefined) clearTimeout(timer);
  });

  // What the log's current handle has shown so far, without the handle itself.
  return (log: StepLog): StepGrantInfo | undefined => {
    const entry = currentEntry(log);
    return entry === undefined ? undefined : { grant: entry.grant, heapBytes: entry.heapBytes };
  };
}
