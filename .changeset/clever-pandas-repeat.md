---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size the QC exportClones steps from the .clns

The QC report runs `exportClones` twice more per sample — once for the bulk out-of-frame /
stop-codon counts and once per chain in single-cell mode — and both asked for a flat 16 GiB.
`exportClones` loads the whole CloneSet and applies `--chains` after the load, so those runs
cost what the main clonotype export costs; only the column list is smaller. On a large `.clns`
they OOM at the 12.8 GiB heap the `main` entrypoint hands the JVM out of 16 GiB, while the main
export beside them now gets a request sized from the file.

Both now use the same rule as the main export, moved into `:mem-formula` as `exportRam`:

    ram = clamp(8 GiB + perByte x size(clns), floorGiB, 256 GiB)

with `floorGiB` 24 and `perByte` 30. The report template also moves from the `main` MiXCR
entrypoint to `memory-from-limits`, which every other template in the block already uses. The
entrypoint sets the heap fraction the JVM gets, so one entrypoint means one coefficient.

The `perProcessMemGB` override now raises the floor instead of replacing the rule. A project
that set it below the floor requested that value and OOMed; a value below the floor now has no
effect, and the data term still applies above one above it. This is how
`aggregate-by-clonotype-key` already treats the same override. An override above the 256 GiB
cap also raises the cap — `between()` asserts `lo <= hi`, so a floor raised past a fixed cap
would have failed the step outright rather than clamped.
