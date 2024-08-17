import { BlockArgs, uniquePlId } from '@milaboratory/milaboratories.mixcr-clonotyping.model';
import { blockTest } from '@milaboratory/sdk-test';
import { blockSpec } from 'this-block';

blockTest('empty imputs', { timeout: 5000 }, async ({ rawPrj: project, ml, helpers, expect }) => {
  const blockId = await project.addBlock('Block', blockSpec);

  await project.runBlock(blockId);
  await helpers.awaitBlockDone(blockId);
  const blockState = project.getBlockState(blockId);
  const stableState = await blockState.awaitStableValue();
  expect(stableState.outputs).toStrictEqual({ test: { ok: true, value: 'test' } });
});
