---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Analyze memory request no longer double-counts input size on top of the memory floor.

The per-analysis baseline (64 / 110 / 192 GiB) is already a total-memory value for
the run, so adding a size-derived term on top of it counted the input twice — a
110 GiB preset with 31.75 GiB of reads asked for 237 GiB instead of 127 GiB. The
request is now `clamp(4 x size, baseMemGiB, 256 GiB)`: the baseline acts purely as
the lower bound it was always meant to be. Small inputs still get the full floor,
and the 256 GiB cap and the "Advanced Settings" override are unchanged.

The formula moved into a `mem-formula` library covered by unit tests, and the
analyze template's `hash_override` UUID was bumped — that forces a one-time
recompute of cached analyze results.
