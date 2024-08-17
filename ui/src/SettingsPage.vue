<script setup lang="ts">
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { useApp } from './app';

const app = useApp();

app.createArgsModel();
</script>

<template>
  <div class="container">Hi!</div>
</template>

<style lang="css">
button {
  padding: 12px 0;
}

.container {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  gap: 24px;
}
</style>
