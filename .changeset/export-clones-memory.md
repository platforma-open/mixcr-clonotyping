---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size the exportClones execs from the .clns instead of a flat 12 GiB

`exportClones` requested a constant 12 GiB (or `perProcessMemGB / 4`) — a number
unrelated to what the command holds in memory. It reads the entire CloneSet into
heap, and single-cell exports then materialise a second, expanded list — one clone
per (clonotype × cell), each with its own split TagCount — then sort and re-rank it.
`--chains` filters only after that division, so exporting one chain group still pays
the whole-file cost.

Under the `memory-from-limits` entrypoint a 12 GiB grant yields 8788 MiB of heap,
because the non-heap reserve is a flat 3500 MiB. A 10.7k-cell / 26.7k-clone 10x BCR
sample exhausted it: `exportClones` died with `OutOfMemoryError`, taking the
`clonotypes`, `clonotypeTables` and `qcReportTable` outputs with it.

- RAM is now `clamp(perByte × size(clns), floor, 128 GiB)` — 16 GiB and 16× for the
  bulk export, 32 GiB and 32× for the single-cell export, which pays the per-cell
  expansion.
- An Advanced Settings memory override now applies as-is rather than quartered,
  matching how the analyze step treats the same setting. Projects that set it will
  request 4× more for the export step than before.
- The two PTabler steps now inherit workflow-tengo 6.8's built-in input-volume
  formula, as the rest of the single-cell pipeline already does. They previously took
  ⅔ of the mixcr step's budget.
