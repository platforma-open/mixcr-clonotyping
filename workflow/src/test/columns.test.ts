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
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
    }
  },
  {
    presetName: '10x-sc-xcr-vdj',
    species: 'human',
    check: (expect, config) => {
      console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(2);
      expect(config.axes.find((c: any) => c.column === 'tagValueCELL')).toBeDefined();
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'cellGroup')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR4')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR4')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'topChains')).toBeDefined();
    }
  },
  {
    presetName: 'cellecta-human-rna-xcr-umi-drivermap-air',
    check: (expect, config) => {
      console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
    }
  },
  {
    presetName: 'takara-human-rna-bcr-umi-smartseq',
    check: (expect, config) => {
      console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqFR4')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR1')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR2')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqFR4')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'isotype')).toBeDefined();
    }
  },
  {
    presetName: 'rna-seq',
    species: 'human',
    check: (expect, config) => {
      console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'minQualCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
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
  { timeout: 30000 },
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
    const result = await awaitStableState(resultC, 20000);
    check(expect, result);
  }
);
