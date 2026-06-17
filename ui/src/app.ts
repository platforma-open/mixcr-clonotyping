import { platforma } from "@platforma-open/milaboratories.mixcr-clonotyping-2.model";
import { defineAppV3 } from "@platforma-sdk/ui-vue";
import MainPageWrapper from "./MainPageWrapper.vue";
import QcReportTablePage from "./QcReportTablePage.vue";
import { watch } from "vue";

export const sdkPlugin = defineAppV3(platforma, (app) => {
  return {
    progress: () => {
      const qc = app.model.outputs.qc;
      const done = app.model.outputs.done;
      if (!done || !qc) return undefined;
      return done.length / qc.data.length;
    },
    routes: {
      "/": () => MainPageWrapper,
      "/qc-report-table": () => QcReportTablePage,
    },
  };
});

export const useApp = sdkPlugin.useApp;

// Make sure labels are initialized
const unwatch = watch(sdkPlugin, ({ loaded }) => {
  if (!loaded) return;
  const app = useApp();
  app.model.data.customBlockLabel ??= "";
  app.model.data.defaultBlockLabel ??= "Select Clonotype Definition";
  unwatch();
});
