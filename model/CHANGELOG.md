# @platforma-open/milaboratories.mixcr-clonotyping.model

## 1.27.2

### Patch Changes

- 32eb93e: SDK Update

## 1.27.1

### Patch Changes

- e0d7d85: fix: label fields made optional

## 1.27.0

### Minor Changes

- 6e46692: Allow single-cell VHH data analysis

## 1.26.0

### Minor Changes

- 1ed23a7: Add "Impute non-covered parts from germline" option for generic amplicon presets. When enabled, the block exports additional germline-imputed sequence columns for the gene-feature regions outside the assembling feature span (plus the full VDJRegion), reconstructing non-covered parts from the assigned V/J germline. Imputed sequences are not used for clonotype assembly. The option is shown only for presets that expose "Assemble clones by".

## 1.25.2

### Patch Changes

- 06c863f: Input dropdown now requires a `pl7.app/sampleId` axis on the dataset — multiplexed (pre-demux) datasets, which carry a `pl7.app/sampleGroupId` axis instead, no longer appear as valid inputs.

  When the dropdown would be empty, the settings panel now shows an inline hint:

  - multiplexed FASTQ detected → suggest adding a `FASTQ Demultiplexing` block;
  - no FASTQ at all → suggest adding/running a `Samples & Data` block.

## 1.25.1

### Patch Changes

- 6383f7a: Fix issue with sample label loader animation

## 1.25.0

### Minor Changes

- 9f6939b: Add Preview run mode to quickly validate settings on a fraction of reads before committing to a full analysis
  Update BlockModel to BlockModelV3
  Fix preset list not loading: args() now returns undefined instead of throwing when block is not yet configured, allowing the prerun to run independently of main args validation

## 1.24.1

### Patch Changes

- 6f30f09: Upgrade MiXCR to 4.7.0-300-develop, add MI_LICENSE_DEBUG env, fix assembleCells column error in SC QC report, show loading spinner while sample list loads

## 1.24.0

### Minor Changes

- 3c8ed71: stop codon replacement and dep updates

## 1.23.0

### Minor Changes

- 984f9d8: Support custom block title and running status

## 1.22.0

### Minor Changes

- 4f376a4: Columns with number of clonotypes dropped due stop codon or oof added to qc table. Dependencies updates

## 1.21.0

### Minor Changes

- 070fc0b: Min quality checkbox, refactored error correction, dep updates

## 1.20.0

### Minor Changes

- d9fe76f: Make receptors required from custom preset

## 1.19.0

### Minor Changes

- 480dfc5: generic presets added

## 1.18.2

### Patch Changes

- 40d9788: Update dependencies including MiXCR

## 1.18.1

### Patch Changes

- 4809b76: technical release

## 1.18.0

### Minor Changes

- 4fcd94b: relaxed mixcr assemble parameters for high diversity datasets

## 1.17.3

### Patch Changes

- a5e2509: sdk update

## 1.17.2

### Patch Changes

- 4c42a7a: Fix [blocks/mixcr-clonotyping] in the end of calculations results table starts to blink

## 1.17.1

### Patch Changes

- c337aa2: Fix [sdk/ui] Broken error propagation: block errors are not showing anymore

## 1.17.0

### Minor Changes

- dde56a2: Raw results export

## 1.16.2

### Patch Changes

- 0f20633: migrate to ts-builder

## 1.16.1

### Patch Changes

- 093974b: updating dependencies

## 1.16.0

### Minor Changes

- 9c3eda0: - Fix for block upgrade error, not able to show absent report table from previous results
  - Fix for region_not_covered error in junction length

## 1.15.0

### Minor Changes

- 78e7e7b: New section with QC report table

## 1.14.2

### Patch Changes

- 37f37ee: Updated SDK

## 1.14.1

### Patch Changes

- 8d013c1: Update sdk (use api v2)

## 1.14.0

### Minor Changes

- 4d7746d: Cell Linker Column & SDK Upgrade

## 1.13.1

### Patch Changes

