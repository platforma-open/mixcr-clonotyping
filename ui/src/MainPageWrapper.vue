<script setup lang="ts">
import { useApp } from './app';
import MainPage from './MainPage.vue';

const app = useApp();

if (app.model.data.preset !== undefined && typeof app.model.data.preset === 'string') {
  app.model.data.preset = {
    type: 'name',
    name: app.model.data.preset as string,
  };
}
</script>

<template>
  <MainPage />
</template>
