---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Analyze counts input size once when sizing its memory request, cutting a 110 GiB
preset with 31.75 GiB of reads from 237 GiB to 127 GiB.

The per-analysis baseline — 64 GiB, or 110 and 192 GiB for contig/cell and MiTool
presets — is already a total-memory value for the run, so adding a size-derived term
on top of it counted the input twice. The request is now
`clamp(4 x size, baseMemGiB, 256 GiB)`, making the baseline the lower bound it was
always meant to be. Small inputs still receive the full baseline, and both the
256 GiB cap and the "Advanced Settings" memory override behave as before.

The analyze template's `hash_override` UUID also changes, which forces a one-time
recompute of cached analyze results.
