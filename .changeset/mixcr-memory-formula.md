---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Size MiXCR analyze memory from the input reads' file size on top of the per-analysis floor. The per-analysis baseline (64 / 110 / 192 GiB for default / contig-cell / single-cell+MiTool) stays as a floor; memory then grows linearly with the R1+R2 FASTQ blob size (4 bytes of RAM per byte), clamped to 256 GiB. File size is read from blob metadata (getBlobSize) with no pre-exec. The explicit "Advanced Settings" memory override is unchanged; on backends that can't evaluate resource formulas the baseline is the static fallback.
