import { BlockModel, InferHrefType, type InferOutputsType } from '@milaboratory/sdk-ui';
import { BlockArgs } from './args';

export const platforma = BlockModel.create<BlockArgs>('Heavy')

  .initialArgs({})

  .output('test', (ctx) => ctx.outputs?.resolve('test')?.getDataAsJson())

  .sections((ctx) => {
    return [{ type: 'link', href: '/', label: 'Settings' }];
  })

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
export type Href = InferHrefType<typeof platforma>;
export * from './args';
export * from './helpers';
export { BlockArgs };
