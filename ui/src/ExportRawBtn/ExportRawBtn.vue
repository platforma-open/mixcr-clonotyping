<script setup lang="ts">
import {
  PlBtnGhost,
  PlIcon16,
  PlIcon24,
  useClickOutside,
} from '@platforma-sdk/ui-vue';
import { uniqueId } from '@milaboratories/helpers';
import { useApp } from '../app';
import { ZipWriter } from '@zip.js/zip.js';
import { ChunkedStreamReader } from '../ChunkedStreamReader';
import { reactive, computed, ref } from 'vue';
import type { ExportItem, ExportsMap } from './types';
import Item from './Item.vue';

const app = useApp();

const data = reactive({
  loading: false,
  name: '',
  exports: undefined as ExportsMap | undefined,
  showExports: false,
});

const isReadyToExport = computed(() => {
  return app.model.outputs.rawTsvs !== undefined && app.model.outputs.sampleLabels !== undefined;
});

const items = computed(() => {
  return Array.from(data.exports?.values() ?? []);
});

const archive = computed<ExportItem>(() => {
  return {
    fileName: data.name,
    current: items.value.reduce((acc, item) => acc + item.current, 0),
    size: items.value.reduce((acc, item) => acc + item.size, 0),
    status: items.value.some((item) => item.status === 'in-progress') ? 'in-progress' : items.value.every((item) => item.status === 'completed') ? 'completed' : 'pending',
  };
});

type ZipRequest = {
  id: string;
  fileName: string;
  size: number;
  stream: ChunkedStreamReader;
}

const exportRawTsvs = async () => {
  if (data.loading) {
    data.showExports = true;
    return;
  }

  if (!isReadyToExport.value) {
    return;
  }

  const pCols = app.model.outputs.rawTsvs;
  if (pCols === undefined) {
    return;
  }

  const sampleLabels = app.model.outputs.sampleLabels;
  if (sampleLabels === undefined) return undefined;

  const newHandle = await window.showSaveFilePicker({
    types: [{
      description: 'ZIP files',
      accept: {
        'application/zip': ['.zip'],
      },
    }],
    suggestedName: `${new Date().toISOString().split('T')[0]}_ClonotypingResultsRaw_${app.model.args.title ?? 'Untitled'}.zip`,
  });

  data.loading = true;
  data.name = newHandle.name;
  data.showExports = true;
  data.exports = new Map();

  try {
    const writableStream = await newHandle.createWritable();
    const zip = new ZipWriter(writableStream, { keepOrder: true, zip64: true, bufferedWrite: false });

    try {
      const requests = [] as ZipRequest[];

      for (const pCol of pCols) {
        for (const { key, value } of pCol.data) {
          const fileName = `${sampleLabels[key[0]]}_${pCol.id}.tsv`;
          const id = uniqueId();
          const { handle, size } = value!;

          data.exports?.set(id, { fileName, current: 0, size, status: 'pending' });

          // Create a chunked stream reader for efficient streaming
          requests.push({ id, fileName, size, stream: new ChunkedStreamReader(handle, size) });
        }
      }

      for (const request of requests) {
        const { id, fileName, size, stream } = request;
        const update = (partial: Partial<ExportItem>) => {
          const it = data.exports?.get(id);
          if (it) {
            data.exports?.set(id, { ...it, ...partial });
          }
        };
        await zip.add(fileName, stream.createStream(), {
          bufferedWrite: false,
          onstart: () => {
            update({ status: 'in-progress' });
            return undefined;
          },
          onprogress: (current) => {
            update({ current });
            return undefined;
          },
          onend() {
            update({ current: size, status: 'completed' });
            return undefined;
          },
        });
      }
    } finally {
      await zip.close();
    }
  } finally {
    data.loading = false;
  }
};

const progressesRef = ref();

useClickOutside([progressesRef], () => {
  data.showExports = false;
});
</script>

<template>
  <PlBtnGhost :disabled="!isReadyToExport" :loading="data.loading" :class="{ [$style['has-exports']]: data.exports }"
    @click.stop="exportRawTsvs">
    Export Raw Results
    <template #append>
      <PlIcon24 :class="$style.icon" name="download" />
    </template>
  </PlBtnGhost>
  <Teleport to="body">
    <div v-if="data.exports && data.showExports" ref="progressesRef" :class="$style.progresses">
      <PlIcon16 :class="$style.close" name="close" @click.stop="data.showExports = false" />
      <Item :item="archive" :class="$style.archive" />
      <div :class="$style.items" class="pl-scrollable-y">
        <Item v-for="item in data.exports?.values()" :key="item.fileName" :item="item" />
      </div>
    </div>
  </Teleport>
</template>

<style module>
.archive {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
  --name-font-size: 14px;
  --details-font-size: 12px;
}

.progresses {
  position: fixed;
  top: 8px;
  right: 8px;
  width: 350px;
  height: auto;
  max-height: 400px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 20px 8px 8px 20px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  z-index: 1000;

  .items {
    max-height: 300px;
  }

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    --icon-color: white;
  }
}
</style>
