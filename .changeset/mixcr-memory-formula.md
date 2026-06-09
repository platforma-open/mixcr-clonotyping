---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Size MiXCR analyze memory from the input reads' line count instead of a fixed tier. Memory scales linearly with the R1+R2 FASTQ line count — a 4 GiB floor plus 32 bytes per line — clamped to 256 GiB. Keying on line count (not compressed byte size) makes the request compression-independent. The explicit "Advanced Settings" memory override is unchanged; on backends that can't evaluate resource formulas the fallback is used.
