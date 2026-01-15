import type { BlockArgs, BlockOutputs, platforma } from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import {
  AlignReport,
  AssembleReport,
  Qc,
  SupportedPresetList,
  uniquePlId,
} from '@platforma-open/milaboratories.mixcr-clonotyping-2.model';
import { awaitStableState, blockTest } from '@platforma-sdk/test';
import { blockSpec as samplesAndDataBlockSpec } from '@platforma-open/milaboratories.samples-and-data';
import type { BlockArgs as SamplesAndDataBlockArgs } from '@platforma-open/milaboratories.samples-and-data.model';
import { blockSpec as myBlockSpec } from 'this-block';
import type { InferBlockState } from '@platforma-sdk/model';
import { wrapOutputs } from '@platforma-sdk/model';

type AxisSpec = { name: string; domain?: Record<string, string> };
type PColumnListEntry = { spec: { axesSpec: AxisSpec[] } };

blockTest('empty imputs', { timeout: 20000 }, async ({ rawPrj: project, ml, expect }) => {
  const blockId = await project.addBlock('Block', myBlockSpec);
  const stableState = (await awaitStableState(
    project.getBlockState(blockId),
    25000,
  )) as InferBlockState<typeof platforma>;
  expect(stableState.outputs).toMatchObject({ inputOptions: { ok: true, value: [] } });
  const presets = SupportedPresetList.parse(
    JSON.parse(
      Buffer.from(
        await ml.driverKit.blobDriver.getContent(wrapOutputs(stableState.outputs).presets!.handle),
      ).toString(),
    ),
  );
  expect(presets).length.gt(10);
  expect(presets?.map((p) => p.presetName)).toContain('10x-sc-xcr-vdj');
});

blockTest(
  'preset content',
  { timeout: 30000 },
  async ({ rawPrj: project, expect }) => {
    const blockId = await project.addBlock('Block', myBlockSpec);
    await project.setBlockArgs(blockId, {
      preset: { type: 'name', name: 'milab-human-dna-xcr-7genes-multiplex' },
    } satisfies BlockArgs);
    const stableState = (await awaitStableState(
      project.getBlockState(blockId),
      10000,
    )) as InferBlockState<typeof platforma>;
    const preset = wrapOutputs(stableState.outputs).preset;
    expect(preset).toBeTypeOf('object');
  },
);

