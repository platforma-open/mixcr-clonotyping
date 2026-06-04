---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Size MiXCR memory from the input reads instead of a fixed per-analysis tier. The per-analysis baseline (64 / 110 / 192 GiB) becomes a floor; the request grows with compressed FASTQ size and is clamped to 256 GiB. The explicit "Advanced Settings" memory override is unchanged, and on backends without `getBlobSize` the baseline is used as a static fallback.

Requires a `@platforma-sdk/workflow-tengo` release with the `exec.formula` / `memFormula` resource-formula API.
