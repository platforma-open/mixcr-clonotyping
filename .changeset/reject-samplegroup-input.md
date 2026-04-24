---
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': patch
---

Input dropdown now requires a `pl7.app/sampleId` axis on the dataset — multiplexed (pre-demux) datasets, which carry a `pl7.app/sampleGroupId` axis instead, no longer appear as valid inputs. This block only supports sample-axis data, and picking a multiplexed dataset would break downstream processing.
