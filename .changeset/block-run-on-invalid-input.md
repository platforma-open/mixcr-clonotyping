---
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.model": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.ui": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Keep Run disabled while the selected input dataset is not available, e.g. deleted upstream, instead of failing with "key axesSpec not found". The selection is kept and marked as not available. A run started without the block page open now fails with the missing dataset named.
