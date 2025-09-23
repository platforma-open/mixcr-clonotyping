<script setup lang="ts">
import {
  PlBtnGhost,
  PlIcon16,
} from '@platforma-sdk/ui-vue';
import { prettyBytes } from '@milaboratories/helpers';
import { useApp } from './app';
import { ZipWriter } from '@zip.js/zip.js';
import { ChunkedStreamReader } from './ChunkedStreamReader';
import { reactive, computed } from 'vue';

const app = useApp();

type ExportsMap = Map<string, {
  fileName: string;
  current: number;
  size: number;
}>;

const data = reactive({
  exports: undefined as ExportsMap | undefined,
});

const isReadyToExport = computed(() => {
  return app.model.outputs.rawTsvs !== undefined && app.model.outputs.sampleLabels !== undefined;
});

const exportRawTsvs = async () => {
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
    suggestedName: 'raw-tsvs.zip',
  });

  data.exports = new Map();

  try {
    const writableStream = await newHandle.createWritable();
    const zip = new ZipWriter(writableStream);

    const promises: Promise<unknown>[] = [];

    for (const pCol of pCols) {
      for (const { key, value } of pCol.data) {
        const fileName = `${sampleLabels[key[0]]}_${pCol.id}.tsv`;
        const handle = value!.handle;
        const size = value!.size;
        // console.log(pCol.id, key, value!.size, fileName);

        // Create a chunked stream reader for efficient streaming
        const streamReader = new ChunkedStreamReader(handle, size, 10_000);
        const readableStream = streamReader.createStream();
        const updateProgress = (current: number) => {
          data.exports?.set(fileName, { fileName, current, size });
        };
        promises.push(zip.add(fileName, readableStream, {
          onstart: () => {
            data.exports?.set(fileName, { fileName, current: 0, size });
            return undefined;
          },
          onprogress: (current) => {
            updateProgress(current);
            return undefined;
          },
          onend() {
            updateProgress(size);
            return undefined;
          },
        }));
      }
    }

    await Promise.all(promises);

    await zip.close();
  } finally {
    data.exports = undefined;
  }
};
</script>

<template>
  <PlBtnGhost icon="download" :disabled="!isReadyToExport" :loading="data.exports !== undefined" @click.stop="exportRawTsvs">
    Export Raw Results
  </PlBtnGhost>
  <Teleport to="body">
    <div v-if="data.exports" :class="$style.progresses">
      <PlIcon16 :class="$style.close" name="close" @click.stop="data.exports = undefined" />
      <div
        v-for="progress in data.exports.values()"
        :key="progress.fileName"
        :class="$style.progress"
      >
        <div>{{ progress.fileName }}</div>
        <div :class="$style.sizes">
          <span>{{ prettyBytes(progress.current, {}) }}</span>
          <span>/</span>
          <span>{{ prettyBytes(progress.size, {}) }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style module>
.progresses {
  position: fixed;
  top: 8px;
  right: 8px;
  width: 200px;
  height: auto;
  max-height: 400px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  z-index: 1000;
  padding: 20px;
  .progress {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
    .sizes {
      font-size: 10px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
    }
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
