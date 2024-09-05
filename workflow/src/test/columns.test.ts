import { awaitStableState, tplTest, ML } from '@milaboratory/sdk-test';
import { ExpectStatic } from 'vitest';

type Request = {
  presetName: string;
  species?: string;
};

type TestCase = Request & {
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
  },
  {
    presetName: 'generic-single-cell-gex',
    species: 'human',
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
  async ({ presetName, species, check }, { helper, expect }) => {
    const resultC = (
      await helper.renderTemplate(true, 'test.columns.test', ['conf'], (tx) => {
        return {
          request: tx.createValue(
            ML.Pl.JsonObject,
            JSON.stringify({ presetName, species } satisfies Request)
          )
        };
      })
    ).computeOutput('conf', (c) => c?.getDataAsJson());
    const result = await awaitStableState(resultC, 10000);
    check(expect, result);
  }
);
