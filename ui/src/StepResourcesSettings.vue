<script setup lang="ts">
import type {
  ListStepsParams,
  StepResourceOverride,
  StepRule,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { PlBtnSecondary, PlNumberField, PlTooltip } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "./app";
import { KnownSteps } from "./stepResources";

// The steps come from the prerun's plan once the operator asks for it, or else from the steps a
// run has reported; the placeholders are the workflow's defaults. Only a value the user types is
// stored, so an untouched field follows the defaults.

const app = useApp();

const planned = computed(() => app.model.outputs.stepDefaults);
// The planning command failed (an unknown species, a preset the dry run rejects): the output
// carries an error and no value, so the section shows the message instead of waiting.
const planError = computed(
  () => planned.value?.error ?? app.model.outputErrors.stepDefaults?.message,
);
const steps = computed(() => planned.value?.steps ?? KnownSteps.value);
const isPresetFile = computed(() => app.model.data.preset?.type === "file");

// Plans once per click: the prerun sees these values, not the live fields.
function listSteps() {
  const d = app.model.data;
  app.model.data.listStepsParams = {
    tagPattern: d.tagPattern,
    assembleClonesBy: d.assembleClonesBy,
    cloneClusteringMode: d.cloneClusteringMode,
  } satisfies ListStepsParams;
}

// The memory floor is the one field the editor sets. min matches the model's schema
// (StepResourceOverride): a value below it would make the block unable to run.
function memFloor(step: string): number | undefined {
  return app.model.data.stepResources?.[step]?.memFloor;
}

function setMemFloor(step: string, v: number | undefined) {
  const all = { ...app.model.data.stepResources };
  const one: StepResourceOverride = { ...all[step], memFloor: v };
  if (v === undefined) delete one.memFloor;
  if (Object.keys(one).length === 0) delete all[step];
  else all[step] = one;
  app.model.data.stepResources = Object.keys(all).length === 0 ? undefined : all;
}

// "default" when the step's rule is unknown: it came from a run's logs, not a plan or a request.
function placeholder(rule: StepRule | undefined): string {
  return rule === undefined ? "default" : `default (${rule.memFloor})`;
}
</script>

<template>
  <PlBtnSecondary v-if="!isPresetFile" @click="listSteps">
    {{
      app.model.data.listStepsParams ? "Refresh Preset's Steps" : "List the steps of this preset"
    }}
  </PlBtnSecondary>
  <div v-if="planError" class="step-settings__empty">{{ planError }}</div>
  <div v-else-if="steps.length === 0" class="step-settings__empty">
    {{
      app.model.data.listStepsParams
        ? "Planning the steps…"
        : isPresetFile
          ? "Run the block once to list the steps of a preset file."
          : "List the steps, or run the block once."
    }}
  </div>
  <div v-else class="step-settings__grid">
    <span class="step-settings__header">Step</span>
    <span class="step-settings__header">
      Memory floor GiB
      <PlTooltip class="info" position="top">
        <template #tooltip>
          The least memory the step gets, whatever its input size. Leave blank to use the default
          shown in grey.
        </template>
      </PlTooltip>
    </span>
    <template v-for="req in steps" :key="req.step">
      <span class="step-settings__step">{{ req.step }}</span>
      <PlNumberField
        :model-value="memFloor(req.step)"
        :placeholder="placeholder(req.defaultRule)"
        :step="1"
        :min-value="1"
        :validate="(v) => (Number.isInteger(v) ? undefined : 'Value must be an integer')"
        clearable
        @update:model-value="(v: number | undefined) => setMemFloor(req.step, v)"
      />
    </template>
  </div>
</template>

<style scoped>
.step-settings__grid {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px 16px;
  margin-top: 12px;
}
.step-settings__header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}
.step-settings__empty {
  color: var(--txt-03, #888);
}
</style>
