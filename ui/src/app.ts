import { platforma } from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { defineApp } from '@milaboratory/sdk-vue';
import SettingsPage from './SettingsPage.vue';
import ReportsPage from './ReportsPage.vue';

export const sdkPlugin = defineApp(platforma, () => {
  return {
    routes: {
      '/': SettingsPage,
      '/reports': ReportsPage
    }
  };
});

export const useApp = sdkPlugin.useApp;
