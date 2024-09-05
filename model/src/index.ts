import {
  BlockModel,
  InferHrefType,
  Option,
  isPColumn,
  isPColumnSpec,
  type InferOutputsType
} from '@milaboratory/sdk-ui';
import { BlockArgs, BlockArgsValid } from './args';
import { parseResourceMap } from './helpers';
import { ProgressPrefix } from './logs';
import { SupportedPresetList } from './preset';

export const platforma = BlockModel.create<BlockArgs>('Heavy')

  .initialArgs({})

  .output('presets', (ctx) =>
    SupportedPresetList.parse(
      ctx.prerun?.resolve({ field: 'presets', assertFieldType: 'Input' })?.getFileContentAsJson()
    )
  )

  .output('preset', (ctx) =>
    ctx.prerun
      ?.resolve({ field: 'preset', assertFieldType: 'Input', allowPermanentAbsence: true })
      ?.getDataAsJson<any>()
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

  .output('logs', (ctx) => {
    return parseResourceMap(
      ctx.outputs?.resolve({ field: 'logs', assertFieldType: 'Input' }),
      (acc) => acc.getLogHandle()
    );
  })

  .output('progress', (ctx) => {
    return parseResourceMap(
      ctx.outputs?.resolve({ field: 'logs', assertFieldType: 'Input' }),
      (acc) => acc.getProgressLog(ProgressPrefix)
    );
  })

  .output('clones', (ctx) => {
    const collection = ctx.outputs
      ?.resolve({ field: 'clones', assertFieldType: 'Input' })
      ?.parsePObjectCollection();
    if (collection === undefined) return undefined;
    // if (collection === undefined || !collection.isComplete) return undefined;
    const pColumns = Object.entries(collection)
      .map(([id, obj]) => obj)
      .filter(isPColumn);
    return ctx.createPFrame(pColumns);
  })

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
