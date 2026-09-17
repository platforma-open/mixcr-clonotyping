---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size the QC exportClones steps from the .clns

The QC report runs `exportClones` twice more per sample — once for the bulk out-of-frame /
stop-codon counts and once per chain in single-cell mode — and both asked for a flat 16 GiB.
`exportClones` loads the whole CloneSet and applies `--chains` after the load, so those runs
cost what the main clonotype export costs; only the column list is smaller. On a large `.clns`
they OOM at the 13.1 GiB heap the `main` entrypoint hands the JVM out of 16 GiB, while the main
export beside them now gets a request sized from the file.

Both now use the same rule as the main export, moved into `:mem-formula` as `exportRam`:

    ram = clamp(8 GiB + perByte x size(clns), 16 GiB, 256 GiB)

The report template also moves from the `main` MiXCR entrypoint to `memory-from-limits`, which
every other template in the block already uses. The entrypoint decides the heap fraction the
JVM gets, so one entrypoint means one coefficient for the whole block.

Two related fixes:

- The "memory per process" Advanced Settings override now reaches the QC exports. It was never
  passed to the report template, so it could not be used to work around this by hand.
- The report's PTabler workflow dropped its flat 8 GiB / 2 CPU request and is now sized by
  workflow-tengo from its own input volume. It frames every sample's clonotype TSV, every
  per-sample filter TSV and every single-cell chain TSV, so its cost scales with the cohort.

The override itself is now floored. `perProcessMemGB` replaced the export rule outright, so a
project that set it below the floor requested that value and OOMed, and passing the override
into the QC exports would have carried the same value into steps that previously ignored it.
It is now `max(override, floor)`, which is how `aggregate-by-clonotype-key` already treats it.

The report PTabler keeps its flat 8 GiB. Sizing it from its input volume needs a formula to
cross a metaInputs boundary into the pt run template, which no block does today, and the SDK
rule reads stored bytes while cost there also tracks the number of frames and joins. It stays
on the list of flat requests to size properly, with the seven Xsv imports in process.tpl.tengo.

The override raises the floor rather than replacing the rule. A value below the floor now has
no effect, and the data term still applies above a value above it.

An override above the 256 GiB cap raises the cap. `between()` asserts `lo <= hi`, so a floor
raised past a fixed cap would have panicked instead of clamping. One real project sets 400.
