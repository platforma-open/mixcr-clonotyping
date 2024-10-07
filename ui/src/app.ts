import { platforma } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import MainPage from './MainPage.vue';

export const sdkPlugin = defineApp(platforma, () => {
  return {
    routes: {
      '/': MainPage
    }
  };
});

export const useApp = sdkPlugin.useApp;
