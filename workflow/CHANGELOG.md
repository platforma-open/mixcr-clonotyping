# @platforma-open/milaboratories.mixcr-clonotyping.workflow

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
