---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Tolerate zero-byte upstream MiXCR output across every ptabler read of MiXCR-produced TSVs. Previously these reads crashed with an opaque `polars.exceptions.NoDataError: empty CSV` whenever MiXCR emitted a 0-byte file (rare upstream failure mode, e.g. MiXCR JVM dying after the output file handle is opened but before any bytes are flushed). Now they use the new `raiseIfEmpty: false` option together with a complete declared schema, so the affected chain / sample yields an empty-but-valid result instead of a confusing cascade. Applied to the bulk and single-cell paths in `mixcr-export`, the per-sample reads in `aggregate-by-clonotype-key`, and `process-single-cell`.

Requires `@platforma-sdk/workflow-tengo` and `@platforma-open/milaboratories.software-ptabler` with the matching `raiseIfEmpty` support.
