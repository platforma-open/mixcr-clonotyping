<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type {
  QcCheckResult } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import {
  QcCheckDescriptions,
} from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { PlStatusTag } from '@platforma-sdk/ui-vue';

const props = defineProps<{
  value: QcCheckResult;
}>();

const data = reactive({
  expanded: false,
});

const description = computed(() => {
  const type = props.value.check.type;
  return QcCheckDescriptions[type] ?? `Not found description for type ${type}`;
});
</script>

<template>
  <div class="qc-section" :class="{ expanded: data.expanded }">
    <div class="qc-section__status" @click.stop="data.expanded = !data.expanded">
      <PlStatusTag :type="value.status" />
    </div>
    <div class="qc-section__text">
      <div class="qc-section__label" @click.stop="data.expanded = !data.expanded">
        {{ value.check.label }}: {{ value.payload.printedValue }}
      </div>
      <div class="qc-section__description">{{ description }}</div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.qc-section {
  --display: none;
  --bg: transparent;

  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px 24px 16px 8px;
  gap: 12px;

  border-width: 1px 0;
  border-style: solid;
  border-color: var(--color-div-grey);

  margin-top: -1px;

  background-color: var(--bg);
}

.qc-section__status {
  width: 96px;
  min-width: 96px;
}

.qc-section__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 2px 0 0;
  gap: 8px;
}

.qc-section__label {
  font-weight: 500;
  font-size: 14px;
  color: var(--color-txt-01);
  cursor: pointer;
}

.qc-section__description {
  display: var(--display);
  font-weight: 500;
  font-size: 14px;
  color: var(--color-txt-03);
  line-height: 20px;
  white-space: pre-wrap;
}

.qc-section.expanded {
  --display: block;
  --bg: var(--bg-base-light);
}

.qc-section .pl-status-tag {
  cursor: pointer;
}
</style>
