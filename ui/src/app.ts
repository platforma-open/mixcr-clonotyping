import { platforma } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import MainPageWrapper from './MainPageWrapper.vue';

export const sdkPlugin = defineApp(platforma, (app) => {
  return {
    progress: () => {
      const qc = app.model.outputs.qc;
      const done = app.model.outputs.done;
      if (!done || !qc) return undefined;
      return done.length / qc.data.length;
    },
    routes: {
      '/': () => MainPageWrapper,
    },
  };
});

export const useApp = sdkPlugin.useApp;
