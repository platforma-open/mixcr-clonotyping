import { platforma } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import MainPageWrapper from './MainPageWrapper.vue';

export const sdkPlugin = defineApp(platforma, () => {
  return {
    routes: {
      '/': () => MainPageWrapper
    }
  };
});

export const useApp = sdkPlugin.useApp;
