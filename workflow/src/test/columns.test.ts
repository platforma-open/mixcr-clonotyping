import { awaitStableState, tplTest, ML } from '@milaboratory/sdk-test';
import { ExpectStatic } from 'vitest';

type TestCase = {
  presetName: string;
  check: (expect: ExpectStatic, config: any) => void;
};

const testCases: TestCase[] = [
  {
    presetName: 'milab-human-dna-xcr-7genes-multiplex',
    check: (expect, config) => {
      console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.columns.find((c: any) => c.column === 'readCount')).toBeDefined();
    }
  }
];

tplTest.for(testCases)(
  'checking preset for $presetName',
  { timeout: 10000 },
  async ({ presetName, check }, { helper, expect }) => {
    const resultC = (
      await helper.renderTemplate(true, 'test.columns.test', ['conf'], (tx) => {
        return {
          presetName: tx.createValue(ML.Pl.JsonObject, JSON.stringify(presetName))
        };
      })
    ).computeOutput('conf', (c) => c?.getDataAsJson());
    const result = await awaitStableState(resultC, 5000);
    check(expect, result);
  }
);
