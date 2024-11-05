<script setup lang="ts">
import { ref, watch } from 'vue';
import { useApp } from './app';
import MainPage from './MainPage.vue';

const app = useApp();

if (app.model.args.preset !== undefined && typeof app.model.args.preset === 'string') {
  app.model.args.preset = {
    type: 'name',
    name: app.model.args.preset as string
  }
}
</script>

<template>
  <MainPage />
</template>
