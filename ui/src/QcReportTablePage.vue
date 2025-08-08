<script setup lang="ts">
import { useApp } from './app';
import {
  PlAgDataTableV2,
  PlBlockPage,
  usePlDataTableSettingsV2,
} from '@platforma-sdk/ui-vue';

const app = useApp();

const tableSettings = usePlDataTableSettingsV2({
  model: () => app.model.outputs.pt,
});

</script>

<template>
  <PlBlockPage>
    <template #title>
      QC Report Table
    </template>
    <PlAgDataTableV2
      v-model="app.model.ui.tableState"
      :settings="tableSettings"
      show-columns-panel
      show-export-button
      not-ready-text="Data is not computed"
    />
  </PlBlockPage>
</template>
