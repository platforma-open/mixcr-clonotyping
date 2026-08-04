---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size the exportClones execs from the .clns instead of a flat 12 GiB

`exportClones` was requesting a constant 12 GiB (or `perProcessMemGB / 4`),
which has no relationship to what the command actually holds in memory. It
reads the entire CloneSet into heap, and for single-cell exports it then
materialises a second, expanded list — one clone per (clonotype × cell), each
with its own split TagCount — which it sorts and re-ranks before writing. The
`--chains` filter is applied only after that division, so exporting one chain
group still pays the whole-file cost.

With the `memory-from-limits` entrypoint a 12 GiB grant yields only 8788 MiB of
heap (flat 3500 MiB non-heap reserve), and that was not enough for a 10.7k-cell
/ 26.7k-clone 10x BCR sample — `exportClones` failed with `OutOfMemoryError`,
taking the `clonotypes`, `clonotypeTables` and `qcReportTable` outputs with it.

- RAM is now `clamp(perByte × size(clns), floor, 128 GiB)` — floor/slope 16 GiB
  and 16 for the bulk export, 32 GiB and 32 for the single-cell export, which
  pays the per-cell division multiplier.
- An Advanced Settings memory override is now used as-is rather than being
  quartered, matching how the analyze step treats the same setting. Projects
  that set it will request 4× more for the export step than before.
- The two PTabler steps are no longer sized off the mixcr step's budget; they
  are left unsized so workflow-tengo 6.8's built-in input-volume formula
  applies, as it already does for the rest of the single-cell pipeline.
