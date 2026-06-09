---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Size MiXCR analyze memory from the input reads' line count on top of the per-analysis floor. The per-analysis baseline (64 / 110 / 192 GiB for default / contig-cell / single-cell+MiTool) stays as a floor; memory then grows linearly with the R1+R2 FASTQ line count (32 bytes per line), clamped to 256 GiB. Keying on line count (not compressed byte size) makes the request compression-independent. The explicit "Advanced Settings" memory override is unchanged; on backends that can't evaluate resource formulas the baseline is the static fallback.
