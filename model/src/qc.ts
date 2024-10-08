import { z } from 'zod';

export const QcStatus = z.union([z.literal('OK'), z.literal('WARN'), z.literal('ALERT')]);

export const QcCheck = z.object({
  type: z.string(), // @TODO union?
  upper: z.number().optional(),
  middle: z.number().optional(),
  label: z.string()
});
export type QcCheck = z.infer<typeof QcCheck>;

export const QcCheckResult = z.object({
  step: z.string(),
  status: QcStatus,
  check: QcCheck,
  payload: z.object({
    printedValue: z.coerce.string().optional(),
    value: z.coerce.string().optional(),
    labelOverride: z.coerce.string().optional()
  })
});
export type QcCheckResult = z.infer<typeof QcCheckResult>;

export const Qc = z.array(QcCheckResult);
export type Qc = z.infer<typeof Qc>;

// @TODO, (I found this in the old desktop)
export const QcCheckDescriptions = {
  SuccessfullyAlignedReads:
    'Sequencing reads that have been accurately mapped to their respective V, D, and J gene segments during the alignment process. This metric is crucial for assessing data quality. Low rate of aligned reads is a strong signal of either wet lab problems or misused analysis settings.',
  OffTargetReads:
    'Sequencing reads that do not map on T or B cell receptor gene segments. High rate of off-target reads may be a result of:\n' +
    '\n' +
    'primers mis-annealing to a non-target loci;\n' +
    'DNA contamination in RNA material;\n' +
    'other protocol and/or wet lab issues;\n' +
    'wrong choice of species in analysis settings (e.g. you have a cat library while used a human reference library).\n' +
    '\n' +
    'In order to troubleshoot, one can rerun alignment and save not aligned reads into separate files. Then pick a few random non-aligned sequences and BLAST them to identify whether they are coming from contamination / non-target loci or aligned to different species. If there are no BLAST hits, check whether the sequences are artificial (e.g. adapters).\n',
  ReadsWithNoVOrJHits: `Sequencing reads that cover either V or J region but not both of them simultaneously. There might be several reasons for that. One common reason is incorrect orientation of reads, typically caused by some pre-processing of the input data performed before MiXCR. A common example is pre-processing with external tools like MiGEC, which is a legacy tool for handling UMIs and demultiplexing. MiGEC reverse complements one of the reads, thus requiring running MiXCR with -OreadsLayout=Collinear option.

Another reason is a very low sequencing quality in one of the reads when sequencing has completely failed.

Finally, it might be a wrong use of the analysis preset: if the input data is randomly fragmented (RNA-, Exome-Seq, 10x etc.) and the used preset is designed for amplicon libraries, you would see a high percentage here (since with amplicon settings MiXCR drops all reads that do not full cover CDR3 region). So check and use an appropriate preset for fragmented data.
`,
  ReadsWithNoBarcode:
    "For barcoded data means that barcodes can't be extracted using the specified tag pattern. For custom library preparation protocols, the first thing to check is that a correct tag pattern and/or a correct analysis preset are used. If the library is unstranded, one should use either --tag-parse-unstranded option or change the preset accordingly. Finally, the quality of data may be low, so that tags can't be parsed because of too many sequencing errors.",
  OverlappedReadsMoreBetter: `Paired-end sequencing reads that overlap, meaning that the ends of the forward and reverse reads extend into the same region of the DNA fragment they were sequenced from.

For the full-length amplicon protocols sequenced with 250+250 or 300+300, one expects a high rate of overlapped reads to cover the complete VDJ rearrangement. Low overlap rate in such case may signal about various problems in the wet lab e.g. poor sequencing quality or size selection.

Contrary, for relatively short reads (e.g. 150+150 and shorter) prepared with 5’RACE technology, one expects a very low rate of overlapped reads. The high rate will be a clear signal of failed size selection during the library prep.
`,
  OverlappedReadsLessBetter: `Paired-end sequencing reads that overlap, meaning that the ends of the forward and reverse reads extend into the same region of the DNA fragment they were sequenced from.

For the full-length amplicon protocols sequenced with 250+250 or 300+300, one expects a high rate of overlapped reads to cover the complete VDJ rearrangement. Low overlap rate in such case may signal about various problems in the wet lab e.g. poor sequencing quality or size selection.

Contrary, for relatively short reads (e.g. 150+150 and shorter) prepared with 5’RACE technology, one expects a very low rate of overlapped reads. The high rate will be a clear signal of failed size selection during the library prep.
`,
  ReadsDroppedInTagRefinement:
    'Sequencing reads that were dropped during the barcode error correction and filtering. High rate of dropped reads may signal either about poor quality of the library, significant under sequencing, mistakes at library pooling and various other reasons. A deeper look at other QC metrics and MiXCR reports may help to reveal the exact reason.',
  TagArtificialDiversityEliminated:
    'Number of barcodes that were corrected or dropped during the barcode sequencing and PCR error correction. Barcodes with low sequence quality nucleotides that can’t be corrected (i.e. no barcodes with good quality within the allowed number of mutations) are dropped. It is normal to have up to 50% of barcodes corrected, however unexpectedly high numbers here is a signal about poor sequencing quality.',
  ReadsDroppedInTagCorrection:
    'Sequencing reads that were dropped along with dropped bad quality barcodes during the UMI sequencing and PCR error correction. The high rate of dropped reads here signals about poor sequencing quality and related issues.',
  ReadsDroppedInTagFiltering:
    'Sequencing reads that were dropped in barcode filtering. High rate of dropped reads may signal either about poor quality of the library, significant under sequencing, mistakes at library pooling and various other reasons.',
  TagGroupsWithNoAssemblingFeature:
    'Number of tag groups which do not contain any reads that cover clonotype assembling feature. For amplicon protocols one should expect around zero tag groups with no assembling feature. A high rate here signals about either failed wet lab library preparation or misuse of the analysis settings. A typical scenario of wrong settings is when one specifies full-length VDJRegion as an assembling feature, while either the protocol is not designed for this purpose (i.e. multiplex protocol with primers in frameworks) or short sequencing was used (e.g. 150+150).',
  TagGroupsWithMultipleConsensuses:
    'Number of barcodes that resulted in multiple consensus sequences. Typically, one expects that one tag group (e.g. one UMI) results in exactly a single consensus sequence, so that the sequences with the same UMI are highly similar (within several mismatches or indels coming from PCR and sequencing errors). A tiny fraction of barcodes may result in more than one consensus due to the birth paradox. High collision rate signals about poor barcode diversity related to e.g. too short barcode sequence, protocol design problems or some wet lab issues.',
  UnassignedAlignments:
    'Number of alignments that we dropped in clonotype assembly because of the high barcode collision rate. Typically, one expects that the sequences with the same tag group (e.g. UMI) are coming from the same molecule and are highly similar (within several mismatches or indels coming from PCR and sequencing errors). When a single tag group has too many reads with completely different CDR3 sequences, MiXCR will drop them as unreliable. A high rate of unassigned alignments may signal about suboptimal design of the library architecture and preparation protocol. Manual inspection of raw reads will help to debug the exact problem.',
  ReadsUsedInClonotypes:
    'Percent of the raw sequencing reads used in the resulting clonotypes. For high quality of data prepared with targeted VDJ protocols (either amplicon or fragmented), one expects that a significant percentage of raw sequencing reads are finally used to build clonotypes. Low percent of used clonotypes may signal about various problems, and other QC metrics may help to understand the reason.',
  AlignmentsWithNoAssemblingFeature:
    'Number of aligned reads that do not cover clonotype assembling feature. Each amplicon protocol is designed to cover a specific part of the VDJ region, depending on the position of primers. High rate of alignments which do not cover assembling feature specified signals about wrong setting for the assembling feature. The most common reason is that one is trying to extract full-length clonal sequences of the receptors (VDJRegion), but the library is prepared in such a way that it does not cover the full length of the receptor or a    short sequencing was used (to cover the full length one at least need 250+250 bp technology).',
  AlignmentsDroppedLowQuality:
    'Number of aligned sequencing reads that contain low sequencing quality nucleotides inside clonotype assembling feature (e.g. CDR3) and that MiXCR was unable to rescue by assigning to high quality clonotypes in error correction. High rate of such alignments is a clear signal of poor sequencing quality (check sequencing quality reports).',
  AlignmentsClusteredInAssembler:
    'Number of aligned reads used in the clonotypes that were clustered in PCR error correction. Since the background PCR error rate is more or less same for all amplicon protocols, a high rate here would be a signal of misused analysis setting in most cases (for example use of an inappropriate reference library).',
  ClonesClusteredInAssembler:
    'Number of clonotypes that were clustered in PCR error correction. Since the background PCR error rate is more or less same for all amplicon protocols, a high rate here would be a signal of misused analysis setting in most cases (for example use of a inappropriate reference library).',
  ClonesDroppedInPostFiltering: 'Number of clonotypes that were dropped in the post filtering.',
  AlignmentsDroppedInPostFiltering: 'Number of aligned reads that were dropped along with clonotypes in the post filtering.',
} as Record<string, string>;
