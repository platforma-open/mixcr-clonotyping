import { platforma } from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { defineApp } from '@milaboratory/sdk-vue';
import SettingsPage from './SettingsPage.vue';

export const sdkPlugin = defineApp(platforma, () => {
  return {
    routes: {
      '/': SettingsPage
    }
  };
});

export const useApp = sdkPlugin.useApp;
