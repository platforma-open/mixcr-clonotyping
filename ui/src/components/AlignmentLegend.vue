<script lang="ts" setup>
  defineProps<{
    legends: {
      color: string;
      text: string;
    }[];
  }>();
</script>

<template>
  <div class="legend">
    <div v-for="(l, i) in legends" :key="i" class="legend__item">
      <div class="legend__chip" :style="{ backgroundColor: l.color }" />
      {{ l.text }}
    </div>
  </div>
</template>

<style lang="css">
.legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 24px;
  max-height: 120px;

  &.chains {
    gap: 24px;
    flex-direction: row;
  }
}


.legend__chip {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-grow: 0;
}

.legend__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend__item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--color-txt-01);
}  
</style>