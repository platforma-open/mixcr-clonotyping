---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: the aggregation shard grant ignores `perProcessMemGB`

A shard's grant is already the larger of 64 GiB and its need computed from the bytes it
keeps, so the override cannot help it and only reduces how many shards run at once. It
still raises the single unsharded run taken when the backend cannot report blob sizes,
and it still applies to the MiXCR steps.
