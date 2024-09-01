import {
  BlockModel,
  InferHrefType,
  Option,
  isPColumnSpec,
  type InferOutputsType
} from '@milaboratory/sdk-ui';
import { BlockArgs, BlockArgsValid } from './args';
import { parseResourceMap } from './helpers';

export const platforma = BlockModel.create<BlockArgs>('Heavy')

  .initialArgs({})

  .output('presets', (ctx) =>
    ctx.prerun?.resolve({ field: 'presets', assertFieldType: 'Input' })?.getFileHandle()
  )

  .output('preset', (ctx) =>
    ctx.prerun?.resolve({ field: 'preset', assertFieldType: 'Input' })?.getDataAsString()
  )

  .output('qc', (ctx) =>
    parseResourceMap(ctx.outputs?.resolve({ field: 'qc', assertFieldType: 'Input' }), (acc) =>
      acc.getRemoteFileHandle()
    )
  )

  .output('reports', (ctx) =>
    parseResourceMap(ctx.outputs?.resolve({ field: 'reports', assertFieldType: 'Input' }), (acc) =>
      acc.getRemoteFileHandle()
    )
  )

  .output('clones', (ctx) =>
    parseResourceMap(ctx.outputs?.resolve({ field: 'clones', assertFieldType: 'Input' }), (acc) =>
      acc.listInputFields()
    )
  )

  .output('inputOptions', (ctx) => {
    const spectFromPool = ctx.resultPool.getSpecsFromResultPool();
    return ctx.resultPool
      .getSpecsFromResultPool()
      .entries.filter((v) => {
        if (!isPColumnSpec(v.obj)) return false;
        const domain = v.obj.domain;
        return (
          v.obj.name === 'pl7.app/sequencing/data' &&
          (v.obj.valueType as string) === 'File' &&
          domain !== undefined &&
          (domain['pl7.app/fileExtension'] === 'fastq' ||
            domain['pl7.app/fileExtension'] === 'fastq.gz')
        );
      })
      .map(
        (v) =>
          ({
            ref: v.ref,
            label: `${ctx.getBlockLabel(v.ref.blockId)} / ${
              v.obj.annotations?.['pl7.app/label'] ?? `unlabelled`
            }`
          } satisfies Option)
      );
  })

  .sections((ctx) => {
    return [{ type: 'link', href: '/', label: 'Settings' }];
  })

  .inputsValid((ctx) => BlockArgsValid.safeParse(ctx.args).success)

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
export type Href = InferHrefType<typeof platforma>;
export * from './args';
export * from './helpers';
export { BlockArgs };