blockTest(
  'simple project',
  { timeout: 150000 },
  async ({ rawPrj: project, ml, helpers, expect }) => {
    const sndBlockId = await project.addBlock('Samples & Data', samplesAndDataBlockSpec);
    const clonotypingBlockId = await project.addBlock('MiXCR Clonotyping', myBlockSpec);

    const sample1Id = uniquePlId();
    const metaColumn1Id = uniquePlId();
    const dataset1Id = uniquePlId();

    const r1Handle = await helpers.getLocalFileHandle('./assets/small_data_R1.fastq.gz');
    const r2Handle = await helpers.getLocalFileHandle('./assets/small_data_R2.fastq.gz');

    await project.setBlockArgs(sndBlockId, {
      metadata: [
        {
          id: metaColumn1Id,
          label: 'MetaColumn1',
          global: false,
          valueType: 'Long',
          data: {
            [sample1Id]: 2345,
          },
        },
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
                R2: r2Handle,
              },
            },
          },
        },
      ],
    } satisfies SamplesAndDataBlockArgs);
    await project.runBlock(sndBlockId);
    await helpers.awaitBlockDone(sndBlockId, 8000);
    const clonotypingBlockState = project.getBlockState(clonotypingBlockId);

    const sdnStableState1 = await helpers.awaitBlockDoneAndGetStableBlockState(sndBlockId, 8000);
    expect(sdnStableState1.outputs).toMatchObject({
      fileImports: { ok: true, value: { [r1Handle]: { done: true }, [r2Handle]: { done: true } } },
    });

    const clonotypingStableState1 = (await awaitStableState(
      clonotypingBlockState,
      25000,
    )) as InferBlockState<typeof platforma>;

    expect(clonotypingStableState1.outputs).toMatchObject({
      inputOptions: {
        ok: true,
        value: [
          {
            label: 'Dataset 1',
          },
        ],
      },
    });

    const presets = SupportedPresetList.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(wrapOutputs(clonotypingStableState1.outputs).presets!.handle),
        ).toString(),
      ),
    );
    expect(presets).length.gt(10);

    const clonotypingStableState1Outputs = wrapOutputs(clonotypingStableState1.outputs);

    await project.setBlockArgs(clonotypingBlockId, {
      input: clonotypingStableState1Outputs.inputOptions[0].ref,
      preset: { type: 'name', name: 'milab-human-dna-xcr-7genes-multiplex' },
      chains: ['IGHeavy', 'IGLight'],
    } satisfies BlockArgs);

    const clonotypingStableState2 = (await awaitStableState(
      project.getBlockState(clonotypingBlockId),
      25000,
    )) as InferBlockState<typeof platforma>;

    const outputs2 = wrapOutputs<BlockOutputs>(clonotypingStableState2.outputs);
    // console.dir(outputs2.sampleLabels, { depth: 5 });
    // console.log(JSON.stringify([sample1Id]));
    expect(outputs2.sampleLabels![sample1Id]).toBeDefined();

    await project.runBlock(clonotypingBlockId);
    const clonotypingStableState3 = await helpers.awaitBlockDoneAndGetStableBlockState(
      clonotypingBlockId,
      100000,
    );
    const outputs3 = wrapOutputs<BlockOutputs>(
      clonotypingStableState3.outputs as unknown as BlockOutputs,
    );

    // console.dir(clonotypingStableState3, { depth: 8 });

    expect(outputs3.reports.isComplete).toEqual(true);

    const qcEntry = outputs3.qc.data[0];
    expect(qcEntry).toBeDefined();

    const reportEntries = outputs3.reports.data;
    const alignJsonReportEntry = reportEntries.find(
      (entry) => entry.key[1] === 'align' && entry.key[2] === 'json',
    );
    const assembleJsonReportEntry = reportEntries.find(
      (entry) => entry.key[1] === 'assemble' && entry.key[2] === 'json',
    );

    expect(alignJsonReportEntry).toBeDefined();
    expect(assembleJsonReportEntry).toBeDefined();

    const alignReport = AlignReport.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            alignJsonReportEntry!.value!.handle as Parameters<
              typeof ml.driverKit.blobDriver.getContent
            >[0],
          ),
        ).toString('utf8'),
      ),
    );
    const assembledReport = AssembleReport.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            assembleJsonReportEntry!.value!.handle as Parameters<
              typeof ml.driverKit.blobDriver.getContent
            >[0],
          ),
        ).toString('utf8'),
      ),
    );

    const qc = Qc.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            qcEntry.value!.handle as Parameters<typeof ml.driverKit.blobDriver.getContent>[0],
          ),
        ).toString('utf8'),
      ),
    );

    expect(alignReport.aligned).greaterThan(2);
    expect(assembledReport).toBeDefined();
    expect(qc).toBeDefined();

    const clonesPfHandle = wrapOutputs<BlockOutputs>(
      clonotypingStableState3.outputs as unknown as BlockOutputs,
    )
      .clones as Parameters<typeof ml.driverKit.pFrameDriver.listColumns>[0];

    const clonesPfColumnList = (await ml.driverKit.pFrameDriver.listColumns(
      clonesPfHandle,
    )) as PColumnListEntry[];

    // console.dir(clonesPfColumnList[0].spec, { depth: 5 });

    expect(
      clonesPfColumnList
        .map((c) => c.spec.axesSpec.find((s) => s.name === 'pl7.app/vdj/clonotypeKey'))
        .find(Boolean)?.domain,
    ).toHaveProperty('pl7.app/vdj/clonotypeKey/structure');

    expect(clonesPfColumnList).length.to.greaterThanOrEqual(7);
  },
);

