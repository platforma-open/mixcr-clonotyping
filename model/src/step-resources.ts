import type { StepResources } from "./args";

/** Marks the line each MiXCR command prints with the CPU and memory it was granted. The UI reads
 * it with the log driver's search: a model output cannot, as the driver keys its progress-log
 * cache by log alone, so a second pattern on one log returns the first pattern's line. */
export const ResourcesPrefix = "[==RESOURCES==]";

/** The flag the JVM's -XX:+PrintCommandLineFlags line carries the heap in. */
export const HeapFlag = "-XX:MaxHeapSize=";

/** The fields of a workflow sizing row a per-step override may replace. */
export type StepRule = {
  memFloor: number;
  memIntercept: number;
  memSlope: number;
  cap?: number;
  cpuIntercept: number;
  cpuSlope?: number;
};

export type RuleSource = "default" | "step" | "global";

/** What `step-request.tpl.tengo` reports for one step. */
export type StepRequest = {
  step: string;
  class: string;
  inputFiles: string[];
  inputBytes: number;
  ramBytes: number;
  cpu: number;
  rule: StepRule;
  source: Record<keyof StepRule, RuleSource>;
  defaultRule: StepRule;
  overridable: boolean;
};

/** What `step-defaults.tpl.tengo` reports: the planned steps, or why there are none. */
export type StepDefaults =
  | { steps: { step: string; class: string; defaultRule: StepRule }[]; error?: undefined }
  | { error: string; steps?: undefined };

export type StepGrant = { cpu: number; ramMiB: number };

/** Reads `[==RESOURCES==]cpu=24;ramMiB=38912` out of the line the JVM echoes. */
export function parseGrant(line: string | undefined): StepGrant | undefined {
  if (line === undefined) return undefined;
  const at = line.indexOf(ResourcesPrefix);
  if (at < 0) return undefined;
  const fields = new Map(
    line
      .slice(at + ResourcesPrefix.length)
      .split(/\s/)[0]
      .split(";")
      .map((kv) => kv.split("=") as [string, string]),
  );
  const cpu = Number(fields.get("cpu"));
  const ramMiB = Number(fields.get("ramMiB"));
  if (!Number.isFinite(cpu) || !Number.isFinite(ramMiB)) return undefined;
  return { cpu, ramMiB };
}

/** Reads the heap in bytes out of the JVM's -XX:+PrintCommandLineFlags line. */
export function parseHeapBytes(line: string | undefined): number | undefined {
  const m = line?.match(/-XX:MaxHeapSize=(\d+)/);
  return m ? Number(m[1]) : undefined;
}

/** Drops steps whose override sets no field, so clearing a row leaves no trace in the args. */
export function dropEmptyOverrides(o: StepResources | undefined): StepResources | undefined {
  if (o === undefined) return undefined;
  const kept = Object.entries(o)
    .map(
      ([step, v]) =>
        [step, Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined))] as const,
    )
    .filter(([, v]) => Object.keys(v).length > 0);
  return kept.length > 0 ? Object.fromEntries(kept) : undefined;
}
