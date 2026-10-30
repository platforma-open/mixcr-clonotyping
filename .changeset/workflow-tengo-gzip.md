---
'@platforma-open/milaboratories.mixcr-clonotyping-2': patch
---

Update workflow-tengo to 6.17.3 (ptabler 2.3.0). The SDK sends the ptabler workflow as gzip-compressed JSON, so a run with many samples no longer fails with "grpc: received message larger than max".
