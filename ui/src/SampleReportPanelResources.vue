<script setup lang="ts">
import type { StepRule } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { computed } from "vue";
import { useApp } from "./app";
import type { MiXCRResult } from "./results";
import { formatGiB, StepResourcesBySample, useStepGrants } from "./stepResources";

const props = defineProps<{
  sampleId: string;
  sampleData: MiXCRResult;
}>();

const grantOf = useStepGrants(computed(() => props.sampleData.logs));

const app = useApp();
const reportsRequests = computed(() => app.model.data.reportStepRequests === true);

// One row per step log; the request joins in when the block reports step requests.
const rows = computed(() => {
  const requests = new Map(
    (StepResourcesBySample.value.get(props.sampleId) ?? []).map((r) => [r.logKey, r.request]),
  );
  return props.sampleData.logs
    .filter((log) => log.label !== undefined)
    .map((log) => ({
      logKey: log.key,
      request: requests.get(log.key),
      ...grantOf(log),
    }));
});

// Granted is short of requested in either dimension: the backend shrank the request.
function isShort(r: (typeof rows.value)[number]): boolean {
  if (r.request === undefined || r.grant === undefined) return false;
  return r.grant.cpu < r.request.cpu || r.grant.ramMiB * 1024 ** 2 < r.request.ramBytes;
}

function ruleText(rule: StepRule): string {
  const ram =
    rule.memSlope === 0
      ? `${Math.max(rule.memFloor, rule.memIntercept)} GiB`
      : `max(${rule.memFloor}, ${rule.memIntercept} + ${rule.memSlope} × input) GiB`;
  return rule.cap == null ? ram : `${ram}, cap ${rule.cap}`;
}
</script>

<template>
  <div v-if="rows.length === 0">No step has reported its resources yet.</div>
  <template v-else>
    <div v-if="!reportsRequests">
      Requested resources show when "Debug: report requested resources" is on in Per-step resources.
    </div>
    <table class="step-resources">
      <thead>
        <tr>
          <th>Step</th>
          <th>Input</th>
          <th>Requested</th>
          <th>Granted</th>
          <th>Heap</th>
          <th>Memory rule</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.logKey">
          <td>{{ r.logKey }}</td>
          <td>{{ formatGiB(r.request?.inputBytes) }}</td>
          <td>
            <template v-if="r.request">
              {{ r.request.cpu }} CPU, {{ formatGiB(r.request.ramBytes) }}
            </template>
            <template v-else>–</template>
          </td>
          <td :class="{ 'step-resources__short': isShort(r) }">
            <template v-if="r.grant">
              {{ r.grant.cpu }} CPU, {{ formatGiB(r.grant.ramMiB * 1024 ** 2) }}
            </template>
            <template v-else>–</template>
          </td>
          <td>{{ formatGiB(r.heapBytes) }}</td>
          <td>
            <template v-if="r.request">
              {{ ruleText(r.request.rule) }}
              <span
                v-if="Object.values(r.request.source).some((s) => s !== 'default')"
                class="step-resources__override"
              >
                (overridden:
                {{
                  Object.entries(r.request.source)
                    .filter(([, s]) => s !== "default")
                    .map(([k, s]) => `${k} by ${s}`)
                    .join(", ")
                }})
              </span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped>
.step-resources {
  border-collapse: collapse;
  font-size: 13px;
}
.step-resources th,
.step-resources td {
  text-align: left;
  padding: 4px 10px 4px 0;
  border-bottom: 1px solid var(--border-color-default, #e1e3eb);
  white-space: nowrap;
}
.step-resources__short {
  color: var(--txt-error, #d22);
  font-weight: 600;
}
.step-resources__override {
  color: var(--txt-03, #888);
}
</style>
