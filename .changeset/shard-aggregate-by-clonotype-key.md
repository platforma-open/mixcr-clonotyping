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

The shard count is chosen from the input volume. The template reads the blob size of every
input TSV through the backend's `getBlobSize` (the same call `f.size()` resolves through) and
takes the smallest shard count whose largest shard stays under 64 GiB at 6 GiB of RAM per GiB
of TSV plus a 2 GiB intercept -- the concat + `maxBy` law measured under MILAB-6874 (4.94 at
eight threads), at the slope the SDK's default ptabler sizing uses. The memory override raises
every shard's grant but never the shard count: a request the backend cannot satisfy is clamped
without notice, so a larger target would only recreate the single oversized run. Each shard
runs on 8 cores. A backend without `getBlobSize` gets a single shard.

The `byCloneKey` Parquet import that follows was a flat 24 GiB, which the measured `write_frame`
law (`4.13 x^0.68` GiB for x GiB of TSV) says holds about 13 GiB of aggregated TSV. Its memory
is now left to the SDK, which sizes the ptabler run from the blob size of the aggregated TSV
(`2 GiB + 4 x size`, capped at 64 GiB in workflow-tengo 6.10.5, above the measured need at
every size it can express). The memory override, when set, replaces the formula.

The six other Parquet imports of the block had flat grants of 12, 16 or 24 GiB: the per-sample
`byCloneKeyBySample` table and the single-cell abundance, aggregates, properties, cell-linker
and SHM tables. A 16 GiB grant holds about 7 GiB of TSV under the same law, and one deep sample
can export twice that. Their memory is now left to the same SDK sizing.

The QC report run in `export-report` framed every sample's full clonotype TSV and every filter
TSV in one 8 GiB ptabler run to count clonotypes, reads, out-of-frame and stop-codon clones per
sample. Those counts are now computed by one small ptabler run per sample, each reading only
that sample's files and writing a one-row table; the cohort run frames those rows and the qc
report, so its input no longer grows with the clonotype or cell count. In single-cell mode the
per-sample run also computes that sample's cell-pairing statistics from its single-cell chain
TSVs. The `exportClones` filter runs are unchanged.

The single-cell per-cell preprocessing run asked for one core and one GiB per sample, with
floors of 16 and 32. Its memory is now left to the SDK, which sizes the run from the blob size
of its input TSVs, and its cpu is pinned at 8, the thread count that formula assumes.

The hash override of `aggregate-by-clonotype-key` is new, so a failed aggregation is not
recovered from its old identity.
