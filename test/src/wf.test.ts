import {
  BlockArgs,
  BlockOutputs,
  platforma,
  uniquePlId
} from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { awaitStableState, blockTest } from '@milaboratory/sdk-test';
import { blockSpec as samplesAndDataBlockSpec } from '@milaboratory/milaboratories.samples-and-data';
import { BlockArgs as SamplesAndDataBlockArgs } from '@milaboratory/milaboratories.samples-and-data.model';
import { blockSpec as myBlockSpec } from 'this-block';
import { InferBlockState, fromPlRef, wrapOutputs } from '@milaboratory/sdk-ui';
import * as tp from 'node:timers/promises';

blockTest('empty imputs', { timeout: 10000 }, async ({ rawPrj: project, ml, helpers, expect }) => {
  const blockId = await project.addBlock('Block', myBlockSpec);
  const stableState = (await awaitStableState(
    project.getBlockState(blockId),
    5000
  )) as InferBlockState<typeof platforma>;
  expect(stableState.outputs).toMatchObject({ inputOptions: { ok: true, value: [] } });
  const presetsOutput = wrapOutputs(stableState.outputs).presets;
  const presetsStr = Buffer.from(
    await ml.driverKit.blobDriver.getContent(presetsOutput!.handle)
  ).toString();
  const presets = JSON.parse(presetsStr);
  expect(presets).length.gt(10);
});

blockTest(
  'preset content',
  { timeout: 10000 },
  async ({ rawPrj: project, ml, helpers, expect }) => {
    const blockId = await project.addBlock('Block', myBlockSpec);
    await project.setBlockArgs(blockId, {
      preset: 'milab-human-dna-xcr-7genes-multiplex'
    } satisfies BlockArgs);
    const stableState = (await awaitStableState(
      project.getBlockState(blockId),
      5000
    )) as InferBlockState<typeof platforma>;
    expect(stableState.outputs).toMatchObject({ preset: { ok: true } });
  }
);

blockTest(
  'simple project',
  { timeout: 25000 },
  async ({ rawPrj: project, ml, helpers, expect }) => {
    const sndBlockId = await project.addBlock('Samples & Data', samplesAndDataBlockSpec);
    const clonotypingBlockId = await project.addBlock('MiXCR Clonotyping', myBlockSpec);

    const sample1Id = uniquePlId();
    const metaColumn1Id = uniquePlId();
    const dataset1Id = uniquePlId();

    const r1Handle = await helpers.getLocalFileHandle('./assets/small_data_R1.fastq.gz');
    const r2Handle = await helpers.getLocalFileHandle('./assets/small_data_R2.fastq.gz');

    project.setBlockArgs(sndBlockId, {
      metadata: [
        {
          id: metaColumn1Id,
          label: 'MetaColumn1',
          global: false,
          valueType: 'Long',
          data: {
            [sample1Id]: 2345
          }
        }
      ],
      sampleIds: [sample1Id],
      sampleLabelColumnLabel: 'Sample Name',
      sampleLabels: { [sample1Id]: 'Sample 1' },
      datasets: [
        {
          id: dataset1Id,
          label: 'Dataset 1',
          content: {
            type: 'Fastq',
            readIndices: ['R1', 'R2'],
            gzipped: true,
            data: {
              [sample1Id]: {
                R1: r1Handle,
                R2: r2Handle
              }
            }
          }
        }
      ]
    } satisfies SamplesAndDataBlockArgs);
    await project.runBlock(sndBlockId);
    await helpers.awaitBlockDone(sndBlockId);
    const sndBlockState = project.getBlockState(sndBlockId);
    const clonotypingBlockState = project.getBlockState(clonotypingBlockId);

    const sdnStableState1 = await helpers.awaitBlockDoneAndGetStableBlockState(sndBlockId);
    expect(sdnStableState1.outputs).toMatchObject({
      fileImports: { ok: true, value: { [r1Handle]: { done: true }, [r2Handle]: { done: true } } }
    });

    const clonotypingStableState1 = (await awaitStableState(
      clonotypingBlockState,
      5000
    )) as InferBlockState<typeof platforma>;

    expect(clonotypingStableState1.outputs).toMatchObject({
      inputOptions: {
        ok: true,
        value: [
          {
            label: 'Samples & Data / Dataset 1'
          }
        ]
      }
    });

    const presetsOutput = wrapOutputs<BlockOutputs>(clonotypingStableState1.outputs).presets;
    const presetsStr = Buffer.from(
      await ml.driverKit.blobDriver.getContent(presetsOutput!.handle)
    ).toString();
    const presets = JSON.parse(presetsStr);
    expect(presets).length.gt(10);

    const clonotypingStableState1Outputs = wrapOutputs(clonotypingStableState1.outputs);

    await project.setBlockArgs(clonotypingBlockId, {
      input: clonotypingStableState1Outputs.inputOptions[0].ref,
      preset: 'milab-human-dna-xcr-7genes-multiplex'
    } satisfies BlockArgs);
    await project.runBlock(clonotypingBlockId);
    const clonotypingStableState2 = (await helpers.awaitBlockDoneAndGetStableBlockState(
      clonotypingBlockId,
      10000
    )) as InferBlockState<typeof platforma>;
    const outputs2 = wrapOutputs<BlockOutputs>(clonotypingStableState2.outputs);

    console.dir(clonotypingStableState2, { depth: 8 });

    expect(outputs2.reports.isComplete).toEqual(true);

    const alignJsonReportEntry = outputs2.reports.data.find(
      (e) => e.key[1] === 'align' && e.key[2] === 'json'
    );

    expect(alignJsonReportEntry).toBeDefined();

    const alignJsonReport = JSON.parse(
      Buffer.from(
        await ml.driverKit.blobDriver.getContent(alignJsonReportEntry!.value!.handle)
      ).toString('utf8')
    );

    console.dir(alignJsonReport, { depth: 5 });
    expect(alignJsonReport.aligned).toBeDefined();
    expect(alignJsonReport.aligned).greaterThan(2);

    // console.dir(alignJsonReport, { depth: 5 });

    console.dir(clonotypingStableState2, { depth: 8 });
  }
);
