<script setup lang="ts">
import type {
  StepResourceOverride,
  StepRule,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { PlBtnSecondary, PlCheckbox, PlNumberField, PlTooltip } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "./app";
import { KnownSteps } from "./stepResources";

// The steps come from the prerun's plan once the operator asks for it, or else from the steps a
// run has reported; the placeholders are the workflow's defaults. Only a value the user types is
// stored, so an untouched field follows the defaults.

const app = useApp();

const planned = computed(() => app.model.outputs.stepDefaults);
const steps = computed(() => planned.value?.steps ?? KnownSteps.value);
const isPresetFile = computed(() => app.model.data.preset?.type === "file");

type Field = keyof StepRule;
// Memory = max(floor, intercept + slope × input GiB), at most cap; CPU = CPU + CPU per input GiB
// × input GiB. "Input" is the size of the files the step reads.
const BLANK = "Leave blank (null) to use the default shown in grey.";
// min matches the model's schema (StepResourceOverride): a value below it would make the block
// unable to run.
const fields: { key: Field; label: string; step: number; min: number; tooltip: string }[] = [
  {
    key: "memFloor",
    label: "Memory floor GiB",
    step: 1,
    min: 1,
    tooltip: `The least memory the step gets, whatever its input size. ${BLANK}`,
  },
  {
    key: "memIntercept",
    label: "Memory intercept GiB",
    step: 1,
    min: 0,
    tooltip: `Memory added to the per-input-GiB term before the floor applies. ${BLANK}`,
  },
  {
    key: "memSlope",
    label: "Memory GiB per input GiB",
    step: 0.1,
    min: 0,
    tooltip: `Memory per GiB of the files the step reads. 0 makes the request flat at the floor or intercept. ${BLANK}`,
  },
  {
    key: "cap",
    label: "Cap GiB",
    step: 1,
    min: 1,
    tooltip: `The most memory the step gets. Leave blank (null) for no cap, unless a default is shown in grey.`,
  },
  {
    key: "cpuIntercept",
    label: "CPU",
    step: 1,
    min: 1,
    tooltip: `The CPUs the step gets before the per-input-GiB term. Beats the CPU setting above for this step. ${BLANK}`,
  },
  {
    key: "cpuSlope",
    label: "CPU per input GiB",
    step: 0.1,
    min: 0,
    tooltip: `CPUs added per GiB of the files the step reads. Leave blank (null) for none, unless a default is shown in grey.`,
  },
];

function value(step: string, key: Field): number | undefined {
  return app.model.data.stepResources?.[step]?.[key];
}

function setValue(step: string, key: Field, v: number | undefined) {
  const all = { ...app.model.data.stepResources };
  const one: StepResourceOverride = { ...all[step], [key]: v };
  if (v === undefined) delete one[key];
  if (Object.keys(one).length === 0) delete all[step];
  else all[step] = one;
  app.model.data.stepResources = Object.keys(all).length === 0 ? undefined : all;
}

function reset(step: string) {
  const all = { ...app.model.data.stepResources };
  delete all[step];
  app.model.data.stepResources = Object.keys(all).length === 0 ? undefined : all;
}

// The one cross-field rule of the schema: a cap below the memory floor.
function errorOf(step: string, key: Field): string | undefined {
  if (key !== "cap") return undefined;
  const o = app.model.data.stepResources?.[step];
  if (o?.cap !== undefined && o.memFloor !== undefined && o.cap < o.memFloor)
    return "Cap must be at least the memory floor";
  return undefined;
}

function placeholder(rule: StepRule, key: Field): string {
  const v = rule[key];
  if (v != null) return String(v);
  return "null";
}
</script>

<template>
  <PlCheckbox
    :model-value="app.model.data.reportStepRequests === true"
    @update:model-value="(v: boolean) => (app.model.data.reportStepRequests = v || undefined)"
  >
    Report requested resources
    <PlTooltip class="info" position="top">
      <template #tooltip>
        Shows what each step asked for in the Resources tab of a sample. It is a separate analysis,
        so turning it on runs every sample once more; turning it off again returns to the earlier
        results.
      </template>
    </PlTooltip>
  </PlCheckbox>
  <PlBtnSecondary
    v-if="!app.model.data.listSteps && !isPresetFile"
    @click="app.model.data.listSteps = true"
  >
    List the steps of this preset
  </PlBtnSecondary>
  <div v-if="planned?.error" class="step-settings__empty">{{ planned.error }}</div>
  <div v-else-if="steps.length === 0" class="step-settings__empty">
    {{
      app.model.data.listSteps
        ? "Planning the steps…"
        : isPresetFile
          ? "Run the block once to list the steps of a preset file."
          : "List the steps, or run the block once."
    }}
  </div>
  <div v-for="req in steps" v-else :key="req.step" class="step-settings__step">
    <div class="step-settings__head">
      <b>{{ req.step }}</b>
      <PlBtnSecondary
        v-if="app.model.data.stepResources?.[req.step]"
        size="small"
        @click="reset(req.step)"
      >
        Reset
      </PlBtnSecondary>
    </div>
    <div class="step-settings__grid">
      <PlNumberField
        v-for="f in fields"
        :key="f.key"
        :model-value="value(req.step, f.key)"
        :label="f.label"
        :placeholder="placeholder(req.defaultRule, f.key)"
        :step="f.step"
        :min-value="f.min"
        :error-message="errorOf(req.step, f.key)"
        clearable
        @update:model-value="(v: number | undefined) => setValue(req.step, f.key, v)"
      >
        <template #tooltip>{{ f.tooltip }}</template>
      </PlNumberField>
    </div>
  </div>
</template>

<style scoped>
.step-settings__step {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.step-settings__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.step-settings__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* Each field's label sits on its top border, so rows need room for it. */
  gap: 24px 12px;
}
.step-settings__empty {
  color: var(--txt-03, #888);
}
</style>
