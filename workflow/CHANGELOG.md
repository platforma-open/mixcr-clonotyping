# @platforma-open/milaboratories.mixcr-clonotyping.workflow

## 3.23.1

### Patch Changes

- 6f30f09: Upgrade MiXCR to 4.7.0-300-develop, add MI_LICENSE_DEBUG env, fix assembleCells column error in SC QC report, show loading spinner while sample list loads

## 3.23.0

### Minor Changes

- 3c8ed71: stop codon replacement and dep updates

## 3.22.0

### Minor Changes

- 22562b1: qc table multiple UMI support

## 3.21.0

### Minor Changes

- 075b011: custom library bug fix

## 3.20.0

### Minor Changes

- 984f9d8: Support custom block title and running status

## 3.19.0

### Minor Changes

- 4f376a4: Columns with number of clonotypes dropped due stop codon or oof added to qc table. Dependencies updates

## 3.18.0

### Minor Changes

- 070fc0b: Min quality checkbox, refactored error correction, dep updates

## 3.17.1

### Patch Changes

- 5d90233: Hide non-relevant columns

## 3.17.0

### Minor Changes

- 480dfc5: generic presets added

## 3.16.0

### Minor Changes

- d6683f6: assemblingFeature fix

### Patch Changes

- 40d9788: Update dependencies including MiXCR

## 3.15.1

### Patch Changes

- 4809b76: technical release

## 3.15.0

### Minor Changes

- 224eef5: clonotypeKey now includes cHit instead of cGene in splitByC case

## 3.14.0

### Minor Changes

- 4fcd94b: relaxed mixcr assemble parameters for high diversity datasets

## 3.13.0

### Minor Changes

- 27f25bc: isProductive values changed to true or false

## 3.12.1

### Patch Changes

- a5e2509: sdk update

## 3.12.0

### Minor Changes

- fa19090: clonotypeLabel in export raw data

## 3.11.0

### Minor Changes

- 58a43db: Better memory management in export

## 3.10.1

### Patch Changes

- fed5c72: Support parquet format (update SDK)

## 3.10.0

### Minor Changes

- d2b6d24: fix number of reads, clonotypes, cells in report table

## 3.9.0

### Minor Changes

- 913c474: MILAB-2682: MI_USE_SYSTEM_CA forces MiXCR to trust system installed certificates

## 3.8.2

### Patch Changes

- 4b0cf15: Technical release: 0 CVEs

## 3.8.1

### Patch Changes

- 6991800: No UI queue usage

## 3.8.0

### Minor Changes

- 48c8ea4: core features fixes

## 3.7.2

### Patch Changes

- 4c42a7a: Fix [blocks/mixcr-clonotyping] in the end of calculations results table starts to blink

## 3.7.1

### Patch Changes

- c337aa2: Fix [sdk/ui] Broken error propagation: block errors are not showing anymore

## 3.7.0

### Minor Changes

- dde56a2: Raw results export

## 3.6.1

### Patch Changes

- 0f20633: migrate to ts-builder

## 3.6.0

### Minor Changes

- 9965185: add library files to qc report command

## 3.5.2

### Patch Changes

- 98a1801: Use MiXCR version with fixed locale settings that have '.' in floats

## 3.5.1

### Patch Changes

- c87ddf9: Update workflow-tengo dependency: new python run environment with pip issue fix for windows

## 3.5.0

### Minor Changes

- 2154ea5: in export-report template infer_scema changed to false

### Patch Changes

- 093974b: updating dependencies

## 3.4.0

### Minor Changes

- fdd3f2f: fix tracing for single cell

## 3.3.0

### Minor Changes

- 8cee126: min quality columns added

## 3.2.1

### Patch Changes

- ebad6c6: Fixes export error on SC presets without UMI

## 3.2.0

### Minor Changes

- 73af94c: nLengthTotalAdded column NA regex fix

## 3.1.1

### Patch Changes

- 12d4102: Update sdk version

## 3.1.0

### Minor Changes

- 78e7e7b: New section with QC report table

## 3.0.4

### Patch Changes

- 97fc3cf: Update sdk to fix issue with broken python venv

## 3.0.3

### Patch Changes

- 37f37ee: Updated SDK

## 3.0.2

### Patch Changes

- 59ead64: Fix for multi-barcode single cell presets

## 3.0.1

