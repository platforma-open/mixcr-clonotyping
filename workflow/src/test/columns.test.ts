import { ImportFileHandle } from '@platforma-sdk/model';
import { awaitStableState, tplTest, ML } from '@platforma-sdk/test';
import { ExpectStatic } from 'vitest';

type Preset =
  | {
      type: 'name';
      name: string;
    }
  | {
      type: 'file';
      file: ImportFileHandle;
    };

type Params = {
  species?: string;
};

type TestCase = {
  preset: string;
  species?: string;
  check: (expect: ExpectStatic, config: any) => void;
};

const testCases: TestCase[] = [
  {
    preset: 'milab-human-dna-xcr-7genes-multiplex',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'readFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
    }
  },
  {
    preset: '10x-sc-xcr-vdj',
    species: 'human',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
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
    preset: 'cellecta-human-rna-xcr-umi-drivermap-air',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.axes.find((c: any) => c.column === 'cloneId')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeCount')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'uniqueMoleculeFraction')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'nSeqCDR3')).toBeDefined();
      expect(config.columns.find((c: any) => c.column === 'aaSeqCDR3')).toBeDefined();
    }
  },
  {
    preset: 'takara-human-rna-bcr-umi-smartseq',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
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
    preset: 'rna-seq',
    species: 'human',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
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
    preset: 'generic-single-cell-gex',
    species: 'human',
    check: (expect, config) => {
      // console.dir(config, { depth: 5 });
      expect(config.axes).to.have.lengthOf(1);
      expect(config.columns.find((c: any) => c.column === 'readCount')).toBeDefined();
    }
  }
];

tplTest.for(testCases)(
  'checking preset for $presetName',
  { timeout: 30000 },
  async ({ preset, species, check }, { helper, expect }) => {
    const resultC = (
      await helper.renderTemplate(true, 'test.columns.test', ['conf'], (tx) => {
        return {
          preset: tx.createValue(
            ML.Pl.JsonObject,
            JSON.stringify({ type: 'name', name: preset } satisfies Preset)
          ),
          params: tx.createValue(ML.Pl.JsonObject, JSON.stringify({ species } satisfies Params))
        };
      })
    ).computeOutput('conf', (c) => c?.getDataAsJson());
    const result = await awaitStableState(resultC, 20000);
    check(expect, result);
  }
);
