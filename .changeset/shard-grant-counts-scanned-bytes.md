---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size an aggregation shard from the bytes it scans, not the bytes it keeps

Every shard frames all input TSVs and filters them to its own letters, so each one reads the
whole cohort however many shards there are. The plan sized the grant from a shard's share
alone, which understates the need by the cost of the scan. Measured at 1.0 GiB of RAM per GiB
scanned, taken as 1.5 for margin; the group-by term over the kept rows is unchanged.

A cohort large enough that the scan term alone passes the 64 GiB target now takes all 26
shards and requests what it needs, rather than 26 shards that each fit on paper and are
killed in practice.
