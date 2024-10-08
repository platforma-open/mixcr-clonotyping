<script lang="ts" setup>
import { computed } from 'vue';

const levelLabels = {
  ALERT: 'Alert',
  WARN: 'Warn',
  OK: 'Ok',
};

const props = defineProps<{
  level: keyof typeof levelLabels | undefined;
}>();

const labelText = computed(() => (props.level ? levelLabels[props.level] : ''));
</script>

<template>
  <div v-if="level" class="quality-label" :class="level.toLowerCase()">
    {{ labelText }}
  </div>
</template>

<style lang="css" scoped>
.quality-label {
  width: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  gap: 6px;
  height: 24px;

  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;

  border: 1px solid var(--txt-01);
  border-radius: 4px;
  cursor: pointer;
}

.quality-label.ok {
  background: linear-gradient(90deg, #c9f0b6 0%, #ffffff 100%);
}

.quality-label.warn {
  background: linear-gradient(90deg, #fee0a3 0%, #fff 100%);
}

.quality-label.alarm {
  background: linear-gradient(90deg, #ffb8b8 0%, #fff 100%);
}

.quality-label.alert {
  background: linear-gradient(90deg, #ffb8b8 0%, #fff 100%);
}
</style>
