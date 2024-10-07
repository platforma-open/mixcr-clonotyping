import { test } from 'vitest';
import { AlignReport, AssembleReport } from './reports';

test('test parse simple align report', () => {
  AlignReport.parse({
    type: 'alignerReport',
    commandLine:
      'align -f --report result.align.report.txt --json-report result.align.report.json --preset milab-human-dna-xcr-7genes-multiplex --save-output-file-names result.align.list.tsv ../small_data_R1.fastq.gz ../small_data_R2.fastq.gz result.alignments.vdjca',
    inputFiles: ['../small_data_R1.fastq.gz', '../small_data_R2.fastq.gz'],
    outputFiles: ['result.alignments.vdjca'],
    version: '; built=Thu Jan 01 02:00:00 IST 1970; rev=3956c95420; lib=repseqio.v5.1',
    totalReadsProcessed: 10,
    aligned: 9,
    notAligned: 1,
    notAlignedReasons: {
      NoHits: 0,
      FailedAfterAOverlap: 0,
      NoCDR3Parts: 0,
      NoVHits: 1,
      NoJHits: 0,
      VAndJOnDifferentTargets: 0,
      LowTotalScore: 0,
      NoBarcode: 0,
      SampleNotMatched: 0
    },
    overlapped: 1,
    overlappedAligned: 1,
    overlappedNotAligned: 0,
    alignmentAidedOverlaps: 0,
    noCDR3PartsAlignments: 0,
    partialAlignments: 0,
    chimeras: 0,
    vChimeras: 1,
    jChimeras: 0,
    pairedEndAlignmentConflicts: 0,
    realignedWithForcedNonFloatingBound: 9,
    realignedWithForcedNonFloatingRightBoundInLeftRead: 0,
    realignedWithForcedNonFloatingLeftBoundInRightRead: 0,
    chainUsage: {
      type: 'chainUsage',
      chimeras: 0,
      total: 9,
      chains: { TRA: { total: 9, nonFunctional: 0, isOOF: 0, hasStops: 0 } }
    },
    trimmingReport: {},
    tagParsingReport: null,
    notMatchedByHeader: 0,
    transformerReports: [],
    coverage: {
      VDJRegion: 0,
      CDR1_TO_FR4: 0,
      FR2_TO_FR4: 0,
      CDR2_TO_FR4: 0,
      FR3_TO_FR4: 0,
      CDR3: 9
    }
  });
});

test('test parse simple assemble report', () => {
  AssembleReport.parse({
    type: 'assemblerReport',
    commandLine:
      'assemble -f --report result.assemble.report.txt --json-report result.assemble.report.json result.alignments.vdjca result.clns',
    inputFiles: ['result.alignments.vdjca'],
    outputFiles: ['result.clns'],
    version: '; built=Thu Jan 01 02:00:00 IST 1970; rev=3956c95420; lib=repseqio.v5.1',
    preCloneAssemblerReport: null,
    totalReadsProcessed: 10,
    totalAlignmentsProcessed: 9,
    totalAlignedReadsProcessed: 9,
    initialClonesCreated: 4,
    readsDroppedNoTargetSequence: 0,
    readsDroppedTooShortClonalSequence: 0,
    readsDroppedLowQuality: 0,
    coreReads: 4,
    readsDroppedFailedMapping: 5,
    lowQualityRescued: 0,
    clonesClustered: 0,
    readsClustered: 0,
    clones: 4,
    clonesDroppedAsLowQuality: 0,
    clonesPreClustered: 0,
    readsPreClustered: 0,
    readsInClones: 4,
    readsInClonesBeforeClustering: 4,
    readsDroppedWithLowQualityClones: 0,
    clonalChainUsage: {
      type: 'chainUsage',
      chimeras: 0,
      total: 4,
      chains: { TRA: { total: 4, nonFunctional: 0, isOOF: 0, hasStops: 0 } }
    },
    clonesFilteredInFineFiltering: 0,
    readsFilteredInFineFiltering: 0.0,
    clonesFilteredInPostFiltering: 0,
    readsFilteredInPostFiltering: 0.0,
    postFilteringReports: null,
    readsFilteredByTagPrefix: 0
  });
});