- 63a2a9d: Update sdk: fix slide panel closing when modal dialog window is clicked (MILAB-3495 [blocks/mixcr-clonotyping] can’t upload custom preset by choosing file)

## 1.13.0

### Minor Changes

- a65fef4: Custom settings for memory and CPU count added

## 1.12.1

### Patch Changes

- c983163: SDK upgrade

## 1.12.0

### Minor Changes

- c58e60e: SDK Upgrade

## 1.11.2

### Patch Changes

- 1ca5594: Another memory requesting optimization

## 1.11.1

### Patch Changes

- fdf3e57: SDK Upgrade to fixed redundant partitioning of exports

## 1.11.0

### Minor Changes

- b1f6427: species added, visibility of chain columns set to optional, mixcr updated to 4.7.0-164-develop

## 1.10.2

### Patch Changes

- 90a29d2: SDK upgrade

## 1.10.1

### Patch Changes

- e03cacd: updating dependencies and republish software

## 1.10.0

### Minor Changes

- 4b789fc: Added CDR3 length; removed unnecessary columns; removed pf from outputs

## 1.9.2

### Patch Changes

- cd6367a: Added UI control to select receptor or chain

## 1.9.1

### Patch Changes

- e108f59: Dependency upgrade

## 1.9.0

### Minor Changes

- b5204ea: Adding chains to BlockArgs

## 1.8.1

### Patch Changes

- 3e7235c: Chains arg added to model

## 1.8.0

### Minor Changes

- 5ca4eb7: Check if custom library json file gzipped or not

## 1.7.0

### Minor Changes

- a370729: Custom library species corrected

## 1.6.0

### Minor Changes

- db3cc0a: Custom reference library from library builder block or file

## 1.5.1

### Patch Changes

- 392d6f3: Add and use @platforma-sdk/eslint-config package (MILAB-1128)

## 1.5.0

### Minor Changes

- 8652c07: new columns added

## 1.4.4

### Patch Changes

- 9454329: Update ui-vue to 1.21.21, model to 1.21.20

## 1.4.3

### Patch Changes

- 02b681a: use PlChartStackedBar component

## 1.4.2

### Patch Changes

- 87757bd: SDK upgrade

## 1.4.1

### Patch Changes

- 54155d9: SDK upgrade

## 1.4.0

### Minor Changes

- 9ccb1fd: Support of trace annotations; SDK upgrade

### Patch Changes

- 53d545e: Fix for empty chain name in report

## 1.3.2

### Patch Changes

- 1f25d8e: Output colums ordering. SDK upgrade, preset list fixes.

## 1.3.1

### Patch Changes

- af5b969: Fix for blinking dropdowns, align reports are now loaded as soon as possible, migration to new SDK.

## 1.3.0

### Minor Changes

- e6fb4f5: Fasta input support. Major SDK upgrade.

## 1.2.1

### Patch Changes

- dc4c8c7: SDK upgrade

## 1.2.0

### Minor Changes

- abd805e: Fix for export table columns for single-cell results

## 1.1.9

### Patch Changes

- 6c574ab: SDK upgrade

## 1.1.8

### Patch Changes

- 4e79c1d: Preset file support & SDK upgrade

## 1.1.7

### Patch Changes

- 5238326: SDK upgrade
- 5238326: Fix for reports for shotgun-type data where TRAD pseudo-chain may appear in alignment reports

## 1.1.6

### Patch Changes

- 9a99a0d: SDK upgrade
- 9a99a0d: fixes absence of mitool-based presets

## 1.1.5

### Patch Changes

- Logo update

## 1.1.4

### Patch Changes

- 9dc0ce6: update Quality Checks section

## 1.1.3

### Patch Changes

- cf5a66a: add visual reports

## 1.1.2

### Patch Changes

- 11fbc06: progress cell v1

## 1.1.1

### Patch Changes

- 99b1a7f: SDK upgrade & secrets API usage in workflow

## 1.1.0

### Minor Changes

- db5308b: migration to pl-open

## 1.0.1

### Patch Changes

- 3a4df33: Initial release
