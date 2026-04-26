---
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': patch
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': patch
---

Input dropdown now requires a `pl7.app/sampleId` axis on the dataset — multiplexed (pre-demux) datasets, which carry a `pl7.app/sampleGroupId` axis instead, no longer appear as valid inputs.

When the dropdown would be empty, the settings panel now shows an inline hint:
- multiplexed FASTQ detected → suggest adding a `FASTQ Demultiplexing` block;
- no FASTQ at all → suggest adding/running a `Samples & Data` block.
