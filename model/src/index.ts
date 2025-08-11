import type {
  InferHrefType,
} from '@platforma-sdk/model';
import {
  BlockModel,
  It,
  MainOutputs,
  StagingOutputs,
  getImportProgress,
  getResourceField,
  isPColumn,
  isPColumnSpec,
  mapResourceFields,
  parseResourceMap,
  type InferOutputsType,
} from '@platforma-sdk/model';
import { BlockArgs, BlockArgsValid } from './args';
import { ProgressPrefix } from './progress';

const receptors = [
  { value: 'IG', label: 'IG' },
  { value: 'TCRAB', label: 'TCR-αβ' },
  { value: 'TCRGD', label: 'TCR-ɣδ' },
];
const chains = [
  { value: 'IGHeavy', label: 'IG Heavy' },
  { value: 'IGLight', label: 'IG Light' },
  { value: 'TCRAlpha', label: 'TCR-α' },
  { value: 'TCRBeta', label: 'TCR-β' },
  { value: 'TCRGamma', label: 'TCR-ɣ' },
  { value: 'TCRDelta', label: 'TCR-δ' },
];

export type UiState = {
  lastLibraryHash: string;
  lastSingleCellHash: string;
};

export const platforma = BlockModel.create('Heavy')

  .withArgs<BlockArgs>({
    chains: ['IG', 'TCRAB', 'TCRGD'],
  })

  .withUiState<UiState>({
    lastLibraryHash: '',
    lastSingleCellHash: '',
  })

  .retentiveOutput('presets', (ctx) =>
    ctx.prerun?.resolve({ field: 'presets', assertFieldType: 'Input' })?.getFileHandle(),
  )

  .retentiveOutput('preset', (ctx) =>
    ctx.prerun
      ?.resolve({ field: 'preset', assertFieldType: 'Input', allowPermanentAbsence: true })
      ?.getDataAsJson<string>(),
  )

  .output('libraryOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => spec.annotations?.['pl7.app/vdj/isLibrary'] === 'true',
      { label: { includeNativeLabel: true, addLabelAsSuffix: true } }),
  )

  .output('availableChains', (ctx) => {
    const allOptions = [...receptors, ...chains];

    if (ctx.args.inputLibrary) {
      const spec = ctx.resultPool.getSpecByRef(ctx.args.inputLibrary);
      if (spec) {
        const chainString = spec.annotations?.['pl7.app/vdj/chain'];
        if (chainString) {
          const libraryChains = JSON.parse(chainString) as string[];
          const filtered = chains.filter((c) => libraryChains.includes(c.value));
          const options = filtered.length ? filtered : chains;
          return {
            options,
            defaults: options.map((o) => o.value),
          };
        }
      }
    }

    // **No library** → everything is both available *and* selected by default
    return {
      options: allOptions,
      defaults: allOptions.map((o) => o.value),
    };
  })

  .output('qc', (ctx) =>
    parseResourceMap(ctx.outputs?.resolve('qc'), (acc) => acc.getFileHandle(), true),
  )

  .output('reports', (ctx) =>
    parseResourceMap(ctx.outputs?.resolve('reports'), (acc) => acc.getFileHandle(), false),
  )

  .output('logs', (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve('logs'), (acc) => acc.getLogHandle(), false)
      : undefined;
  })

  .output('progress', (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(
          ctx.outputs?.resolve('logs'),
          (acc) => acc.getProgressLog(ProgressPrefix),
          false,
        )
      : undefined;
  })

  .output('started', (ctx) => ctx.outputs !== undefined)

  .output('done', (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve('clns'), (_acc) => true, false).data.map(
          (e) => e.key[0] as string,
        )
      : undefined;
  })

  .output('clones', (ctx) => {
    const collection = ctx.outputs?.resolve('clonotypes')?.parsePObjectCollection();
    if (collection === undefined) return undefined;
    // if (collection === undefined || !collection.isComplete) return undefined;
    const pColumns = Object.values(collection).filter(isPColumn);
    return ctx.createPFrame(pColumns);
  })

  .retentiveOutput('inputOptions', (ctx) => {
    return ctx.resultPool.getOptions((v) => {
      if (!isPColumnSpec(v)) return false;
      const domain = v.domain;
      return (
        v.name === 'pl7.app/sequencing/data'
        && (v.valueType as string) === 'File'
        && domain !== undefined
        && (domain['pl7.app/fileExtension'] === 'fasta'
          || domain['pl7.app/fileExtension'] === 'fasta.gz'
          || domain['pl7.app/fileExtension'] === 'fastq'
          || domain['pl7.app/fileExtension'] === 'fastq.gz')
      );
    });

    // .map(
    //   (v) =>
    //     ({
    //       ref: v.ref,
    //       label: `${ctx.getBlockLabel(v.ref.blockId)} / ${
    //         v.obj.annotations?.['pl7.app/label'] ?? `unlabelled`
    //       }`
    //     } satisfies Option)
    // );
  })

  .output('sampleLabels', (ctx): Record<string, string> | undefined => {
    const inputRef = ctx.args.input;
    if (inputRef === undefined) return undefined;
    // @todo implement getSpecByRef method
    const inputSpec = ctx.resultPool
      .getSpecs()
      .entries.find(
        (obj) => obj.ref.blockId === inputRef.blockId && obj.ref.name === inputRef.name,
      )?.obj;
    if (inputSpec === undefined || !isPColumnSpec(inputSpec)) return undefined;
    const sampleAxisSpec = inputSpec.axesSpec[0];

    // @todo implement get by spec
    const sampleLabelsObj = ctx.resultPool.getData().entries.find((f) => {
      const spec = f.obj.spec;
      if (!isPColumnSpec(spec)) return false;
      if (spec.name !== 'pl7.app/label' || spec.axesSpec.length !== 1) return false;
      const axisSpec = spec.axesSpec[0];
      if (axisSpec.name !== sampleAxisSpec.name) return false;
      if (sampleAxisSpec.domain === undefined || Object.keys(sampleAxisSpec.domain).length === 0)
        return true;
      if (axisSpec.domain === undefined) return false;
      for (const [domainName, domainValue] of Object.entries(sampleAxisSpec.domain))
        if (axisSpec.domain[domainName] !== domainValue) return false;
      return true;
    });

    if (sampleLabelsObj === undefined) return undefined;

    // if (sampleLabelsObj.obj.data.resourceType.name !== 'PColumn/Json') return undefined;

    return Object.fromEntries(
      Object.entries(
        sampleLabelsObj.obj.data.getDataAsJson<{ data: Record<string, string> }>().data,
      // @TODO zod
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ).map((e) => [JSON.parse(e[0])[0], e[1]]),
    ) as Record<string, string>;
  })

  // @TODO migrate to lambdas and merge with prerunFileImports
  .output(
    'mainFileImports',
    mapResourceFields(getResourceField(MainOutputs, 'fileImports'), getImportProgress(It)),
  )

  // @TODO migrate to lambdas and merge with mainFileImports
  .output(
    'prerunFileImports',
    mapResourceFields(getResourceField(StagingOutputs, 'fileImports'), getImportProgress(It)),
  )
  .output(
    'libraryUploadProgress', (ctx) => ctx.outputs?.resolve({ field: 'libraryImportHandle', allowPermanentAbsence: true })?.getImportProgress(), { isActive: true })

  .sections((_ctx) => {
    return [{ type: 'link', href: '/', label: 'Main' }];
  })

  .argsValid((ctx) => BlockArgsValid.safeParse(ctx.args).success)

  .title((ctx) => (ctx.args.title ? `MiXCR Clonotyping - ${ctx.args.title}` : 'MiXCR Clonotyping'))

  .done(2);

export type BlockOutputs = InferOutputsType<typeof platforma>;
export type Href = InferHrefType<typeof platforma>;
export * from './args';
export * from './helpers';
export * from './preset';
export * from './progress';
export * from './qc';
export * from './reports';
export { BlockArgs };
