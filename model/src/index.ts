import type { InferHrefType, PlDataTableStateV2 } from "@platforma-sdk/model";
import {
  BlockModelV3,
  Column,
  ColumnsCollection,
  TreeNodeAccessor,
  DataModelBuilder,
  createPlDataTableStateV2,
  createPlDataTableV3,
  isDataColumn,
  isImportFileHandleIndex,
  isPColumnSpec,
  parseResourceMap,
  type ColumnData,
  type ImportFileHandle,
  type ImportFileHandleIndex,
  type InferOutputsType,
} from "@platforma-sdk/model";
import type { BlockParams as KindBlockParams } from "@platforma-open/milaboratories.mixcr-clonotyping-2.kind";
import { kind } from "@platforma-open/milaboratories.mixcr-clonotyping-2.kind";
import type { BlockArgs } from "./args";
import { BlockArgsValid } from "./args";
import { ProgressPrefix } from "./progress";

export type BlockData = BlockArgs & {
  tableState: PlDataTableStateV2;
  runMode: "dry" | "full";
};

type LegacyUiState = {
  tableState: PlDataTableStateV2;
};

const dataModel = new DataModelBuilder({ kind })
  .from<BlockData>("v1")
  .upgradeLegacy<BlockArgs, LegacyUiState>(({ args, uiState }) => ({
    ...args,
    tableState: uiState.tableState,
    runMode: (args.limitInput ?? 0) > 0 ? "dry" : "full",
  }))
  // `params` is absent when a block is created by hand rather than from a
  // template, so every field the contract carries keeps its own default.
  .init(({ params }) => ({
    ...params,
    defaultBlockLabel: params?.defaultBlockLabel ?? "",
    customBlockLabel: params?.customBlockLabel ?? "",
    chains: params?.chains ?? ["IG", "TCRAB", "TCRGD"],
    cloneClusteringMode: params?.cloneClusteringMode ?? "default",
    tableState: createPlDataTableStateV2(),
    runMode: params?.runMode ?? "full",
  }));

