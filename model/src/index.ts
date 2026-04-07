import type {
  InferHrefType,
  PlDataTableStateV2,
} from '@platforma-sdk/model';
import {
  BlockModelV3,
  DataModelBuilder,
  createPlDataTableV2,
  createPlDataTableStateV2,
  isPColumn,
  isPColumnSpec,
  parseResourceMap,
  type ImportFileHandle,
  type InferOutputsType,
} from '@platforma-sdk/model';
import type { BlockArgs } from './args';
import { BlockArgsValid } from './args';
import { ProgressPrefix } from './progress';

export type BlockData = BlockArgs & {
  tableState: PlDataTableStateV2;
  runMode: 'dry' | 'full';
};

type LegacyUiState = {
  tableState: PlDataTableStateV2;
};

const dataModel = new DataModelBuilder()
  .from<BlockData>('v1')
  .upgradeLegacy<BlockArgs, LegacyUiState>(({ args, uiState }) => ({
    ...args,
    tableState: uiState.tableState,
    runMode: (args.limitInput ?? 0) > 0 ? 'dry' : 'full',
  }))
  .init(() => ({
    defaultBlockLabel: '',
    customBlockLabel: '',
    chains: ['IG', 'TCRAB', 'TCRGD'],
    cloneClusteringMode: 'default',
    tableState: createPlDataTableStateV2(),
    runMode: 'full',
  }));

export const platforma = BlockModelV3.create(dataModel)

  .prerunArgs((data) => ({
    preset: data.preset,
    species: data.species,
    leftAlignmentMode: data.leftAlignmentMode,
    rightAlignmentMode: data.rightAlignmentMode,
    materialType: data.materialType,
    isGenericPreset: data.isGenericPreset,
  }))

  .args((data) => {
    if (!BlockArgsValid.safeParse(data).success) return undefined;
    if (data.runMode === 'dry' && data.limitInput == null) return undefined;
    return {
      defaultBlockLabel: data.defaultBlockLabel ?? '',
      customBlockLabel: data.customBlockLabel ?? '',
      input: data.input,
      preset: data.preset,
      chains: data.chains,
      inputLibrary: data.inputLibrary,
      libraryFile: data.libraryFile,
      isLibraryFileGzipped: data.isLibraryFileGzipped,
      species: data.species,
      customSpecies: data.customSpecies,
      materialType: data.materialType,
      leftAlignmentMode: data.leftAlignmentMode,
      rightAlignmentMode: data.rightAlignmentMode,
      tagPattern: data.tagPattern,
      assembleClonesBy: data.assembleClonesBy,
      limitInput: data.runMode === 'dry' ? data.limitInput : undefined,
      perProcessMemGB: data.perProcessMemGB,
      perProcessCPUs: data.perProcessCPUs,
      cloneClusteringMode: data.cloneClusteringMode,
      presetCommonName: data.presetCommonName,
      isGenericPreset: data.isGenericPreset,
      exportMinQuality: data.exportMinQuality,
      stopCodonTypes: data.stopCodonTypes,
      stopCodonReplacements: data.stopCodonReplacements,
    };
  })

  .retentiveOutput('presets', (ctx) =>
    ctx.prerun?.resolve({ field: 'presets', assertFieldType: 'Input', allowPermanentAbsence: true })?.getFileHandle(),
  )

  .retentiveOutput('preset', (ctx) =>
    ctx.prerun
      ?.resolve({ field: 'preset', assertFieldType: 'Input', allowPermanentAbsence: true })
      ?.getDataAsJson<string>(),
  )

  .retentiveOutput('libraryOptions', (ctx) =>
    ctx.resultPool.getOptions((spec) => spec.annotations?.['pl7.app/vdj/isLibrary'] === 'true',
      { includeNativeLabel: true, addLabelAsSuffix: true }),
  )

  .output('datasetSpec', (ctx) => {
    if (ctx.data.inputLibrary) return ctx.resultPool.getSpecByRef(ctx.data.inputLibrary);
    else return undefined;
  })

  .output('qc', (ctx) => {
    const acc = ctx.outputs?.resolve('qc');
    if (!acc || !acc.getInputsLocked()) return undefined;
    return parseResourceMap(acc, (acc) => acc.getFileHandle(), true);
  })

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

  .retentiveOutput('done', (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve('clns'), (_acc) => true, false).data.map(
          (e) => e.key[0] as string,
        )
      : undefined;
  })

  .outputWithStatus('clones', (ctx) => {
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
  })

  .output('sampleLabels', (ctx): Record<string, string> | undefined => {
    const inputRef = ctx.data.input;
    if (inputRef === undefined) return undefined;
    const inputSpec = ctx.resultPool.getSpecByRef(inputRef);
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

  .outputWithStatus('pt', (ctx) => {
    const pCols = ctx.outputs?.resolve({ field: 'qcReportTable', assertFieldType: 'Input', allowPermanentAbsence: true })?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }
    return createPlDataTableV2(
      ctx,
      pCols,
      ctx.data.tableState,
    );
  })

  .output('rawTsvs', (ctx) => {
    if (ctx.outputs === undefined)
      return undefined;
    const pCols = ctx.outputs?.resolve('clonotypeTables')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }
    return pCols.map((pCol) => {
      return {
        ...pCol,
        id: (JSON.parse(pCol.id) as { name: string }).name,
        data: parseResourceMap(pCol.data, (acc) => acc.getRemoteFileHandle(), false),
      };
    }).filter((pCol) => pCol.data.isComplete).map((pCol) => {
      return {
        ...pCol,
        data: pCol.data.data,
      };
    });
  })

  .output(
    'mainFileImports',
    (ctx) =>
      Object.fromEntries(
        ctx.outputs
          ?.resolve({ field: 'fileImports', assertFieldType: 'Input', allowPermanentAbsence: true })
          ?.mapFields((handle, acc) => [handle as ImportFileHandle, acc.getImportProgress()], {
            skipUnresolved: true,
          }) ?? [],
      ),
    { isActive: true },
  )

  .output(
    'prerunFileImports',
    (ctx) =>
      Object.fromEntries(
        ctx.prerun
          ?.resolve({ field: 'fileImports', assertFieldType: 'Input', allowPermanentAbsence: true })
          ?.mapFields((handle, acc) => [handle as ImportFileHandle, acc.getImportProgress()], {
            skipUnresolved: true,
          }) ?? [],
      ),
    { isActive: true },
  )
  .output(
    'libraryUploadProgress', (ctx) => ctx.outputs?.resolve({ field: 'libraryImportHandle', allowPermanentAbsence: true })?.getImportProgress(), { isActive: true })

  .sections((_ctx) => {
    return [
      { type: 'link', href: '/', label: 'Main' },
      { type: 'link', href: '/qc-report-table', label: 'QC Report Table' },
    ];
  })

  .title(() => 'MiXCR Clonotyping')

  .subtitle((ctx) => ctx.data.customBlockLabel || ctx.data.defaultBlockLabel || '')

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
export type Href = InferHrefType<typeof platforma>;
export * from './args';
export * from './helpers';
export * from './preset';
export * from './progress';
export * from './qc';
export * from './reports';
export { BlockArgs };
