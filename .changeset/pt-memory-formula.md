---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size single-cell PTabler steps by input volume

Bump @platforma-sdk/workflow-tengo to 6.8.2. The single-cell pipeline's
unsized `pt.workflow()` steps (cell grouping, output processing, SHM) now
request CPU/RAM from the built-in input-size formula instead of the backend
default, fixing out-of-memory failures on large datasets.