export const platforma = BlockModelV3.create({ dataModel, kind })

  // Inverse of `init` — the same fields, projected back out for template export.
  // `tableState` is view state and never crosses the boundary. File-valued
  // fields are dropped unless they are `index://` handles: an `upload://` handle
  // names an import local to this machine and would resolve nowhere else.
  .templateParams((data) => ({
    input: data.input,
    inputLibrary: data.inputLibrary,
    libraryFile: portableHandle(data.libraryFile),
    isLibraryFileGzipped: data.isLibraryFileGzipped,

    preset: portablePreset(data.preset),
    presetCommonName: data.presetCommonName,
    isGenericPreset: data.isGenericPreset,
    species: data.species,
    customSpecies: data.customSpecies,
    materialType: data.materialType,
    leftAlignmentMode: data.leftAlignmentMode,
    rightAlignmentMode: data.rightAlignmentMode,
    tagPattern: data.tagPattern,
    assembleClonesBy: data.assembleClonesBy,
    imputeGermline: data.imputeGermline,
    chains: data.chains,
    scHeavyOnly: data.scHeavyOnly,
    cloneClusteringMode: data.cloneClusteringMode,
    exportMinQuality: data.exportMinQuality,
    stopCodonTypes: data.stopCodonTypes,
    stopCodonReplacements: data.stopCodonReplacements,

    runMode: data.runMode,
    limitInput: data.limitInput,
    perProcessMemGB: data.perProcessMemGB,
    perProcessCPUs: data.perProcessCPUs,

    defaultBlockLabel: data.defaultBlockLabel,
    customBlockLabel: data.customBlockLabel,
    title: data.title,
  }))

  .prerunArgs((data) => ({
    preset: data.preset,
    species: data.species,
    leftAlignmentMode: data.leftAlignmentMode,
    rightAlignmentMode: data.rightAlignmentMode,
    materialType: data.materialType,
    isGenericPreset: data.isGenericPreset,
  }))

  .args((data) => {
    if (!data.input) throw new Error("Input dataset is required");
    if (!data.preset) throw new Error("Preset is required");
    if (!data.chains || data.chains.length === 0) throw new Error("Chains selection is required");
    if (data.scHeavyOnly && !(data.chains.length === 1 && data.chains[0] === "IG"))
      throw new Error("Heavy-chain only (VHH) mode requires selecting only the IG receptor");
    if (data.runMode === "dry" && data.limitInput == null)
      throw new Error("Read limit is required for Preview mode");
    if (!BlockArgsValid.safeParse(data).success) return undefined;
    return {
      defaultBlockLabel: data.defaultBlockLabel ?? "",
      customBlockLabel: data.customBlockLabel ?? "",
      input: data.input,
      preset: data.preset,
      chains: data.chains,
      scHeavyOnly: data.scHeavyOnly,
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
      imputeGermline: data.assembleClonesBy !== undefined ? data.imputeGermline : undefined,
      limitInput: data.runMode === "dry" ? data.limitInput : undefined,
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

  .retentiveOutput("presets", (ctx) =>
    ctx.prerun
      ?.resolve({ field: "presets", assertFieldType: "Input", allowPermanentAbsence: true })
      ?.getFileHandle(),
  )

  .retentiveOutput("preset", (ctx) =>
    ctx.prerun
      ?.resolve({ field: "preset", assertFieldType: "Input", allowPermanentAbsence: true })
      ?.getDataAsJson<string>(),
  )

  .retentiveOutput("libraryOptions", (ctx) =>
    ctx.resultPool.getOptions((spec) => spec.annotations?.["pl7.app/vdj/isLibrary"] === "true", {
      includeNativeLabel: true,
      addLabelAsSuffix: true,
    }),
  )

  .output("datasetSpec", (ctx) => {
    if (ctx.data.inputLibrary) return Column(ctx.data.inputLibrary)?.getSpec();
    else return undefined;
  })

  .output("qc", (ctx) => {
    const acc = ctx.outputs?.resolve("qc");
    if (!acc || !acc.getInputsLocked()) return undefined;
    return parseResourceMap(acc, (acc) => acc.getFileHandle(), true);
  })

  .output("reports", (ctx) =>
    parseResourceMap(ctx.outputs?.resolve("reports"), (acc) => acc.getFileHandle(), false),
  )

  .output("logs", (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve("logs"), (acc) => acc.getLogHandle(), false)
      : undefined;
  })

  .output("progress", (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(
          ctx.outputs?.resolve("logs"),
          (acc) => acc.getProgressLog(ProgressPrefix),
          false,
        )
      : undefined;
  })

  .output("started", (ctx) => ctx.outputs !== undefined)

  .output("done", (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve("clns"), (_acc) => true, false).data.map(
          (e) => e.key[0] as string,
        )
      : undefined;
  })

  .outputWithStatus("clones", (ctx) => {
    const clonotypes = ctx.outputs?.resolve("clonotypes");
    if (clonotypes === undefined) return undefined;
    // Ids go straight to the host — no spec or data is pulled into the sandbox.
    return ctx.createPFrame(ColumnsCollection([clonotypes]).getColumnIds());
  })

  .retentiveOutput("inputOptions", (ctx) => {
    return ctx.resultPool.getOptions((v) => {
      if (!isPColumnSpec(v)) return false;
      const domain = v.domain;
      return (
        v.name === "pl7.app/sequencing/data" &&
        (v.valueType as string) === "File" &&
        domain !== undefined &&
        (domain["pl7.app/fileExtension"] === "fasta" ||
          domain["pl7.app/fileExtension"] === "fasta.gz" ||
          domain["pl7.app/fileExtension"] === "fastq" ||
          domain["pl7.app/fileExtension"] === "fastq.gz") &&
        v.axesSpec.some((a) => a.name === "pl7.app/sampleId")
      );
    });
  })

  .retentiveOutput("hasMultiplexedFastq", (ctx) => {
    return (
      ctx.resultPool.getOptions((v) => {
        if (!isPColumnSpec(v)) return false;
        const domain = v.domain;
        return (
          v.name === "pl7.app/sequencing/data" &&
          (v.valueType as string) === "File" &&
          domain !== undefined &&
          (domain["pl7.app/fileExtension"] === "fasta" ||
            domain["pl7.app/fileExtension"] === "fasta.gz" ||
            domain["pl7.app/fileExtension"] === "fastq" ||
            domain["pl7.app/fileExtension"] === "fastq.gz") &&
          v.axesSpec.some((a) => a.name === "pl7.app/sampleGroupId")
        );
      }).length > 0
    );
  })

  .output("sampleLabels", (ctx): Record<string, string> | undefined => {
    const inputRef = ctx.data.input;
    if (inputRef === undefined) return undefined;
    const inputSpec = Column(inputRef)?.getSpec();
    if (inputSpec === undefined || !isPColumnSpec(inputSpec)) return undefined;
    const sampleAxisSpec = inputSpec.axesSpec[0];

    // @todo implement get by spec
    const sampleLabelsObj = ctx.resultPool.getData().entries.find((f) => {
      const spec = f.obj.spec;
      if (!isPColumnSpec(spec)) return false;
      if (spec.name !== "pl7.app/label" || spec.axesSpec.length !== 1) return false;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ).map((e) => [JSON.parse(e[0])[0], e[1]]),
    ) as Record<string, string>;
  })

  .outputWithStatus("pt", (ctx) => {
    const qcReportTable = ctx.outputs?.resolve({
      field: "qcReportTable",
      assertFieldType: "Input",
      allowPermanentAbsence: true,
    });
    if (qcReportTable === undefined) return undefined;
    const collection = ColumnsCollection([qcReportTable]);
    if (collection.isEmpty()) return undefined;
    const cols = collection.getColumns();
    if (cols.length === 0) return undefined;
    // Single primary column avoids V3's per-primary label-discovery collision on same-axis columns.
    return createPlDataTableV3(ctx, {
      primaryColumns: [cols[0]],
      columns: cols.slice(1),
      tableState: ctx.data.tableState,
    });
  })

  .output("rawTsvs", (ctx) => {
    const clonotypeTables = ctx.outputs?.resolve("clonotypeTables");
    if (clonotypeTables === undefined) return undefined;
    return ColumnsCollection([clonotypeTables])
      .getColumns()
      .filter(isDataColumn)
      .map((col) => ({
        id: (JSON.parse(col.id) as { name: string }).name,
        data: parseResourceMap(
          asAccessor(col.getData()),
          (acc) => acc.getRemoteFileHandle(),
          false,
        ),
      }))
      .filter((col) => col.data.isComplete)
      .map((col) => ({ ...col, data: col.data.data }));
  })

  .output(
    "fileImports",
    (ctx) => {
      const main = Object.fromEntries(
        ctx.outputs
          ?.resolve({ field: "fileImports", assertFieldType: "Input", allowPermanentAbsence: true })
          ?.mapFields((handle, acc) => [handle as ImportFileHandle, acc.getImportProgress()], {
            skipUnresolved: true,
          }) ?? [],
      );
      const prerun = Object.fromEntries(
        ctx.prerun
          ?.resolve({ field: "fileImports", assertFieldType: "Input", allowPermanentAbsence: true })
          ?.mapFields((handle, acc) => [handle as ImportFileHandle, acc.getImportProgress()], {
            skipUnresolved: true,
          }) ?? [],
      );
      return { ...prerun, ...main };
    },
    { isActive: true },
  )
  .output(
    "libraryUploadProgress",
    (ctx) =>
      ctx.outputs
        ?.resolve({ field: "libraryImportHandle", allowPermanentAbsence: true })
        ?.getImportProgress(),
    { isActive: true },
  )

  .sections((_ctx) => {
    return [
      { type: "link", href: "/", label: "Main" },
      { type: "link", href: "/qc-report-table", label: "QC Report Table" },
    ];
  })

  .title(() => "MiXCR Clonotyping")

  .subtitle((ctx) => ctx.data.customBlockLabel || ctx.data.defaultBlockLabel || "")

  .done();

export type BlockOutputs = InferOutputsType<typeof platforma>;
export type Href = InferHrefType<typeof platforma>;
export * from "./args";
export * from "./helpers";
export * from "./preset";
export * from "./progress";
export * from "./qc";
export * from "./reports";
export { BlockArgs };

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** `parseResourceMap` needs the accessor arm of the column-data union. */
function asAccessor(data: ColumnData): TreeNodeAccessor | undefined {
  return data instanceof TreeNodeAccessor ? data : undefined;
}

/** Keeps a file handle only if it survives leaving this machine. */
function portableHandle(handle: ImportFileHandle | undefined): ImportFileHandleIndex | undefined {
  return handle !== undefined && isImportFileHandleIndex(handle) ? handle : undefined;
}

function portablePreset(preset: BlockData["preset"]): KindBlockParams["preset"] {
  if (preset === undefined) return undefined;
  if (preset.type === "name") return preset;
  const file = portableHandle(preset.file);
  return file === undefined ? undefined : { type: "file", file };
}
