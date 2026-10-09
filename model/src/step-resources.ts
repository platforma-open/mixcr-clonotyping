import type { StepResources } from "./args";

/** The fields of a workflow sizing row a per-step override may replace. */
export type StepRule = {
  memFloor: number;
  memIntercept: number;
  memSlope: number;
  cap?: number;
  cpuIntercept: number;
  cpuSlope?: number;
};

/** What `step-defaults.tpl.tengo` reports: the planned steps, or why there are none. */
export type StepDefaults =
  | { steps: { step: string; class: string; defaultRule: StepRule }[]; error?: undefined }
  | { error: string; steps?: undefined };

/** What `preset-support.tpl.tengo` reports: whether the block runs the selected preset. */
export type PresetSupport =
  | { supported: true; reason?: undefined }
  | { supported: false; reason: string };

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