### Patch Changes

- 8d013c1: Update sdk (use api v2)

## 3.0.0

### Major Changes

- 5cd5710: Updated MiXCR

## 2.26.0

### Minor Changes

- 4d7746d: Cell Linker Column & SDK Upgrade

## 2.25.0

### Minor Changes

- 427ffa6: Include junction lengths and total number of added nt

## 2.24.0

### Minor Changes

- 35856bb: Fix for caching and deduplication & SDK Upgrade

## 2.23.3

### Patch Changes

- 63a2a9d: Update sdk: fix slide panel closing when modal dialog window is clicked (MILAB-3495 [blocks/mixcr-clonotyping] can’t upload custom preset by choosing file)

## 2.23.2

### Patch Changes

- 81ac330: Bugfix TCR Gamma export

## 2.23.1

### Patch Changes

- 5fcc5ba: Updated top chains discrete values formatting in export specifications.

## 2.23.0

### Minor Changes

- e152a2f: SDK Upgrade: fix for compatibility issues with old platformas and final migration to request-based task scheduling

## 2.22.0

### Minor Changes

- a65fef4: Custom settings for memory and CPU count added

## 2.21.2

### Patch Changes

- af64907: Update SDK dependencies to get fresh fixes

## 2.21.1

### Patch Changes

- c983163: SDK upgrade

## 2.21.0

### Minor Changes

- c58e60e: SDK Upgrade

## 2.20.8

### Patch Changes

- 26b311c: - MiXCR upgrade
  - fix for file lock safeguard error
  - better memory management

## 2.20.7

### Patch Changes

- da51497: Fix for missing C gene and null clonotype key as a result

## 2.20.6

### Patch Changes

- 47f13d9: Fix for multiple clonotype label columns in SC analysis

## 2.20.5

### Patch Changes

- 1ca5594: Another memory requesting optimization

## 2.20.4

### Patch Changes

- 983f157: Workfolder will now be used for temp files in mixcr analysis

## 2.20.3

### Patch Changes

- c255e13: Better memory formula for memory allocation in mixcr

## 2.20.2

### Patch Changes

- 583db83: MiXCR Upgrade, fixed Gene Feature in Rapid 10x Preset

## 2.20.1

### Patch Changes

- 5b492d7: MiXCR Upgrade Rapid 10x preset

## 2.20.0

### Minor Changes

- CPU and Memory requests for all jobs

## 2.19.4

### Patch Changes

- da76979: MiXCR Software upgrade, export memory increase

## 2.19.3

### Patch Changes

- 865b5f5: Added cpu and ram requirements

## 2.19.2

### Patch Changes

- fc18b70: SDK Upgrade: fixes await logic and prevents unexpected freezes

## 2.19.1

### Patch Changes

- fdf3e57: SDK Upgrade to fixed redundant partitioning of exports

## 2.19.0

### Minor Changes

- 4f09d25: - All table transformations migrated from ptransform and custop python scripts to universal PT API
  - Enhance export specifications by adding format property for fraction and sequence columns

## 2.18.3

### Patch Changes

- 46c5291: increase pip install timeout

## 2.18.2

### Patch Changes

- dab4944: Update workflow-tengo SDK to bring fresh fixes for python execution on windows

## 2.18.1

### Patch Changes

- 7840b40: update dependencies

## 2.18.0

### Minor Changes

- 2a9ce2a: - added two aggregated columns: Mean Fraction Of UMIs/Reads, Supprting UMIs/Reads
  - support for RNA-Seq preset
  - fallback for in-frame features for amino-acid sequence columns (for FR4 and VDJRegion)
  - annotation strings for nucleotide and amino-acid sequences of assembling feature

## 2.17.0

### Minor Changes

- 50d0b31: isAssemblingFeature in domain

## 2.16.0

### Minor Changes

- 632c7c0: fixed bugs with assemblingFeature and updated ptransform to 1.4.0

## 2.15.1

### Patch Changes

- 1c2dc52: Add --force-overwrite option to avoid rare bug

## 2.15.0

### Minor Changes

- 20cd6f5: Exporting library if provided as file & attaching libraryId to clns output spec

## 2.14.2

### Patch Changes

- 7a78090: Drop logs in mixcr export to prevent CID conflicts in results deduplication

## 2.14.1

### Patch Changes

