<script lang="ts" setup>
import { tapIf } from '@milaboratories/helpers';
import { computed } from 'vue';

const props = defineProps<{
  value: {
    value: number;
    label: string;
    color: string;
  }[];
  size?: 'large';
  height?: number;
  showFractionInLabel?: boolean;
}>();

const style = computed(() => ({
  height: '100%',
  minHeight: props.size === 'large' ? '156px' : undefined
}));

const parts = computed(() => {
  const parts = props.value || [];
  const total = parts.reduce((res, it) => res + it.value, 0);
  return parts.map((p) => {
    const fraction = (p.value / total) * 100;
    const fractionString = ((p.value / total) * 100).toFixed(1);
    const label = tapIf(p.label, (label) => {
      if (props.showFractionInLabel) {
        return `${label} ${fractionString}%`;
      }

      return label;
    });
    return {
      color: p.color,
      fraction,
      label
    };
  });
});
</script>

<template>
  <div class="stacked-row" :class="size" :style="style">
    <div v-if="size === 'large'" class="label-track">
      <div
        v-for="(v, i) in [0, 25, 50, 75, 100]"
        :key="i"
        :style="`left: ${v}%`"
        :data-content="`${v}%`"
      ></div>
    </div>
    <div class="stacked-row__container">
      <div v-if="!parts.length" class="stacked-row__not-ready">Not ready</div>
      <div
        v-for="(p, i) in parts"
        :key="i"
        :title.prop="p.label"
        :style="{
          width: `${p.fraction}%`,
          backgroundColor: p.color
        }"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.stacked-row {
  padding: 6px;
  height: auto;
  position: relative;
  overflow: visible;
}

.label-track {
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  bottom: 0;
  /* z-index: 1; */
}

.label-track > div {
  height: 100%;
  position: absolute;
  bottom: 0;
  border-left: 1px solid #e1e3eb;
}

.label-track > div::after {
  position: absolute;
  content: attr(data-content);
  left: 0;
  bottom: -24px;
  transform: translateX(-50%);
}

.stacked-row.large {
  border: 1px solid var(--txt-01);
  padding: 12px 12px;
  border-radius: 0;
  margin-bottom: 24px;
}

.stacked-row__not-ready {
  color: var(--txt-03) !important;
}

.stacked-row.large .stacked-row__not-ready {
  font-size: larger;
  font-weight: bolder;
  color: var(--txt-mask);
  margin-left: 24px;
}

.stacked-row.large .stacked-row__container {
  position: relative;
  z-index: 1;
}

.stacked-row__container {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
}

.stacked-row__container > div {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
