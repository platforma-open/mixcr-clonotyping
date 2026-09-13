---
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Analyze no longer passes `--use-local-temp`. The SDK now guarantees a temporary
directory on every backend the block can meet, so MiXCR keeps its temporary files
off the working directory on shared storage in all cases.
