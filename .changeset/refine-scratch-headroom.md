---
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Size MiXCR scratch space at four bytes per base of the read pair instead of two. `refineTagsAndSort` ran out of temporary disk during its final sort on 10x 5' BCR samples granted 32 GiB.