- 748457a: Upgrade mixcr version to prevent crash with custom library with custom C gene names

## 2.14.0

### Minor Changes

- dc86a17: single cell export and removing columns for secondary clones except CDR3 aa

## 2.13.0

### Minor Changes

- b1f6427: species added, visibility of chain columns set to optional, mixcr updated to 4.7.0-164-develop

## 2.12.0

### Minor Changes

- 90a29d2: Fix mixcr-analyze template hash

### Patch Changes

- 90a29d2: SDK upgrade
- Updated dependencies [18e0e70]
- Updated dependencies [90a29d2]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.hash-column@1.1.1
  - @platforma-open/milaboratories.mixcr-clonotyping-2.single-cell-scripts@1.1.3

## 2.11.0

### Minor Changes

- 0db1bdf: Migration to hash-based cloonotype keys

### Patch Changes

- Updated dependencies [0db1bdf]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.hash-column@1.1.0

## 2.10.1

### Patch Changes

- e03cacd: updating dependencies and republish software
- Updated dependencies [e03cacd]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.single-cell-scripts@1.1.2

## 2.10.0

### Minor Changes

- b334fd0: Aggregated column "Number Of Samples" added to per-clonotype output
  Exported clonotypes are limited only to productive & full-receptor

## 2.9.0

### Minor Changes

- 1de5b81: MiXCR upgrade to increase export process memory

## 2.8.2

### Patch Changes

- e84b4df: SDK upgrade to fix empty tables issues & minor corrections to column generation logic

## 2.8.1

### Patch Changes

- f838dd2: Remove CDR3 length column from output

## 2.8.0

### Minor Changes

- 22a4bd4: passing library into exportClones template

## 2.7.0

### Minor Changes

- a3d8933: ampliseq preset bug correction

## 2.6.1

### Patch Changes

- 24b689b: Fixes spec for mutation columns (adds pl7.app/vdj/gene domain to make column ids for V and J genes distinguishable)

## 2.6.0

### Minor Changes

- 4b789fc: Added CDR3 length; removed unnecessary columns; removed pf from outputs

## 2.5.1

### Patch Changes

- fedc4ee: Added clonotype key label column for bulk data
- Updated dependencies [fedc4ee]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.single-cell-scripts@1.1.1

## 2.5.0

### Minor Changes

- 8643dbf: Output column signeture refactoring:
  - chain and receptor information moved to clonotype key axis
  - clonotypingRunId domain also moved to clonotype key axis

## 2.4.1

### Patch Changes

- cd6367a: Added UI control to select receptor or chain

## 2.4.0

### Minor Changes

- 46dd332: Update value options in Productive column

## 2.3.3

### Patch Changes

- 675cd29: Fix for output column domains, ordering and visibility

## 2.3.2

### Patch Changes

- 43d3a75: updated MiXCR

## 2.3.1

### Patch Changes

- e108f59: Dependency upgrade
- Updated dependencies [e108f59]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.single-cell-scripts@1.1.0

## 2.3.0

### Minor Changes

- 71e5326: Full SC data suppport

### Patch Changes

- Updated dependencies [71e5326]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.single-cell-scripts@1.0.2

## 2.2.2

### Patch Changes

- eeed3eb: Allow N/A in topChain

## 2.2.1

### Patch Changes

- 40f2800: MiXCR upgrade, higher memory limit in export

## 2.2.0

### Minor Changes

- 4b82d2d: Source domain for output columns changed from pl7.app/blockId to pl7.app/vdj/clonotypingRunId

## 2.1.1

### Patch Changes

- aed9be8: Fixes trace information propagation
  Enhances export specifications by adding block and segment annotations
  Updates abundance labels
  Refines chain names in the model

## 2.1.0

### Minor Changes

- a168fe3: pl7.app/abundance/isPrimary and pl7.app/isAnchor annotations added to the output columns

## 2.0.1

### Patch Changes

- 6c45177: Chain is added to output columns domain
- Updated dependencies [6c45177]
  - @platforma-open/milaboratories.mixcr-clonotyping-2.sc-clonotype-builder@1.0.1

## 2.0.0

### Major Changes

- f3e6573: First build of MiXCR Clonotyping 2
  - clonotypeKey based output

## 1.15.0

### Minor Changes

- 5ca4eb7: Check if custom library json file gzipped or not
- a4dc2aa: Columns annotation for descrete filtering

