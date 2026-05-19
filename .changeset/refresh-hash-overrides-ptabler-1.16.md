---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Refresh `hash_override` UUIDs on three workflow templates so their resource identity changes when the underlying ptabler-driven `:pt` API changes its on-disk output.

Affected:
- `workflow/src/aggregate-by-clonotype-key.tpl.tengo`
- `workflow/src/process-single-cell.tpl.tengo`
- `workflow/src/mixcr-export.tpl.tengo`

Each of these imports `@platforma-sdk/workflow-tengo:pt` and therefore goes through `pt.workflow-run` / `pt.import-dir`. With `@platforma-open/milaboratories.software-ptabler` 1.16.0 → 2.0.0 (in `@platforma-sdk/workflow-tengo`), the parquet bytes emitted by `WriteFrame` and the `numberOfBytes` recorded in `DataInfo` change for identical input data. Without refreshing the hash_override UUID, callers would dedupe by the locked identity and reuse pre-bump cached resources whose CIDs no longer match the new output.

Templates that do not import `:pt` (e.g. `mixcr-analyze.tpl.tengo`) are unaffected and intentionally keep their existing UUIDs.
