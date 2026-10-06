<script setup lang="ts">
import type {
  StepGrant,
  StepRequest,
  StepRule,
} from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { useAgGridOptions } from "@platforma-sdk/ui-vue";
import { AgGridVue } from "ag-grid-vue3";
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

type Row = { logKey: string; request?: StepRequest; grant?: StepGrant; heapBytes?: number };

// One row per step log; the request joins in when the block reports step requests.
const rows = computed<Row[]>(() => {
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
function isShort(r: Row): boolean {
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

// The rule, and which of its fields an override set.
function ruleCell(request: StepRequest | undefined): string {
  if (request === undefined) return "";
  const overridden = Object.entries(request.source)
    .filter(([, s]) => s !== "default")
    .map(([k, s]) => `${k} by ${s}`);
  const text = ruleText(request.rule);
  return overridden.length === 0 ? text : `${text} (overridden: ${overridden.join(", ")})`;
}

const allocation = (cpu: number | undefined, bytes: number | undefined) =>
  cpu === undefined || bytes === undefined ? "–" : `${cpu} CPU, ${formatGiB(bytes)}`;

const { gridOptions } = useAgGridOptions<Row>(({ column }) => ({
  rowData: rows.value,
  getRowId: (row) => row.data.logKey,
  domLayout: "autoHeight",
  defaultColDef: { sortable: false, suppressHeaderMenuButton: true, resizable: true },
  noRowsText: "No step has reported its resources yet.",
  columnDefs: [
    column<string>({ colId: "step", headerName: "Step", field: "logKey" }),
    column<string>({
      colId: "input",
      headerName: "Input",
      valueGetter: (p) => formatGiB(p.data?.request?.inputBytes),
    }),
    column<string>({
      colId: "requested",
      headerName: "Requested",
      valueGetter: (p) => allocation(p.data?.request?.cpu, p.data?.request?.ramBytes),
    }),
    column<string>({
      colId: "granted",
      headerName: "Granted",
      valueGetter: (p) =>
        allocation(
          p.data?.grant?.cpu,
          p.data?.grant === undefined ? undefined : p.data.grant.ramMiB * 1024 ** 2,
        ),
      // The backend granted less than the step asked for.
      cellClass: (p) => (p.data !== undefined && isShort(p.data) ? "step-resources__short" : ""),
    }),
    column<string>({
      colId: "heap",
      headerName: "Heap",
      valueGetter: (p) => formatGiB(p.data?.heapBytes),
    }),
    column<string>({
      colId: "rule",
      headerName: "Memory rule",
      flex: 1,
      valueGetter: (p) => ruleCell(p.data?.request),
    }),
  ],
}));
</script>

<template>
  <div v-if="rows.length > 0 && !reportsRequests">
    Requested resources show when "Debug: Report requested resources" is on in Per-step resources.
  </div>
  <AgGridVue v-bind="gridOptions" />
</template>

<style scoped>
:deep(.step-resources__short) {
  color: var(--txt-error);
  font-weight: 600;
}
</style>
