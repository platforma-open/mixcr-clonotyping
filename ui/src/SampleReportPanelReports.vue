<script setup lang="ts">
import { PlId } from '@platforma-open/milaboratories.mixcr-clonotyping.model';
import {
  PlBtnGroup,
  PlContainer,
  PlTextArea,
  ReactiveFileContent,
  SimpleOption
} from '@platforma-sdk/ui-vue';
import { computed, reactive } from 'vue';
import { useApp } from './app';

const props = defineProps<{
  sampleId: PlId;
}>();

type ReportId = 'align' | 'assemble';
const data = reactive<{
  currentReport: ReportId;
}>({
  currentReport: 'align'
});

const app = useApp();

const reportHandle = computed(() => {
  const sampleId = props.sampleId;
  return app.model.outputs.reports?.data?.find(
    d => d.key[0] === sampleId &&
      d.key[1] === data.currentReport &&
      d.key[2] === 'txt')?.value?.handle;
});

const reportContent = computed(
  () => ReactiveFileContent.getContentString(reportHandle.value)?.value
);

const tabOptions: SimpleOption<ReportId>[] = [
  { value: 'align', text: 'Align' },
  { value: 'assemble', text: 'Assemble' }
];
</script>

<template>
  <PlContainer>
    <PlBtnGroup :options="tabOptions" v-model="data.currentReport" />
    <PlTextArea :model-value="reportContent" :rows="30" readonly />
  </PlContainer>
</template>
