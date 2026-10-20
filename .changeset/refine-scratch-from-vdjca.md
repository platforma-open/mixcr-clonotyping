---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

`refineTagsAndSort` sizes its scratch space from the `.vdjca` it sorts: `max(reads request, 4 + 12 x vdjca GiB)`. Its temporary files track the alignments, not the reads, so small samples could run out of disk in the final sort.