## 1.14.1

### Patch Changes

- b049d9d: SDK upgrade to fix sporadic validation errors in workflow execution

## 1.14.0

### Minor Changes

- c6b6860: library added to processColumns in precess tpl

## 1.13.0

### Minor Changes

- 95a3ac2: Migration to AggregateV2 API

## 1.12.0

### Minor Changes

- db3cc0a: Custom reference library from library builder block or file

## 1.11.0

### Minor Changes

- 53900ff: productive feature bug correction

## 1.10.0

### Minor Changes

- 8652c07: new columns added

## 1.9.8

### Patch Changes

- 9454329: Update ui-vue to 1.21.21, model to 1.21.20

## 1.9.7

### Patch Changes

- e1fe8bf: revert exec braces

## 1.9.6

### Patch Changes

- a6f9198: wf: escape braces or else backend will try to eval these expressions and fail with error

## 1.9.5

### Patch Changes

- 02b681a: use PlChartStackedBar component

## 1.9.4

### Patch Changes

- 2fbd0c8: Update workflow-sdk to new version (better deduplication and recovery)

## 1.9.3

### Patch Changes

- b2bf6b4: Fix for presets undefined assemlingFeature (i.e. rna-seq)

## 1.9.2

### Patch Changes

- 87757bd: SDK upgrade

## 1.9.1

### Patch Changes

- 54155d9: SDK upgrade
- 54155d9: Export clns column label correction

## 1.9.0

### Minor Changes

- 9ccb1fd: Support of trace annotations; SDK upgrade

## 1.8.2

### Patch Changes

- 1f25d8e: Output colums ordering. SDK upgrade, preset list fixes.

## 1.8.1

### Patch Changes

- af5b969: Fix for blinking dropdowns, align reports are now loaded as soon as possible, migration to new SDK.

## 1.8.0

### Minor Changes

- e6fb4f5: Fasta input support. Major SDK upgrade.

## 1.7.0

### Minor Changes

- fddc283: - Cache MiXCR results for 48h
  - Migrate to new pfconv params & fix columns

## 1.6.2

### Patch Changes

- 204e8ff: Fix alphabet annotation

## 1.6.1

### Patch Changes

- 87eb0db: WF SDK Upgrade, PFrames export fix
- dc4c8c7: SDK upgrade

## 1.6.0

### Minor Changes

- 6ac0c86: "pl7.app/table/visibility" & "pl7.app/table/orderPriority" annotations added to export columns
- abd805e: Fix for export table columns for single-cell results

### Patch Changes

- 6ac0c86: Fix for dense annotation

## 1.5.1

### Patch Changes

- 6c574ab: SDK upgrade

## 1.5.0

### Minor Changes

- ba1094c: Multilate fastq support.

## 1.4.1

### Patch Changes

- 4e79c1d: Preset file support & SDK upgrade

## 1.4.0

### Minor Changes

- 5238326: Now block exports \*.assembledCells.clns for presets where cell assembly is applied to the data

### Patch Changes

- 5238326: SDK upgrade

## 1.3.0

### Minor Changes

- 50f6bae: mixcr software upgrade, new version should allocate 85% of available memory in container environment

### Patch Changes

- 11af733: workflow: bump wf, fix paths on windows in workdir lib
- 797f5bf: all preset-export / -list mixcr commands moved to ui execution queue to prevent blocking of initial execution setup and subsequent online deduplication

## 1.2.1

### Patch Changes

- 9a99a0d: SDK upgrade
- 9a99a0d: fixes error when using presets with floating assembling features

## 1.2.0

### Minor Changes

- ffe5dc0: - Update Platforma SDK
  - Fix block deduplication bug
  - Better styles for the table component
  - Fix annotation of export counts
  - Fix chain axis nature (scaleCompatible)

## 1.1.4

### Patch Changes

- 4b70a39: chore: fix software.mixcr pkg name

## 1.1.3

### Patch Changes

- be26771: Pass MI_LICENSE secret to mixcr commands

## 1.1.2

### Patch Changes

- Logo update

## 1.1.1

### Patch Changes

- 99b1a7f: SDK upgrade & secrets API usage in workflow

## 1.1.0

### Minor Changes

- db5308b: migration to pl-open

## 1.0.1

### Patch Changes

- 3a4df33: Initial release
