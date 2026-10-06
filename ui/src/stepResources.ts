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
 * the handle is kept to tell a stale entry from a current one. `final` is set once the log can
 * grow no more: whatever it lacks then, it will never have, so it is not read again. */
type FoundGrant = StepGrantInfo & { handle: AnyLogHandle; final: boolean };

const decoder = new TextDecoder();

/** The first line of the log that contains `pattern`, and whether the log can still grow. No line
 * while there is none, and `live` while the handle has to be issued again. */
async function findLine(
  handle: AnyLogHandle,
  pattern: string,
): Promise<{ line?: string; live: boolean }> {
  const platforma = getRawPlatformaInstance();
  if (!platforma) return { live: true };
  const response = await platforma.logDriver.readText(handle, 1, 0, pattern);
  if (response.shouldUpdateHandle) return { live: true };
  const line = decoder.decode(response.data);
  return { line: line.includes(pattern) ? line : undefined, live: response.live };
}

// The poll interval: every few seconds at first, then every ten once the tab has been open a
// minute, since a step that has not printed its grant by then is waiting in a queue.
const POLL_MS = 3000;
const SLOW_POLL_MS = 10000;
const SLOW_AFTER_MS = 60000;

/**
 * logKey -> the grant and heap each step's log opens with. The lines are read with the log
 * driver's search, and read again every few seconds for the steps that have not printed them yet
 * and whose log can still grow. An entry read from a handle the step no longer has (the sample ran
 * again) is dropped and read again from the new one.
 */
export function useStepGrants(logs: Ref<StepLog[]>) {
  const found = reactive(new Map<string, FoundGrant>());
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const startedAt = Date.now();

  // The entry for a log, or undefined when there is none or it was read from an earlier handle.
  const currentEntry = (log: StepLog): FoundGrant | undefined => {
    const entry = found.get(log.key);
    return entry?.handle === log.handle ? entry : undefined;
  };

  // A log still worth reading: a step log that lacks a line it may yet print.
  const pending = (log: StepLog): boolean => {
    if (log.label === undefined) return false; // the single log of a result from before the split
    const entry = currentEntry(log);
    return (
      entry === undefined ||
      (!entry.final && (entry.grant === undefined || entry.heapBytes === undefined))
    );
  };

  const poll = async () => {
    timer = undefined;
    for (const log of logs.value) {
      if (!pending(log)) continue;
      const current = currentEntry(log);
      try {
        let live = false;
        let grant = current?.grant;
        if (grant === undefined) {
          const r = await findLine(log.handle, ResourcesPrefix);
          grant = parseGrant(r.line);
          live ||= r.live;
        }
        let heapBytes = current?.heapBytes;
        if (heapBytes === undefined) {
          const r = await findLine(log.handle, HeapFlag);
          heapBytes = parseHeapBytes(r.line);
          live ||= r.live;
        }
        found.set(log.key, { handle: log.handle, grant, heapBytes, final: !live });
      } catch {
        // A step that has not started has no log content yet; the next poll reads it.
      }
    }
    if (logs.value.some(pending) && !disposed) {
      const interval = Date.now() - startedAt < SLOW_AFTER_MS ? POLL_MS : SLOW_POLL_MS;
      timer = setTimeout(poll, interval);
    }
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
