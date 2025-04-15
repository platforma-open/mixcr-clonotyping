# @platforma-open/milaboratories.mixcr-clonotyping.workflow

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