blockTest(
  'simple sc project',
  { timeout: 400000 },
  async ({ rawPrj: project, ml, helpers, expect }) => {
    const sndBlockId = await project.addBlock('Samples & Data', samplesAndDataBlockSpec);
    const clonotypingBlockId = await project.addBlock('MiXCR Clonotyping', myBlockSpec);

    const sample1Id = uniquePlId();
    const sample2Id = uniquePlId();
    const metaColumn1Id = uniquePlId();
    const dataset1Id = uniquePlId();

    const s1r1Handle = await helpers.getLocalFileHandle('./assets/SRR11233623-sc_R1.fastq.gz');
    const s1r2Handle = await helpers.getLocalFileHandle('./assets/SRR11233623-sc_R2.fastq.gz');

    const s2r1Handle = await helpers.getLocalFileHandle('./assets/SRR11233625-sc_R1.fastq.gz');
    const s2r2Handle = await helpers.getLocalFileHandle('./assets/SRR11233625-sc_R2.fastq.gz');

    await project.setBlockArgs(sndBlockId, {
      metadata: [
        {
          id: metaColumn1Id,
          label: 'MetaColumn1',
          global: false,
          valueType: 'Long',
          data: {
            [sample1Id]: 2345,
          },
        },
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
                R1: s1r1Handle,
                R2: s1r2Handle,
              },
              [sample2Id]: {
                R1: s2r1Handle,
                R2: s2r2Handle,
              },
            },
          },
        },
      ],
    } satisfies SamplesAndDataBlockArgs);
    await project.runBlock(sndBlockId);
    await helpers.awaitBlockDone(sndBlockId, 8000);
    const clonotypingBlockState = project.getBlockState(clonotypingBlockId);

    const sdnStableState1 = await helpers.awaitBlockDoneAndGetStableBlockState(sndBlockId, 8000);
    expect(sdnStableState1.outputs).toMatchObject({
      fileImports: { ok: true, value: { [s1r1Handle]: { done: true }, [s1r2Handle]: { done: true }, [s2r1Handle]: { done: true }, [s2r2Handle]: { done: true } } },
    });

    const clonotypingStableState1 = (await awaitStableState(
      clonotypingBlockState,
      40000,
    )) as InferBlockState<typeof platforma>;

    expect(clonotypingStableState1.outputs).toMatchObject({
      inputOptions: {
        ok: true,
        value: [
          {
            label: 'Dataset 1',
          },
        ],
      },
    });

    const presets = SupportedPresetList.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(wrapOutputs(clonotypingStableState1.outputs).presets!.handle),
        ).toString(),
      ),
    );
    expect(presets).length.gt(10);

    const clonotypingStableState1Outputs = wrapOutputs(clonotypingStableState1.outputs);

    await project.setBlockArgs(clonotypingBlockId, {
      input: clonotypingStableState1Outputs.inputOptions[0].ref,
      preset: { type: 'name', name: '10x-sc-xcr-vdj' },
      species: 'human',
      chains: ['IG'],
    } satisfies BlockArgs);

    const clonotypingStableState2 = (await awaitStableState(
      project.getBlockState(clonotypingBlockId),
      40000,
    )) as InferBlockState<typeof platforma>;

    const outputs2 = wrapOutputs<BlockOutputs>(clonotypingStableState2.outputs);
    // console.dir(outputs2.sampleLabels, { depth: 5 });
    // console.log(JSON.stringify([sample1Id]));
    expect(outputs2.sampleLabels![sample1Id]).toBeDefined();

    await project.runBlock(clonotypingBlockId);
    const clonotypingStableState3 = await helpers.awaitBlockDoneAndGetStableBlockState(
      clonotypingBlockId,
      300000,
    );
    const outputs3 = wrapOutputs<BlockOutputs>(
      clonotypingStableState3.outputs as unknown as BlockOutputs,
    );

    // console.dir(clonotypingStableState3, { depth: 8 });

    expect(outputs3.reports.isComplete).toEqual(true);

    const qcEntry = outputs3.qc.data[0];
    expect(qcEntry).toBeDefined();

    const reportEntries = outputs3.reports.data;
    const alignJsonReportEntry = reportEntries.find(
      (entry) => entry.key[1] === 'align' && entry.key[2] === 'json',
    );
    const assembleJsonReportEntry = reportEntries.find(
      (entry) => entry.key[1] === 'assemble' && entry.key[2] === 'json',
    );

    expect(alignJsonReportEntry).toBeDefined();
    expect(assembleJsonReportEntry).toBeDefined();

    const alignReport = AlignReport.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            alignJsonReportEntry!.value!.handle as Parameters<
              typeof ml.driverKit.blobDriver.getContent
            >[0],
          ),
        ).toString('utf8'),
      ),
    );
    const assembledReport = AssembleReport.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            assembleJsonReportEntry!.value!.handle as Parameters<
              typeof ml.driverKit.blobDriver.getContent
            >[0],
          ),
        ).toString('utf8'),
      ),
    );

    const qc = Qc.parse(
      JSON.parse(
        Buffer.from(
          await ml.driverKit.blobDriver.getContent(
            qcEntry.value!.handle as Parameters<typeof ml.driverKit.blobDriver.getContent>[0],
          ),
        ).toString('utf8'),
      ),
    );

    expect(alignReport.aligned).greaterThan(2);
    expect(assembledReport).toBeDefined();
    expect(qc).toBeDefined();

    const clonesPfHandle = wrapOutputs<BlockOutputs>(
      clonotypingStableState3.outputs as unknown as BlockOutputs,
    )
      .clones as Parameters<typeof ml.driverKit.pFrameDriver.listColumns>[0];

    const clonesPfColumnList = (await ml.driverKit.pFrameDriver.listColumns(
      clonesPfHandle,
    )) as PColumnListEntry[];

    // console.dir(clonesPfColumnList[0].spec, { depth: 5 });

    expect(
      clonesPfColumnList
        .map((c) => c.spec.axesSpec.find((s) => s.name === 'pl7.app/vdj/scClonotypeKey'))
        .find(Boolean)?.domain,
    ).toHaveProperty('pl7.app/vdj/scClonotypeKey/structure');

    expect(
      clonesPfColumnList.some((c) =>
        c.spec.axesSpec.find((s) => s.name === 'pl7.app/vdj/scClonotypeKey')
        && c.spec.axesSpec.find((s) => s.name === 'pl7.app/sampleId'),
      ),
    ).toEqual(true);

    expect(clonesPfColumnList).length.to.greaterThanOrEqual(7);
  },
);
