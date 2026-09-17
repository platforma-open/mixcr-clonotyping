---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

fix: floor the export memory override, and let the 3.28.3 export sizing reach existing projects

Two defects, both reached through the same step. A customer's `exportClones` ran on a
5 GiB grant, which the `memory-from-limits` entrypoint turns into `-Xmx2560m`, and died
with `OutOfMemoryError`.

- **The Advanced Settings memory override had no floor on the export.** Since 3.28.3 it
  was passed to `exportClones` verbatim. "Set memory per every sample process (GB)" is a
  whole-analysis number — it also sizes `mixcr analyze` — but `exportClones` reads the
  entire CloneSet into heap and needs its own minimum regardless of what the analysis was
  asked to fit in. A modest override therefore requested less than the formula's floor;
  before 3.28.3 the same input was floored at 12 GiB. The override now raises the request
  and never lowers it below the floor (16 GiB bulk, 24 GiB single-cell). Large overrides
  are unaffected.

- **The template's `hash_override` UUID was never bumped.** The export template's identity
  is that UUID, not its source: the compiled template hangs off a Service field, which does
  not contribute to the resource CID. Neither 3.28.3's `.clns`-derived sizing nor a changed
  memory setting — which rides as a `metaExtra` input, excluded from deduplication by
  design — changed the step's identity, so any project that had already run the export kept
  its first render and the grant that came with it. Upgrading the block could not help.
  The UUID now changes, which forces a one-time recompute of cached export results.
