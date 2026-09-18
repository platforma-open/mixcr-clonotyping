---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: aggregate the cohort clonotype table in shards

`aggregate-by-clonotype-key` groups every sample's clonotype rows by `clonotypeKey` and keeps,
per column, the value from the most abundant sample. ptabler lowers that `maxBy` to
`top_k_by(k=1).first()`, which polars runs as an in-memory group-by, so one run held every
group of the cohort at once. The peak followed the number of input rows and no grant could
change it: a 113-sample, 130 M-clonotype cohort needed on the order of 500 GiB and was killed
at whatever the cluster's ceiling was. The step also asked for `max(samples, 32)` cores, and the
memory need of this plan shape rises with the polars thread count.

The aggregation now runs in shards. Rows are bucketed by the first letter of `clonotypeKey`
after digits are removed, upper-cased — the same first letter the clonotype label's five-letter
prefix uses — so every key lands in exactly one shard, every group is complete inside its shard
and the label is computed per shard. The shard outputs are disjoint and a final streaming run
concatenates them. A cohort small enough for one shard runs unfiltered, as before.

The shard count is chosen from the measured row count. `aggregate-by-clonotype-key` now counts
the lines of every input TSV with the SDK line-counter and renders
`aggregate-by-clonotype-key-shards` with the counts; the plan takes the smallest shard count
whose largest shard stays under the target grant, at 4 KiB of RAM per row and a 2 GiB
intercept (the concat + maxBy law measured under MILAB-6874, at 0.5 KiB per exported row). The
target is 64 GiB, or the memory override when higher. Each shard runs on 8 cores.

The `byCloneKey` Parquet import that follows was a flat 24 GiB, which the measured `write_frame`
law says holds about 13 GiB of aggregated TSV. It is now 64 GiB, or the memory override when
higher, which holds about 56 GiB.

The QC report run in `export-report` framed every sample's full clonotype TSV and every filter
TSV in one 8 GiB ptabler run to count clonotypes, reads, out-of-frame and stop-codon clones per
sample. Those counts are now computed by one small ptabler run per sample, each reading only
that sample's files and writing a one-row table; the cohort run frames those rows and the qc
report, so its input no longer grows with the clonotype count. The `exportClones` filter runs
are unchanged. In single-cell mode the cell-pairing statistics still read the single-cell chain
TSVs in the cohort run.

The hash override of `aggregate-by-clonotype-key` is new, so a failed aggregation is not
recovered from its old identity.
